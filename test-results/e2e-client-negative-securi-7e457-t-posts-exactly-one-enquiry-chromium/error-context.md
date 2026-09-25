# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\client-negative-security.e2e.spec.ts >> QA-08 Negative >> duplicate Contact submit posts exactly one enquiry
- Location: tests\e2e\client-negative-security.e2e.spec.ts:122:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: duplicate click must not double-submit

expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - main [ref=e5]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]:
            - generic "Let's make it happen" [ref=e10]: Time To Get Moving
            - paragraph [ref=e13]: Share your roadshow requirements and our team will take care of everything for you.
            - generic [ref=e14]:
              - generic [ref=e15]: Modern LED Fleet
              - generic [ref=e21]: All India Network
              - generic [ref=e28]: Reliable Support
          - generic [ref=e33]:
            - img "2 sided fabricated LED roadshow vehicle" [ref=e37]
            - generic [ref=e38]:
              - paragraph [ref=e39]: Selected roadshow vehicle
              - heading "2 Sided Fabricated LED" [level=3] [ref=e40]
              - paragraph [ref=e41]: A high-impact mobile display with visibility on both sides, suitable for city routes, launches and promotional roadshows.
              - generic [ref=e42]:
                - generic [ref=e43]:
                  - img [ref=e45]: 
                  - generic [ref=e47]:
                    - generic [ref=e48]: Campaign support
                    - strong [ref=e49]: 8 hours / day
                - generic [ref=e50]:
                  - img [ref=e52]: 
                  - generic [ref=e54]:
                    - generic [ref=e55]: Route coverage
                    - strong [ref=e56]: Up to 60 km / day
                - generic [ref=e57]:
                  - img [ref=e59]: 
                  - generic [ref=e61]:
                    - generic [ref=e62]: Tracking
                    - strong [ref=e63]: GPS & photo proof
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]:
              - paragraph [ref=e67]: Start your campaign
              - heading "Tell us what you need" [level=2] [ref=e68]
            - generic [ref=e69]: "01"
          - group "Service" [ref=e70]:
            - generic [ref=e72]:
              - button "2 Sided Fabricated LED" [pressed] [ref=e73] [cursor=pointer]
              - button "Single Side Led Vehicle" [ref=e78] [cursor=pointer]
              - button "19 Feet Triple Side LED" [ref=e80] [cursor=pointer]
              - button "17 Feet Triple Side LED" [ref=e82] [cursor=pointer]
          - generic [ref=e84]:
            - generic [ref=e85]:
              - generic [ref=e86]: Your Name*
              - generic [ref=e87]:
                - img: 
                - textbox "Your Name" [ref=e88]:
                  - /placeholder: Enter your name
                  - text: Test User
            - generic [ref=e89]:
              - generic [ref=e90]: Contact*
              - generic [ref=e91]:
                - img: 
                - textbox "Contact" [ref=e92]:
                  - /placeholder: Enter contact number
                  - text: "9876543210"
            - generic [ref=e93]:
              - generic [ref=e94]: Email*
              - generic [ref=e95]:
                - img: 
                - textbox "Email" [ref=e96]:
                  - /placeholder: Enter email address
                  - text: test@example.com
            - generic [ref=e97]:
              - generic [ref=e98]: Preferred Location
              - generic [ref=e99]:
                - img: 
                - textbox "Preferred Location" [ref=e100]:
                  - /placeholder: Enter preferred location
          - group "Campaign Dates" [ref=e101]:
            - generic [ref=e103]:
              - generic [ref=e104]:
                - generic [ref=e105]: Start Date*
                - generic [ref=e106]:
                  - button "Open start date calendar" [ref=e107] [cursor=pointer]:
                    - img [ref=e108]: 
                  - textbox [ref=e110] [cursor=pointer]:
                    - /placeholder: Select start date
                    - text: 2026-09-05
              - generic [ref=e111]:
                - generic [ref=e112]: End Date*
                - generic [ref=e113]:
                  - button "Open end date calendar" [ref=e114] [cursor=pointer]:
                    - img [ref=e115]: 
                  - textbox [ref=e117] [cursor=pointer]:
                    - /placeholder: Select end date
                    - text: 2026-09-12
          - generic [ref=e118]:
            - generic [ref=e119]: Your Message
            - generic [ref=e120]:
              - img: 
              - textbox "Your Message 0/1000" [ref=e121]:
                - /placeholder: Tell us about your campaign, locations, duration and requirements...
              - generic [ref=e122]: 0/1000
          - button "Submit enquiry" [ref=e124] [cursor=pointer]
    - contentinfo [ref=e129]:
      - generic [ref=e130]:
        - generic [ref=e131]:
          - generic [ref=e132]: Ready to put your Brand on the move ?
          - generic [ref=e133]: Let’s plan your roadshow.
        - link "Reach Us" [ref=e134] [cursor=pointer]:
          - /url: /roadshow/Contact
      - generic [ref=e135]:
        - generic [ref=e136]:
          - button "Roadshow Logo" [ref=e137] [cursor=pointer]
          - generic [ref=e138]:
            - link "Instagram" [ref=e139] [cursor=pointer]:
              - /url: https://www.instagram.com/adinnroadshows_/
              - img "Instagram" [ref=e140]
            - link "Facebook" [ref=e141] [cursor=pointer]:
              - /url: https://www.facebook.com/adinnroadshow
              - img "Facebook" [ref=e142]
            - link "Twitter" [ref=e143] [cursor=pointer]:
              - /url: https://x.com/AdinnRoadshow
              - img "Twitter" [ref=e144]
            - link "LinkedIn" [ref=e145] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/adinn-roadshows/
              - img "LinkedIn" [ref=e146]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - link "+91 73395 09090" [ref=e149] [cursor=pointer]:
                - /url: tel:7339509090
              - generic [ref=e150]: "|"
              - link "+91 95003 88761" [ref=e151] [cursor=pointer]:
                - /url: tel:9500388761
            - link "roadshowsales@adinn.co.in" [ref=e152] [cursor=pointer]:
              - /url: mailto:roadshowsales@adinn.co.in
          - generic [ref=e153]:
            - paragraph [ref=e154]: Stay informed with Roadshow updates
            - generic [ref=e155]:
              - textbox "Your email or phone number" [ref=e156]
              - button "Continue with contact verification" [disabled] [ref=e157]:
                - generic [ref=e158]: 
        - generic [ref=e159]:
          - generic [ref=e160]: Services
          - generic [ref=e161]: LED Screen Vehicle
          - generic [ref=e162]: L-Type LED Vehicle
          - generic [ref=e163]: 3-Side LED Truck
          - generic [ref=e164]: Customize Fabrication Vehicle
        - generic [ref=e165]:
          - generic [ref=e166]: Address
          - generic [ref=e167]: 29, 1st Cross Street, Vanamamalai Nagar, By-pass Road, Madurai - 625 010.
          - generic [ref=e168]: No. 19/43, MG Chakrapani Street, Sathya Garden, Saligramam, Chennai - 600 092.
          - generic [ref=e169]: No. 407/8, 4th Cross, Jayanagar 7th Block, Opp-Saraswat Cooperative Bank, Bangalore - 560 070.
      - generic [ref=e171]:
        - generic [ref=e172]: Cookies Policy
        - button "Terms & Conditions" [ref=e173] [cursor=pointer]
        - generic [ref=e174]: Privacy Policy
  - link "Chat with us on WhatsApp" [ref=e175] [cursor=pointer]:
    - /url: https://wa.me/917092558277?text=Hi%2C%20I%20visited%20the%20Adinn%20Roadshows%20website%20(adinnroadshows.com)%20and%20would%20like%20to%20know%20more%20about%20your%20roadshow%20services.
  - button "Open Next.js Dev Tools" [ref=e183] [cursor=pointer]
  - alert [ref=e187]
  - banner [ref=e188]:
    - generic [ref=e189]:
      - link [ref=e190] [cursor=pointer]:
        - /url: /
        - img "Adinn Roadshow" [ref=e191]
      - navigation [ref=e192]:
        - link "Home" [ref=e193] [cursor=pointer]:
          - /url: /
        - link "Why Adinn" [ref=e200] [cursor=pointer]:
          - /url: /#why-adinn
        - link "Vehicle" [ref=e206] [cursor=pointer]:
          - /url: /#our-roadshow-vehicles
        - link "Contact Us" [ref=e214] [cursor=pointer]:
          - /url: /roadshow/Contact
      - generic [ref=e220]:
        - button "My cart" [ref=e221] [cursor=pointer]
        - button "Account menu" [ref=e226] [cursor=pointer]
```

# Test source

```ts
  60  |   });
  61  | 
  62  |   test("malformed (non-JSON) response degrades gracefully", async ({ page }) => {
  63  |     const state = makeBackendState();
  64  |     state.malformedMine = true;
  65  |     await seedClientAuth(page);
  66  |     await installMockBackend(page, state);
  67  |     const errors = trackFatalErrors(page);
  68  | 
  69  |     await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
  70  |     await waitForMainLoaderGone(page);
  71  | 
  72  |     await expect(
  73  |       page.getByText("Unable to load your bookings", { exact: true }).first(),
  74  |     ).toBeVisible({ timeout: 10_000 });
  75  |     expect(errors).toEqual([]);
  76  |   });
  77  | 
  78  |   test("unknown booking id shows the tracking sign-in/not-found state, no crash", async ({ page }) => {
  79  |     const state = makeBackendState();
  80  |     await seedClientAuth(page);
  81  |     await installMockBackend(page, state);
  82  |     const errors = trackFatalErrors(page);
  83  | 
  84  |     await page.goto("/roadshow/my-bookings/000000000000000000000000", {
  85  |       waitUntil: "domcontentloaded",
  86  |     });
  87  |     await waitForMainLoaderGone(page);
  88  | 
  89  |     const body = page.locator("body");
  90  |     await expect(body).not.toBeEmpty();
  91  |     expect(errors).toEqual([]);
  92  |   });
  93  | 
  94  |   test("expired session is detected and the user is signed out, then gated", async ({ page }) => {
  95  |     const state = makeBackendState();
  96  |     await seedClientAuthExpired(page);
  97  |     await installMockBackend(page, state);
  98  | 
  99  |     await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
  100 |     await waitForMainLoaderGone(page);
  101 | 
  102 |     const expired = await page.evaluate(() => {
  103 |       return {
  104 |         user: localStorage.getItem("roadshow_user"),
  105 |         token: localStorage.getItem("roadshow_token"),
  106 |       };
  107 |     });
  108 |     expect(expired.user, "expired session should clear the stored user").toBeNull();
  109 |     expect(expired.token, "expired session should clear the stored token").toBeNull();
  110 |   });
  111 | 
  112 |   test("unaudited session (no token) is gated behind a sign-in prompt", async ({ page }) => {
  113 |     const state = makeBackendState();
  114 |     await installMockBackend(page, state); // no seedClientAuth -> signed out
  115 | 
  116 |     await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
  117 |     await waitForMainLoaderGone(page);
  118 | 
  119 |     await expect(page.getByText("Sign in to view your bookings")).toBeVisible({ timeout: 10_000 });
  120 |   });
  121 | 
  122 |   test("duplicate Contact submit posts exactly one enquiry", async ({ page }) => {
  123 |     const state = makeBackendState();
  124 |     await installMockBackend(page, state);
  125 | 
  126 |     await page.goto("/roadshow/Contact", { waitUntil: "domcontentloaded" });
  127 |     await waitForMainLoaderGone(page);
  128 | 
  129 |     await page.locator('input[name="name"]').fill("Test User");
  130 |     await page.locator('input[name="contact"]').fill("9876543210");
  131 |     await page.locator('input[name="email"]').fill("test@example.com");
  132 |     await page.locator('input[name="startDate"]').fill("2026-09-05");
  133 |     await page.locator('input[name="endDate"]').fill("2026-09-12");
  134 | 
  135 |     const button = page.getByRole("button", { name: /submit enquiry/i });
  136 |     await button.click();
  137 | 
  138 |     // Every valid submit now opens a "Human Verification" math captcha
  139 |     // before the real POST fires (Contact/page.tsx's openCaptchaPopup) —
  140 |     // solve it, then duplicate-click the actual commit action (Verify &
  141 |     // Continue) to exercise the same double-submit guard the test
  142 |     // originally targeted.
  143 |     console.log("DEBUG dialog html:", await page.locator("body").innerHTML().then(h => h.slice(0, 0)));
  144 |     console.log("DEBUG captcha visible:", await page.getByText(/Human Verification/).isVisible().catch(() => "ERR"));
  145 |     const question = await page.getByText(/^\d+ \+ \d+ = \?$/).innerText();
  146 |     console.log("DEBUG question:", JSON.stringify(question));
  147 |     const [a, b] = question.match(/\d+/g)!.map(Number);
  148 |     console.log("DEBUG answer:", a + b);
  149 |     await page.getByLabel("Security question answer").fill(String(a + b));
  150 | 
  151 |     const verifyButton = page.getByRole("button", { name: "Verify & Continue" });
  152 |     await verifyButton.click();
  153 |     console.log("DEBUG after verify click, dialog still open:", await page.getByText(/Human Verification/).isVisible().catch(() => "ERR"));
  154 |     console.log("DEBUG contactPosts after verify:", state.contactPosts);
  155 |     await verifyButton.click({ noWaitAfter: true }).catch(() => {});
  156 | 
  157 |     await expect
  158 |       .poll(() => state.contactPosts, { timeout: 8_000 })
  159 |       .toBeLessThanOrEqual(1);
> 160 |     expect(state.contactPosts, "duplicate click must not double-submit").toBe(1);
      |                                                                          ^ Error: duplicate click must not double-submit
  161 |   });
  162 | });
  163 | 
  164 | test.describe("QA-11 Security (client scope)", () => {
  165 |   test("booking fields containing HTML are rendered as inert text, never executed", async ({ page }) => {
  166 |     const state = makeBackendState();
  167 |     const payload = "<img src=x onerror=\"window.__xssHappened=1\">SCRIPT-INJECT";
  168 |     state.bookings = [
  169 |       {
  170 |         ...(state.bookings[0] as Record<string, unknown>),
  171 |         _id: "64f1c2e5d3b9a4001f2e3c99",
  172 |         clientOrderId: "RSQ-2026-000999",
  173 |         companyName: payload,
  174 |       },
  175 |     ];
  176 |     await seedClientAuth(page);
  177 |     await installMockBackend(page, state);
  178 |     const errors = trackFatalErrors(page);
  179 | 
  180 |     await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
  181 |     await waitForMainLoaderGone(page);
  182 | 
  183 |     await expect(page.getByText("RSQ-2026-000999").first()).toBeVisible({ timeout: 10_000 });
  184 | 
  185 |     const executed = await page.evaluate(() => (window as unknown as { __xssHappened?: 1 }).__xssHappened);
  186 |     expect(executed).toBeUndefined();
  187 | 
  188 |     const bodyHtml = await page.locator("body").innerHTML();
  189 |     expect(bodyHtml).not.toContain('onerror="window.__xssHappened=1"');
  190 |     expect(errors, "no page error / no dialog from the injection").toEqual([]);
  191 |   });
  192 | 
  193 |   test("view-summary refuses a booking owned by another customer", async ({ page }) => {
  194 |     const state = makeBackendState();
  195 |     state.bookings = [
  196 |       {
  197 |         ...(state.bookings[0] as Record<string, unknown>),
  198 |         _id: "64f1c2e5d3b9a4001f2e3c77",
  199 |         clientOrderId: "RSQ-2026-000777",
  200 |         userId: { _id: "some_other_customer" },
  201 |       },
  202 |     ];
  203 |     await seedClientAuth(page);
  204 |     await installMockBackend(page, state);
  205 | 
  206 |     await page.goto("/roadshow/view-summary/64f1c2e5d3b9a4001f2e3c77", {
  207 |       waitUntil: "domcontentloaded",
  208 |     });
  209 |     await waitForMainLoaderGone(page);
  210 | 
  211 |     await expect(page.getByText("The booking summary could not be found.")).toBeVisible({ timeout: 20_000 });
  212 |     const iframe = page.locator('iframe[title="Booking Summary PDF"]');
  213 |     await expect(iframe).toBeHidden();
  214 |   });
  215 | 
  216 |   test("no NEXT_PUBLIC_/secrets leak into the served HTML on a client route", async ({ page }) => {
  217 |     const state = makeBackendState();
  218 |     await installMockBackend(page, state);
  219 | 
  220 |     const response = await page.request.get("/");
  221 |     const html = await response.text();
  222 | 
  223 |     const leaked = [
  224 |       process.env.NEXT_PUBLIC_API_BASE,
  225 |       "INTERNAL_API_SECRET",
  226 |       "MONGODB_URI",
  227 |     ].filter(
  228 |       (needle) => needle && needle.length > 4 && html.includes(String(needle)),
  229 |     );
  230 | 
  231 |     expect(leaked, "secrets/API-key env names must not appear in served HTML").toEqual([]);
  232 |   });
  233 | 
  234 |   test("authorization header is not sent when the customer is signed out", async ({ page }) => {
  235 |     const state = makeBackendState();
  236 |     await installMockBackend(page, state); // signed out
  237 | 
  238 |     await page.goto("/roadshow/my-bookings", { waitUntil: "domcontentloaded" });
  239 |     await waitForMainLoaderGone(page);
  240 | 
  241 |     expect(state.seenAuthHeaders).toEqual([]);
  242 |   });
  243 | 
  244 |   test("client form inputs validate format client-side (email + contact)", async ({ page }) => {
  245 |     const state = makeBackendState();
  246 |     await installMockBackend(page, state);
  247 | 
  248 |     await page.goto("/roadshow/Contact", { waitUntil: "domcontentloaded" });
  249 |     await waitForMainLoaderGone(page);
  250 | 
  251 |     await page.locator('input[name="name"]').fill("Test User");
  252 |     await page.locator('input[name="contact"]').fill("99999"); // too short
  253 |     await page.locator('input[name="email"]').fill("user@"); // invalid
  254 |     await page.getByRole("button", { name: /submit enquiry/i }).click();
  255 | 
  256 |     await expect(page.getByText("Please enter a valid contact number.")).toBeVisible({ timeout: 5_000 });
  257 |     expect(state.contactPosts, "invalid form must never reach the API").toBe(0);
  258 |   });
  259 | });
```