const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));
  page.on('requestfailed', (req) => console.log('REQFAIL:', req.url(), req.failure()?.errorText));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });

  await page.waitForFunction(() => {
    const el = document.querySelector('[data-roadshow-loader-mode]');
    if (!el) return true;
    const style = window.getComputedStyle(el);
    return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
  }, { timeout: 20000 }).catch(() => console.log('loader wait timed out'));

  await page.waitForTimeout(1000);

  const orbit = page.locator('.RS_ClientsOrbitArea');
  await orbit.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const orbitEl = document.querySelector('.RS_ClientsOrbitArea');
    const bubbles = Array.from(document.querySelectorAll('.RS_ClientBubble'));
    const orbitRect = orbitEl ? orbitEl.getBoundingClientRect() : null;
    const orbitStyle = orbitEl ? getComputedStyle(orbitEl) : null;
    return {
      bubbleCount: bubbles.length,
      orbitRect,
      orbitFactor: orbitStyle ? orbitStyle.getPropertyValue('--rs-orbit-f') : null,
      bubbles: bubbles.slice(0, 5).map((b) => {
        const r = b.getBoundingClientRect();
        const cs = getComputedStyle(b);
        const img = b.querySelector('img');
        return {
          class: b.className,
          rect: { top: r.top, left: r.left, width: r.width, height: r.height },
          display: cs.display,
          visibility: cs.visibility,
          opacity: cs.opacity,
          imgSrc: img ? img.src : null,
          imgNaturalWidth: img ? img.naturalWidth : null,
          imgComplete: img ? img.complete : null,
        };
      }),
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
