const { chromium } = require('playwright-core');
const path = require('path');

async function scrollUntilVisible(page, selector, maxSteps = 80, step = 150) {
  for (let i = 0; i < maxSteps; i++) {
    const rect = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    }, selector);

    if (rect && rect.top >= 0 && rect.top < 300) {
      return true;
    }

    await page.mouse.wheel(0, step);
    await page.waitForTimeout(150);
  }
  return false;
}

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

  const found1 = await scrollUntilVisible(page, '.RS_ClientsOrbitArea');
  console.log('clients found:', found1);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(__dirname, 'v4-clients.png') });

  const found2 = await scrollUntilVisible(page, '.adinn-testimonial-truck-stage');
  console.log('testimonials found:', found2);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(__dirname, 'v4-testimonials.png') });

  await browser.close();
  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
