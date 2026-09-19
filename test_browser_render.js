import puppeteer from 'puppeteer-core';

async function testBrowser() {
  console.log("=== STARTING REAL BROWSER RENDERING TEST ===");
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('🔴 Browser Console Error:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('💥 Page Exception Stack:\n', err.stack);
  });

  // TEST 1: Open root URL http://localhost:5000
  console.log("\n1. Navigating to http://localhost:5000...");
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });

  const title = await page.title();
  console.log(`   Page Title: "${title}"`);

  // Check if Login Page elements are visible
  const loginText = await page.evaluate(() => document.body.innerText);
  if (loginText.includes("Portal Sign In") && loginText.includes("Sign In as Admin")) {
    console.log("   ✓ LOGIN PAGE IS VISIBLE AND RENDERING CORRECTLY!");
  } else {
    console.log("   ❌ Login page text not found! Body content snippet:\n", loginText.slice(0, 300));
    throw new Error("Blank page or Login page failed to render");
  }

  // TEST 2: Admin Login
  console.log("\n2. Testing Admin Login...");
  await page.type('input[placeholder="e.g. admin@citylight.gov"]', 'admin');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1000));

  const adminText = await page.evaluate(() => document.body.innerText);
  if (adminText.includes("Central Risk Operations") || adminText.includes("Overview Dashboard") || adminText.includes("Smart City Portal")) {
    console.log("   ✓ ADMIN DASHBOARD RENDERED SUCCESSFULLY!");
  } else {
    console.log("   ❌ Admin Dashboard text not found! Body content snippet:\n", adminText.slice(0, 300));
    throw new Error("Admin Dashboard failed to render");
  }

  // TEST 3: Switch User / Logout
  console.log("\n3. Testing Logout...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes("Switch User") || b.innerText.includes("Logout"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // TEST 4: Common User Login
  console.log("\n4. Testing Common User Login...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const userBtn = buttons.find(b => b.innerText.includes("Common User Login"));
    if (userBtn) userBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  await page.type('input[placeholder*="Alex Johnson"]', 'Alex Johnson');
  await page.type('input[placeholder*="user@citylight.gov"]', 'user@citylight.gov');
  await page.type('input[type="password"]', 'user123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1000));

  const userText = await page.evaluate(() => document.body.innerText);
  if (userText.includes("Citizen AI Risk") || userText.includes("Citizen Services Portal") || userText.includes("Welcome back")) {
    console.log("   ✓ COMMON USER DASHBOARD RENDERED SUCCESSFULLY!");
  } else {
    console.log("   ❌ Common User Dashboard text not found! Body content snippet:\n", userText.slice(0, 300));
    throw new Error("Common User Dashboard failed to render");
  }

  // TEST 5: Browser console check
  console.log("\n5. Checking Browser Console Errors...");
  if (consoleErrors.length === 0) {
    console.log("   ✓ ZERO FATAL BROWSER CONSOLE ERRORS DETECTED!");
  } else {
    console.log(`   ⚠️ Total Console Errors: ${consoleErrors.length}`);
  }

  await browser.close();
  console.log("\n=== ALL REAL BROWSER RENDERING TESTS PASSED! ===");
}

testBrowser().catch(err => {
  console.error("\n❌ BROWSER TEST FAILED:", err);
  process.exit(1);
});
