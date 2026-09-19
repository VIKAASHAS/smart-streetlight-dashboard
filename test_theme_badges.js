import puppeteer from 'puppeteer-core';

async function runTest() {
  console.log("=== STARTING GLOBAL THEME & STREETLIGHT BADGES VERIFICATION TEST ===");
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
      console.log('🔴 Browser Console Error:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log('💥 Page Exception Stack:\n', err.stack);
  });

  try {
    // 1. Open root URL
    console.log("1. Navigating to http://localhost:5000...");
    await page.goto("http://localhost:5000", { waitUntil: "networkidle0" });

    // 2. Admin Login
    console.log("2. Logging in as Admin...");
    await page.type('input[placeholder="e.g. admin@citylight.gov"]', "admin");
    await page.type('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000));

    // 3. Test Global Light Mode Sidebar
    console.log("\n3. Testing Global Light Mode Sidebar...");
    // Ensure Light Mode is active
    let isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    if (isDark) {
      console.log("   Toggling to Light Mode...");
      await page.click('button[title*="Toggle Light / Dark Mode"]');
      await new Promise(r => setTimeout(r, 500));
    }

    let sidebarBg = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? window.getComputedStyle(aside).backgroundColor : null;
    });
    console.log(`   Light Mode Sidebar Background: ${sidebarBg}`);
    if (sidebarBg !== 'rgb(255, 255, 255)') {
      throw new Error(`Sidebar is not light in Light Mode! Found: ${sidebarBg}`);
    }
    console.log("   ✓ SIDEBAR IS FULLY LIGHT IN LIGHT MODE!");

    // 4. Test Global Dark Mode Sidebar
    console.log("\n4. Testing Global Dark Mode Sidebar...");
    await page.click('button[title*="Toggle Light / Dark Mode"]');
    await new Promise(r => setTimeout(r, 500));

    sidebarBg = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? window.getComputedStyle(aside).backgroundColor : null;
    });
    console.log(`   Dark Mode Sidebar Background: ${sidebarBg}`);
    if (sidebarBg === 'rgb(255, 255, 255)') {
      throw new Error(`Sidebar remained white in Dark Mode! Found: ${sidebarBg}`);
    }
    console.log("   ✓ SIDEBAR IS FULLY DARK NAVY IN DARK MODE!");

    // 5. Test Theme Persistence across refresh
    console.log("\n5. Testing Theme Persistence across browser refresh...");
    await page.reload({ waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 500));
    isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    console.log(`   Theme after refresh is dark: ${isDark}`);
    if (!isDark) {
      throw new Error("Theme reset to light after refresh when dark mode was selected!");
    }
    console.log("   ✓ THEME PERSISTENCE VERIFIED SUCCESSFULLY!");

    // Switch back to Light Mode for badge checks
    await page.click('button[title*="Toggle Light / Dark Mode"]');
    await new Promise(r => setTimeout(r, 500));

    // 6. Navigate to Streetlights List
    console.log("\n6. Navigating to Streetlight Registry...");
    const links = await page.$$('a, button');
    for (const link of links) {
      const text = await page.evaluate(el => el.innerText, link);
      if (text && text.includes('Streetlights Grid')) {
        await link.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // 7. Verify Streetlight Badges (SL-006 & SL-007)
    console.log("7. Verifying Streetlight Status & Risk Badges...");
    const rowsText = await page.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tbody tr'));
      return trs.map(tr => tr.innerText.replace(/\n/g, ' | '));
    });

    const sl006Row = rowsText.find(r => r.includes('SL-006'));
    const sl007Row = rowsText.find(r => r.includes('SL-007'));

    console.log(`   SL-006 Row Data: ${sl006Row}`);
    console.log(`   SL-007 Row Data: ${sl007Row}`);

    if (!sl006Row || !sl006Row.includes('Needs Attention (72)') || !sl006Row.includes('Medium Risk')) {
      throw new Error(`SL-006 badge text mismatch! Expected Needs Attention (72) and Medium Risk, found: ${sl006Row}`);
    }
    if (!sl007Row || !sl007Row.includes('Needs Attention (66)') || !sl007Row.includes('Medium Risk')) {
      throw new Error(`SL-007 badge text mismatch! Expected Needs Attention (66) and Medium Risk, found: ${sl007Row}`);
    }
    console.log("   ✓ BADGES FOR SL-006 AND SL-007 ARE PROPERLY FORMATTED & ALIGNED!");

    // 8. Responsive Viewport Tests
    console.log("\n8. Testing Responsive Viewports (1920px, 1600px, 1366px, 1280px)...");
    const widths = [1920, 1600, 1366, 1280];
    for (const w of widths) {
      await page.setViewport({ width: w, height: 900 });
      await new Promise(r => setTimeout(r, 300));

      const hasOverflow = await page.evaluate(() => {
        const badges = document.querySelectorAll('.whitespace-nowrap');
        for (const b of badges) {
          if (b.scrollWidth > b.clientWidth + 5) return true;
        }
        return false;
      });

      if (hasOverflow) {
        throw new Error(`Badge text clipped/overflowed at width ${w}px!`);
      }
      console.log(`   ✓ ${w}px viewport layout clean!`);
    }

    // 9. Console Error check
    console.log("\n9. Checking Browser Console Errors...");
    if (consoleErrors.length > 0) {
      throw new Error(`Fatal console errors found: ${consoleErrors.join("; ")}`);
    }
    console.log("   ✓ ZERO FATAL CONSOLE ERRORS DETECTED!");

    console.log("\n=== ALL GLOBAL THEME & BADGE VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
