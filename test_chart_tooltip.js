import puppeteer from 'puppeteer-core';

async function runTest() {
  console.log("=== STARTING CHART TOOLTIP & DEMO DATA VERIFICATION TEST ===");
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto("http://localhost:5000", { waitUntil: "networkidle0" });

    // Login Admin
    await page.type('input[placeholder="e.g. admin@citylight.gov"]', "admin");
    await page.type('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000));

    // Nav to AI Analytics
    const links = await page.$$('a, button');
    for (const link of links) {
      const text = await page.evaluate(el => el.innerText, link);
      if (text && text.includes('AI Predictive Analytics')) {
        await link.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    const sectorCount = await page.evaluate(() => document.querySelectorAll('.recharts-pie-sector').length);
    console.log(`Found ${sectorCount} pie sectors in chart.\n`);

    for (let i = 0; i < sectorCount; i++) {
      await page.evaluate((idx) => {
        const sectors = document.querySelectorAll('.recharts-pie-sector');
        const sec = sectors[idx];
        if (sec) {
          sec.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          sec.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          sec.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
        }
      }, i);

      await new Promise(r => setTimeout(r, 300));

      const tooltipText = await page.evaluate(() => {
        const tooltipEl = document.querySelector('.recharts-tooltip-wrapper');
        return tooltipEl ? tooltipEl.innerText.trim() : null;
      });

      console.log(`Sector ${i + 1} Hover Tooltip Content:`);
      console.log(`------------------------------------`);
      console.log(`${tooltipText ? tooltipText.replace(/\n/g, ' | ') : 'EMPTY / NOT FOUND'}`);
      console.log(`------------------------------------\n`);
    }

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
}

runTest();
