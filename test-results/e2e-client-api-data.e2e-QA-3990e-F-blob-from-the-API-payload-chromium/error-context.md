# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\client-api-data.e2e.spec.ts >> QA-07 Data consistency >> view-summary renders a PDF blob from the API payload
- Location: tests\e2e\client-api-data.e2e.spec.ts:226:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Booking_Summary_RSQ-2026-000123"
Received string:    "da0a6148-eee1-4ed3-8943-e0eeb08fafde.pdf"
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - main [ref=e5]:
      - generic [ref=e6]:
        - button "Back to Orders" [ref=e7] [cursor=pointer]
        - generic [ref=e10]:
          - generic [ref=e11]:
            - heading "View Summary PDF" [level=1] [ref=e12]
            - paragraph [ref=e13]: Review and download your booking summary.
          - button "Download" [active] [ref=e14] [cursor=pointer]
        - generic [ref=e18]:
          - generic [ref=e19]: Booking_Summary_RSQ-2026-000123.pdf
          - iframe [ref=e25]:
            
    - contentinfo [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: Launch your campaign now.
          - generic [ref=e30]: Quick setup, instant visibility.
        - link "Reach Us" [ref=e31] [cursor=pointer]:
          - /url: /roadshow/Contact
      - generic [ref=e32]:
        - generic [ref=e33]:
          - button "Roadshow Logo" [ref=e34] [cursor=pointer]
          - generic [ref=e35]:
            - link "Instagram" [ref=e36] [cursor=pointer]:
              - /url: https://www.instagram.com/adinnroadshows_/
              - img "Instagram" [ref=e37]
            - link "Facebook" [ref=e38] [cursor=pointer]:
              - /url: https://www.facebook.com/adinnroadshow
              - img "Facebook" [ref=e39]
            - link "Twitter" [ref=e40] [cursor=pointer]:
              - /url: https://x.com/AdinnRoadshow
              - img "Twitter" [ref=e41]
            - link "LinkedIn" [ref=e42] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/adinn-roadshows/
              - img "LinkedIn" [ref=e43]
          - generic [ref=e44]:
            - generic [ref=e45]:
              - link "+91 73737 85057" [ref=e46] [cursor=pointer]:
                - /url: tel:7373785057
              - generic [ref=e47]: "|"
              - link "+91 96269 87861" [ref=e48] [cursor=pointer]:
                - /url: tel:9626987861
            - link "roadshowsales@adinn.co.in" [ref=e49] [cursor=pointer]:
              - /url: mailto:roadshowsales@adinn.co.in
          - generic [ref=e50]:
            - paragraph [ref=e51]: Stay informed with Roadshow updates
            - generic [ref=e52]:
              - textbox "Your email or phone number" [ref=e53]
              - button "Continue with contact verification" [disabled] [ref=e54]:
                - generic [ref=e55]: 
        - generic [ref=e56]:
          - generic [ref=e57]: Services
          - generic [ref=e58]: LED Screen Vehicle
          - generic [ref=e59]: L-Type LED Vehicle
          - generic [ref=e60]: 3-Side LED Truck
          - generic [ref=e61]: Customize Fabrication Vehicle
        - generic [ref=e62]:
          - generic [ref=e63]: Address
          - generic [ref=e64]: 29, 1st Cross Street, Vanamamalai Nagar, By-pass Road, Madurai - 625 010.
          - generic [ref=e65]: No. 19/43, MG Chakrapani Street, Sathya Garden, Saligramam, Chennai - 600 092.
          - generic [ref=e66]: No. 407/8, 4th Cross, Jayanagar 7th Block, Opp-Saraswat Cooperative Bank, Bangalore - 560 070.
      - generic [ref=e68]:
        - link "Cookies Policy" [ref=e69] [cursor=pointer]:
          - /url: /cookies
        - button "Terms & Conditions" [ref=e70] [cursor=pointer]
        - link "Privacy Policy" [ref=e71] [cursor=pointer]:
          - /url: /privacy
  - link "Chat with us on WhatsApp" [ref=e72] [cursor=pointer]:
    - /url: https://wa.me/917092558277?text=Hi%2C%20I%20visited%20the%20Adinn%20Roadshows%20website%20(adinnroadshows.com)%20and%20would%20like%20to%20know%20more%20about%20your%20roadshow%20services.
  - button "Open Next.js Dev Tools" [ref=e80] [cursor=pointer]
  - alert [ref=e84]
  - banner [ref=e85]:
    - generic [ref=e86]:
      - link "Adinn Roadshow home" [ref=e87] [cursor=pointer]:
        - /url: /
        - img "Adinn Roadshow" [ref=e88]
      - navigation "Main navigation" [ref=e89]:
        - link "Home" [ref=e90] [cursor=pointer]:
          - /url: /
          - generic [ref=e91]:
            - generic [ref=e92]: Home
            - generic [ref=e93]: Home
        - link "Why Adinn" [ref=e94] [cursor=pointer]:
          - /url: /#why-adinn
          - generic [ref=e95]:
            - generic [ref=e96]: Why Adinn
            - generic [ref=e97]: Why Adinn
        - link "Vehicle" [ref=e98] [cursor=pointer]:
          - /url: /#our-roadshow-vehicles
          - generic [ref=e99]:
            - generic [ref=e100]: Vehicle
            - generic [ref=e101]: Vehicle
      - generic [ref=e102]:
        - link "Contact Us" [ref=e103] [cursor=pointer]:
          - /url: /roadshow/Contact
        - generic "Open your profile" [ref=e104]: Test Client
        - button "Open account menu" [ref=e107] [cursor=pointer]
  - generic [ref=e110]:
    - generic [ref=e111]:
      - img "Adinn" [ref=e112]
      - generic [ref=e113]:
        - generic [ref=e114]: Booking Summary
        - generic [ref=e115]: "Request ID: RSQ-2026-000123"
    - generic [ref=e116]:
      - generic [ref=e122]:
        - generic [ref=e123]: Booking Status
        - generic [ref=e124]: In Progress
      - generic [ref=e130]:
        - generic [ref=e131]: Submitted On
        - generic [ref=e132]: 10 Aug 2026, 03:00 PM
      - generic [ref=e137]:
        - generic [ref=e138]: Booking Dates
        - generic [ref=e139]: 21 Aug 2026 → 26 Aug 2026
    - separator [ref=e140]
    - generic [ref=e141]:
      - generic [ref=e142]:
        - generic [ref=e143]: Customer Details
        - generic [ref=e149]:
          - generic [ref=e150]: Test Client
          - generic [ref=e151]: client@example.com
          - generic [ref=e152]: "9876543210"
      - generic [ref=e153]:
        - generic [ref=e154]: GST Details
        - generic [ref=e161]: Individual customer — no GST details
    - separator [ref=e162]
    - generic [ref=e163]:
      - generic [ref=e164]: Selected Vehicles
      - generic [ref=e172]:
        - generic [ref=e173]:
          - img "Isuzu - NPR" [ref=e174]
          - generic [ref=e175]:
            - generic [ref=e176]: 1. Isuzu - NPR
            - generic [ref=e177]: "Quantity: 2 Vehicles"
            - generic [ref=e178]: "Line Total: ₹ 1,44,000"
        - generic [ref=e179]:
          - img "Isuzu - NPR" [ref=e180]
          - generic [ref=e181]:
            - generic [ref=e182]: 2. Isuzu - NPR
            - generic [ref=e183]: "Quantity: 1 Vehicles"
            - generic [ref=e184]: "Line Total: ₹ 6,000"
    - separator [ref=e185]
    - generic [ref=e186]:
      - generic [ref=e187]: Campaign Details
      - generic [ref=e193]:
        - generic [ref=e194]:
          - generic [ref=e195]: Campaign
          - generic [ref=e196]: Acme Product Launch
        - generic [ref=e197]:
          - generic [ref=e198]: Campaign Type
          - generic [ref=e199]: Product Launch
        - generic [ref=e200]:
          - generic [ref=e201]: Location
          - generic [ref=e202]: Chennai
    - separator [ref=e203]
    - generic [ref=e204]:
      - generic [ref=e205]: Pricing Breakdown
      - generic [ref=e211]:
        - generic [ref=e212]: Taxable Amount
        - generic [ref=e213]: ₹ 1,50,000
      - generic [ref=e214]:
        - generic [ref=e215]: GST 0%
        - generic [ref=e216]: ₹ 27,000
      - generic [ref=e217]:
        - generic [ref=e218]: Grand Total
        - generic [ref=e219]: ₹ 1,77,000
    - generic [ref=e220]: Thank you for choosing Adinn Roadshows. We look forward to serving you.
```

# Test source

```ts
  147 |     await expect(row).toContainText("4 Vehicles");
  148 | 
  149 |     // Open detail to verify refreshed pricing flows to the dashboard list data
  150 |     await page
  151 |       .getByRole("button", { name: "Open RSQ-2026-000123" })
  152 |       .first()
  153 |       .click();
  154 |     await expect(page.getByText("Order ID: RSQ-2026-000123")).toBeVisible({ timeout: 10_000 });
  155 |   });
  156 | 
  157 |   test("tracking page keeps polling and shows the latest live data", async ({ page }) => {
  158 |     const state: BackendState = makeBackendState();
  159 |     await seedClientAuth(page);
  160 |     await installMockBackend(page, state);
  161 | 
  162 |     await page.goto("/roadshow/my-bookings/64f1c2e5d3b9a4001f2e3c01", {
  163 |       waitUntil: "domcontentloaded",
  164 |     });
  165 |     await waitForMainLoaderGone(page);
  166 | 
  167 |     // Tracking summary from /tracking
  168 |     await expect(page.getByText("Acme Product Launch").first().first()).toBeVisible({ timeout: 15_000 });
  169 |     await expect(page.getByText("Day 3 of 6", { exact: true }).first()).toBeVisible();
  170 | 
  171 |     // Live vehicles from /live-location
  172 |     await expect(page.getByText("TN-01-AB-1234").first()).toBeVisible({ timeout: 10_000 });
  173 | 
  174 |     expect(state.trackingHits).toBeGreaterThanOrEqual(1);
  175 | 
  176 |     // Backend "edit": day advances + distance grows -> polled values update.
  177 |     state.tracking = {
  178 |       ...state.tracking,
  179 |       bookingSummary: {
  180 |         ...state.tracking.bookingSummary,
  181 |       },
  182 |       onRoad: { day: 4, totalDays: 6 },
  183 |       lastUpdatedAt: "2026-08-23T12:00:00.000Z",
  184 |     } as Record<string, unknown>;
  185 |     state.liveLocation = {
  186 |       success: true,
  187 |       data: {
  188 |         vehicles: [
  189 |           {
  190 |             ...((state.liveLocation.data as { vehicles: unknown[] }).vehicles[0] as object),
  191 |             speedKmh: 55,
  192 |             distanceCoveredKm: 310,
  193 |           },
  194 |           ...((state.liveLocation.data as { vehicles: unknown[] }).vehicles as []).slice(1),
  195 |         ],
  196 |       },
  197 |     };
  198 | 
  199 |     await page.reload({ waitUntil: "domcontentloaded" });
  200 |     await waitForMainLoaderGone(page);
  201 | 
  202 |     await expect(page.getByText("Day 4 of 6", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
  203 |   });
  204 | });
  205 | 
  206 | test.describe("QA-07 Data consistency", () => {
  207 |   test("booking detail values match the API payload exactly", async ({ page }) => {
  208 |     const state: BackendState = makeBackendState();
  209 |     await seedClientAuth(page);
  210 |     await installMockBackend(page, state);
  211 | 
  212 |     await page.goto("/roadshow/my-bookings/64f1c2e5d3b9a4001f2e3c01", {
  213 |       waitUntil: "domcontentloaded",
  214 |     });
  215 |     await waitForMainLoaderGone(page);
  216 | 
  217 |     // Campaign summary from the raw booking/tracking payload
  218 |     await expect(page.getByText("Acme Product Launch").first().first()).toBeVisible({ timeout: 15_000 });
  219 |     await expect(page.getByText("Chennai").first().first()).toBeVisible();
  220 | 
  221 |     // Vehicle cards carry reg numbers as supplied by the API (second vehicle tab)
  222 |     await page.getByRole("tab").nth(1).click();
  223 |     await expect(page.getByText("TN-01-CD-5678").first()).toBeVisible({ timeout: 10_000 });
  224 |   });
  225 | 
  226 |   test("view-summary renders a PDF blob from the API payload", async ({ page }) => {
  227 |     const state: BackendState = makeBackendState();
  228 |     await seedClientAuth(page);
  229 |     await installMockBackend(page, state);
  230 | 
  231 |     const pageErrors: string[] = [];
  232 |     page.on("pageerror", (err) => pageErrors.push(err.message));
  233 | 
  234 |     await page.goto("/roadshow/view-summary/64f1c2e5d3b9a4001f2e3c01", {
  235 |       waitUntil: "domcontentloaded",
  236 |     });
  237 |     await waitForMainLoaderGone(page);
  238 | 
  239 |     const iframe = page.locator('iframe[title="Booking Summary PDF"]');
  240 |     await expect(iframe).toBeVisible({ timeout: 30_000 });
  241 |     const src = await iframe.getAttribute("src");
  242 |     expect(src?.startsWith("blob:"), "PDF should be served from a blob URL").toBeTruthy();
  243 | 
  244 |     const downloadPromise = page.waitForEvent("download", { timeout: 15_000 });
  245 |     await page.getByRole("button", { name: "Download", exact: true }).click();
  246 |     const download = await downloadPromise;
> 247 |     expect(download.suggestedFilename()).toContain("Booking_Summary_RSQ-2026-000123");
      |                                          ^ Error: expect(received).toContain(expected) // indexOf
  248 | 
  249 |     expect(pageErrors, "view-summary should not throw").toEqual([]);
  250 |   });
  251 | 
  252 |   test("cancelled booking renders its terminal status from the payload", async ({ page }) => {
  253 |     const state: BackendState = makeBackendState();
  254 |     state.bookings = [BOOKING_CANCELLED];
  255 |     await seedClientAuth(page);
  256 |     await installMockBackend(page, state);
  257 | 
  258 |     await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
  259 |     await waitForMainLoaderGone(page);
  260 | 
  261 |     await expect(page.getByText("RSQ-2026-000042").first()).toBeVisible({ timeout: 10_000 });
  262 |     await expect(page.getByText("Cancelled").first()).toBeVisible();
  263 |     await expect(page.getByText("3 Vehicles").first()).toBeHidden();
  264 | 
  265 |     // Pending booking shows its own state
  266 |     const statePending: BackendState = makeBackendState();
  267 |     statePending.bookings = [BOOKING_PENDING];
  268 |     await installMockBackend(page, statePending);
  269 |     await seedClientAuth(page);
  270 |     await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
  271 |     await waitForMainLoaderGone(page);
  272 |     await expect(page.getByText("RSQ-2026-000088").first()).toBeVisible({ timeout: 10_000 });
  273 |     await expect(page.getByText("Request Submitted").first()).toBeVisible();
  274 |   });
  275 | });
  276 | 
```