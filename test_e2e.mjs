import http from "http";

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOpts = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || "GET",
      headers: options.headers || {}
    };

    const req = http.request(reqOpts, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({ status: res.statusCode, body, json });
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log("=== STARTING SMART STREETLIGHT DASHBOARD FINAL E2E TEST SUITE ===");

  // Reset database to ensure clean state
  await request("http://localhost:5000/api/simulation/reset", { method: "POST" });

  // 1. Verify single link HTTP server
  console.log("\n1. Testing single link server at http://localhost:5000...");
  const rootRes = await request("http://localhost:5000/");
  if (rootRes.status === 200 && rootRes.body.includes("<html")) {
    console.log("   ✓ Root URL serves single integrated application HTML");
  } else {
    throw new Error(`Failed: Root URL status ${rootRes.status}`);
  }

  // 2. Verify initial zero demo complaints and feedback
  console.log("\n2. Verifying clean state (no demo complaints or feedback)...");
  const initCompRes = await request("http://localhost:5000/api/complaints");
  console.log(`   Initial complaints count: ${initCompRes.json.length}`);
  if (initCompRes.json.length !== 0) {
    throw new Error(`Expected 0 initial complaints, found ${initCompRes.json.length}`);
  }
  const initFbRes = await request("http://localhost:5000/api/feedback");
  console.log(`   Initial feedback count: ${initFbRes.json.length}`);
  if (initFbRes.json.length !== 0) {
    throw new Error(`Expected 0 initial feedback, found ${initFbRes.json.length}`);
  }
  console.log("   ✓ Verified 0 demo complaints and 0 demo feedback in database");

  // 3. User submits a new complaint
  console.log("\n3. Testing Common User complaint submission...");
  const newComplaintPayload = {
    streetlightId: "SL-018",
    location: "Bazaar Junction 3",
    problemType: "Flickering Light & Heavy Dimming",
    description: "Streetlight SL-018 has been flickering intermittently since last night, causing low visibility at the junction.",
    userName: "Alex Johnson",
    userEmail: "user@citylight.gov",
    userId: "usr_01"
  };

  const createCompRes = await request("http://localhost:5000/api/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, newComplaintPayload);

  if (createCompRes.status !== 201 || !createCompRes.json.id) {
    throw new Error(`Failed to create complaint: ${createCompRes.body}`);
  }
  const createdComplaint = createCompRes.json;
  console.log(`   ✓ Created Complaint ID: ${createdComplaint.id} (Status: ${createdComplaint.status})`);

  // 4. Admin updates complaint status & connected streetlight condition
  console.log("\n4. Testing Admin response & connected streetlight update...");
  const updatePayload = {
    status: "Resolved",
    adminResponse: "Dispatched Electrical Crew Alpha. Replaced faulty LED driver on pole SL-018. Luminaire fully restored.",
    streetlightStatus: "Working Normally",
    maintenanceStatus: "Resolved"
  };

  const patchRes = await request(`http://localhost:5000/api/complaints/${createdComplaint.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" }
  }, updatePayload);

  if (patchRes.status !== 200 || patchRes.json.status !== "Resolved") {
    throw new Error(`Failed to patch complaint: ${patchRes.body}`);
  }
  console.log(`   ✓ Complaint ${patchRes.json.id} updated to "Resolved" with response note`);

  // 5. Common User submits Streetlight-Specific Feedback
  console.log("\n5. Testing Common User Streetlight-Specific Feedback submission...");
  const feedbackPayload = {
    streetlightId: "SL-018",
    rating: 5,
    comment: "Streetlight SL-018 is working properly after repair. Great service!",
    complaintId: createdComplaint.id,
    userName: "Alex Johnson",
    userId: "usr_01",
    userEmail: "user@citylight.gov"
  };

  const fbPostRes = await request("http://localhost:5000/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, feedbackPayload);

  if (fbPostRes.status !== 201 || !fbPostRes.json.id) {
    throw new Error(`Failed to post feedback: ${fbPostRes.body}`);
  }
  const createdFb = fbPostRes.json;
  if (createdFb.streetlightId !== "SL-018") {
    throw new Error(`Expected streetlightId SL-018, got ${createdFb.streetlightId}`);
  }
  console.log(`   ✓ Created Feedback ID: ${createdFb.id} linked to Streetlight ${createdFb.streetlightId} (${createdFb.rating} ⭐ Stars)`);

  // 6. Admin filters Feedback by Streetlight SL-018
  console.log("\n6. Testing Admin Feedback View & Streetlight Filter (SL-018)...");
  const filteredFbRes = await request("http://localhost:5000/api/feedback?streetlightId=SL-018");
  const foundFb = filteredFbRes.json.find(f => f.id === createdFb.id);
  if (!foundFb || foundFb.rating !== 5 || foundFb.streetlightId !== "SL-018") {
    throw new Error(`Feedback for SL-018 not found in Admin streetlight filter output`);
  }
  console.log(`   ✓ Admin successfully filtered feedback by SL-018: "${foundFb.comment}" by ${foundFb.userName}`);

  // 7. Verify Common User Feedback History
  console.log("\n7. Testing Common User Feedback History...");
  const userFbRes = await request("http://localhost:5000/api/feedback?userId=usr_01");
  const userFbItem = userFbRes.json.find(f => f.id === createdFb.id);
  if (!userFbItem || userFbItem.streetlightId !== "SL-018") {
    throw new Error(`Feedback record missing from Common User history`);
  }
  console.log(`   ✓ Common User history retrieved feedback for Streetlight ${userFbItem.streetlightId}`);

  console.log("\n=== ALL FINAL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runE2ETests().catch(err => {
  console.error("\n❌ E2E TEST FAILED:", err);
  process.exit(1);
});
