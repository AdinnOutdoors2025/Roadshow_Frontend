const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });

  // Scroll to Clients section
  const clientsHeading = page.locator('text=Some of Our').first();
  await clientsHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(__dirname, 'clients-mobile.png') });

  // Scroll to Testimonials section
  const testimonialsHeading = page.locator('text=Trusted by Brands').first();
  await testimonialsHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(__dirname, 'testimonials-mobile.png') });

  await browser.close();
  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
