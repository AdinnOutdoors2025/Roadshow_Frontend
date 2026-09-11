const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });

  // CLIENTS SECTION
  const orbit = page.locator('.RS_ClientsOrbitArea');
  await orbit.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(__dirname, 'clients-viewport.png') });
  await orbit.screenshot({ path: path.join(__dirname, 'clients-element.png') });

  // TESTIMONIALS / LED TRUCK SECTION
  const truckStage = page.locator('.adinn-testimonial-truck-stage');
  await truckStage.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(__dirname, 'testimonials-viewport.png') });
  const hero = page.locator('.adinn-testimonial-hero');
  await hero.screenshot({ path: path.join(__dirname, 'testimonials-hero-element.png') });

  await browser.close();
  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
