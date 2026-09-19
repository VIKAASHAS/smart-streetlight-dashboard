import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { db } from "./db.js";
import { advanceSimulationCycle } from "./simulation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded complaint photos statically
const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Authentication Endpoint
app.post("/api/auth/login", (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !identifier.trim()) {
    return res.status(400).json({ error: "Please enter your username/email." });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ error: "Please enter your password." });
  }

  const user = db.authenticateUser(identifier, password, role);
  if (!user) {
    return res.status(401).json({ error: "Invalid username/email or password." });
  }

  res.json({ success: true, user });
});

// 1. Overview Status Summary
app.get("/api/status", (req, res) => {
  const lights = db.getStreetlights();
  const failures = db.getFailures();
  const stats = db.getSystemStats();
  const recentActivity = db.getRecentActivity();
  const sim = db.getSimulationState();

  const sortedByRisk = [...lights].sort((a, b) => b.riskScore - a.riskScore);
  const spotlight = sortedByRisk[0] || null;

  res.json({
    summary: stats,
    spotlight,
    failures,
    recentActivity,
    simulation: sim
  });
});

// 2. Streetlights List
app.get("/api/streetlights", (req, res) => {
  const { zone, status, risk, search } = req.query;
  let lights = db.getStreetlights();

  if (zone && zone !== "all") {
    lights = lights.filter(l => l.zone.toLowerCase() === zone.toLowerCase());
  }
  if (status && status !== "all") {
    lights = lights.filter(l => l.currentStatus.toLowerCase() === status.toLowerCase());
  }
  if (risk && risk !== "all") {
    lights = lights.filter(l => l.riskLevel.toLowerCase() === risk.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    lights = lights.filter(l =>
      l.id.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.zone.toLowerCase().includes(q)
    );
  }

  res.json(lights);
});

// 3. Streetlight Details
app.get("/api/streetlights/:id", (req, res) => {
  const light = db.getStreetlightById(req.params.id);
  if (!light) {
    return res.status(404).json({ error: "Streetlight not found" });
  }

  const relatedFailures = db.getFailures().filter(f => f.streetlightId === light.id);
  res.json({
    ...light,
    relatedFailures
  });
});

// 4. Update Streetlight
app.patch("/api/streetlights/:id", (req, res) => {
  const updated = db.updateStreetlight(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Streetlight not found" });
  }
  res.json(updated);
});

// 5. AI Spotlight Card
app.get("/api/predictions/spotlight", (req, res) => {
  const lights = db.getStreetlights();
  const sorted = [...lights].sort((a, b) => b.riskScore - a.riskScore);
  res.json(sorted[0] || null);
});

// 6. AI Prediction History
app.get("/api/predictions/history", (req, res) => {
  res.json(db.getPredictionsHistory());
});

// 7. Smart Maintenance Priority (AI Risk Based)
app.get("/api/priority-maintenance", (req, res) => {
  const lights = db.getStreetlights();
  const prioritized = [...lights]
    .filter(l => l.riskScore >= 20 || l.maintenanceStatus !== "None")
    .sort((a, b) => b.priorityScore - a.priorityScore);

  res.json(prioritized);
});

// 8. AI Failures & SL Resolution Action
app.get("/api/failures", (req, res) => {
  res.json({
    failures: db.getFailures(),
    recentActivity: db.getRecentActivity(),
    stats: db.getSystemStats()
  });
});

app.post("/api/failures/:id/action", (req, res) => {
  const { isResolved } = req.body;
  if (typeof isResolved !== "boolean") {
    return res.status(400).json({ error: "Parameter 'isResolved' (boolean) is required." });
  }

  const result = db.resolveFailure(req.params.id, isResolved);
  if (!result) {
    return res.status(404).json({ error: "Failure record not found." });
  }

  res.json({
    ...result,
    stats: db.getSystemStats(),
    recentActivity: db.getRecentActivity()
  });
});

// 9. Complaints Endpoints
app.get("/api/complaints", (req, res) => {
  const { userId } = req.query;
  res.json(db.getComplaints(userId));
});

app.post("/api/complaints", (req, res) => {
  const { streetlightId, location, problemType, description, userName, userEmail, userId, imageUrl } = req.body;
  if (!streetlightId || !problemType) {
    return res.status(400).json({ error: "Streetlight ID and Problem Type are required." });
  }

  const newComplaint = db.addComplaint({
    streetlightId,
    location: location || "Downtown Ward",
    problemType,
    description: description || "Reported by resident.",
    userName: userName || "Citizen User",
    userEmail: userEmail || "user@citylight.gov",
    userId: userId || "usr_01",
    imageUrl: imageUrl || null
  });

  res.status(201).json(newComplaint);
});

app.patch("/api/complaints/:id", (req, res) => {
  const { status, adminResponse, streetlightStatus, maintenanceStatus, repairNote } = req.body;
  const updated = db.updateComplaintStatus(req.params.id, { 
    status, 
    adminResponse, 
    streetlightStatus, 
    maintenanceStatus, 
    repairNote 
  });
  if (!updated) {
    return res.status(404).json({ error: "Complaint not found" });
  }
  res.json(updated);
});

// 10. Feedback Endpoints
app.get("/api/feedback", (req, res) => {
  const { userId, streetlightId } = req.query;
  res.json(db.getFeedback(userId, streetlightId));
});

app.post("/api/feedback", (req, res) => {
  const { rating, comment, complaintId, streetlightId, userName, userId, userEmail, streetlightLocation } = req.body;
  if (!streetlightId) {
    return res.status(400).json({ error: "Please select a streetlight." });
  }
  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ error: "Please select a star rating." });
  }
  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: "Please enter your feedback comments." });
  }

  const newFeedback = db.addFeedback({
    rating: Number(rating),
    comment: comment.trim(),
    complaintId: complaintId || null,
    streetlightId,
    streetlightLocation: streetlightLocation || null,
    userName: userName || "Citizen",
    userId: userId || "usr_01",
    userEmail: userEmail || "user@citylight.gov"
  });

  res.status(201).json(newFeedback);
});

// 10. Notifications
app.get("/api/notifications", (req, res) => {
  const { role, userId } = req.query;
  res.json(db.getNotifications(role, userId));
});

app.post("/api/notifications/read", (req, res) => {
  const { role, userId } = req.query;
  db.markNotificationsRead(role, userId);
  res.json({ success: true });
});

// 11. Simulation Controls
app.post("/api/simulation/advance", (req, res) => {
  const { scenario } = req.body;
  const result = advanceSimulationCycle(scenario);
  res.json(result);
});

app.post("/api/simulation/reset", (req, res) => {
  db.reset();
  res.json({ success: true, message: "Database reset to initial demo state." });
});

// Serve frontend static build in production
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Smart Streetlight Server running at http://localhost:${PORT}`);
});
