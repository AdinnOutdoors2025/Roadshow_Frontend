const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });

  await page.waitForFunction(() => {
    const el = document.querySelector('[data-roadshow-loader-mode]');
    if (!el) return true;
    const style = window.getComputedStyle(el);
    return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
  }, { timeout: 20000 }).catch(() => console.log('loader wait timed out'));

  await page.waitForTimeout(1000);

  // Real wheel scroll so GSAP ScrollSmoother + ScrollTrigger actually update.
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(__dirname, 'v3-clients.png') });

  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(__dirname, 'v3-testimonials.png') });

  await browser.close();
  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
