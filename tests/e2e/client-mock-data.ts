// Shared mock backend + fixtures for client-only QA (QA-05..QA-14).
//
// The client site talks to `http://localhost:3001` (src/BaseUrl.tsx). No real
// backend is started during this QA pass (its .env points at a live Mongo —
// see QA-01). Instead every request is intercepted in the browser and answered
// with realistic payloads shaped exactly like ClientRequestController.js /
// getNewVehicles / campaign-types responses, so each client page can be
// exercised end-to-end in Chromium without touching live infrastructure.

import { expect, type Page } from "@playwright/test";

export const TEST_USER = {
  _id: "cust_1111111111",
  name: "Test Client",
  email: "client@example.com",
  phone: "9876543210",
  accountType: "individual",
};

const MOCK_TOKEN = "mock-customer-jwt";

/** Seed the localStorage keys `useAuth`/`clientAuthHeaders` read. */
export async function seedClientAuth(page: Page) {
  await page.addInitScript(
    ({ user, token }) => {
      localStorage.setItem("roadshow_user", JSON.stringify(user));
      localStorage.setItem("roadshow_token", token);
      localStorage.setItem(
        "roadshow_session_expiry",
        String(Date.now() + 3_600_000),
      );
    },
    { user: TEST_USER, token: MOCK_TOKEN },
  );
}

/** Seed an ALREADY-EXPIRED session (for negative/session tests). */
export async function seedClientAuthExpired(page: Page) {
  await page.addInitScript(
    ({ user, token }) => {
      localStorage.setItem("roadshow_user", JSON.stringify(user));
      localStorage.setItem("roadshow_token", token);
      localStorage.setItem(
        "roadshow_session_expiry",
        String(Date.now() - 60_000),
      );
    },
    { user: TEST_USER, token: MOCK_TOKEN },
  );
}

/* ------------------------------------------------------------------ */
/* Vehicle catalog fixtures                                            */
/* ------------------------------------------------------------------ */

export const VEHICLE_CATALOG = {
  _id: "64f1c2e5d3b9a4001f2e3d01",
  basicInfo: {
    vehicleType: { _id: "vt_isuzu_npr", typeName: "Isuzu - NPR" },
    vehicleName: "LED Van - 12ft Body",
  },
  vehicleDescription:
    "High-visibility LED display van with audio and branding panels.",
  mediaFiles: { frontViewImage: "/images/Truck_Image.jpg" },
  totalVehicles: 4,
  registrationVehicles: [
    {
      registrationNumber: "TN-01-AB-1234",
      activeStatus: true,
      statusAvailability: { currentStatus: "available" },
    },
    {
      registrationNumber: "TN-01-CD-5678",
      activeStatus: true,
      statusAvailability: { currentStatus: "available" },
    },
    {
      registrationNumber: "TN-01-EF-9012",
      activeStatus: false,
      statusAvailability: { currentStatus: "unavailable" },
    },
  ],
  techSpecs: {
    dimensions: "12 ft",
    ledScreen: "P4 outdoor",
    audio: "2x 700W speakers",
  },
};

export const VEHICLE_CATALOG_RESPONSE = {
  success: true,
  data: [VEHICLE_CATALOG],
};

export const VEHICLE_TYPES_RESPONSE = {
  success: true,
  data: {
    vehicleTypes: [{ _id: "vt_isuzu_npr", typeName: "Isuzu - NPR" }],
  },
};

export const PACKAGES_RESPONSE = {
  success: true,
  data: {
    packages: [
      {
        _id: "pkg_1",
        vehicleType: "vt_isuzu_npr",
        isActive: true,
        perDayRentalCost: 12000,
      },
    ],
  },
};

export const CAMPAIGN_TYPES_RESPONSE = {
  success: true,
  data: {
    types: [
      { name: "Product Launch" },
      { name: "Brand Awareness" },
      { name: "Festival Campaign" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Client-request fixtures (shaped like ClientRequestController.js)    */
/* ------------------------------------------------------------------ */

const sharedSteps = [
  {
    key: "submitted",
    label: "Request Submitted",
    status: "done",
    completedAt: "2026-08-10T09:30:00.000Z",
  },
  {
    key: "confirmed",
    label: "Order Confirmed",
    status: "done",
    completedAt: "2026-08-11T10:00:00.000Z",
  },
  {
    key: "prepared",
    label: "Prepared for Campaign",
    status: "done",
    completedAt: "2026-08-20T08:00:00.000Z",
  },
  {
    key: "onRoad",
    label: "On Road",
    status: "current",
    completedAt: null,
  },
  {
    key: "completed",
    label: "Campaign Completed",
    status: "upcoming",
    completedAt: null,
  },
];

export const BOOKING_ONROAD = {
  _id: "64f1c2e5d3b9a4001f2e3c01",
  clientOrderId: "RSQ-2026-000123",
  status: 1,
  createdAt: "2026-08-10T09:30:00.000Z",
  subtotal: 150000,
  gstAmount: 27000,
  estimatedTotal: 177000,
  name: "Test Client",
  companyName: "Acme Traders Pvt Ltd",
  phone: "9876543210",
  email: "client@example.com",
  campaignType: "Product Launch",
  location: "Chennai",
  route: "Chennai → Coimbatore → Madurai",
  journeyStage: { index: 3, key: "onRoad" },
  steps: sharedSteps,
  isCancelled: false,
  vehicleUnavailable: false,
  onRoad: { day: 3, totalDays: 6 },
  vehicleTypes: [
    {
      vehicleName: "LED Van - 12ft Body",
      vehicleType: { _id: "vt_isuzu_npr", name: "Isuzu - NPR" },
      vehicleTypeImage: "/images/Truck_Image.jpg",
      quantity: 2,
      fromDate: "2026-08-21",
      toDate: "2026-08-26",
      totalDays: 6,
      pricePerDay: 12000,
      lineTotal: 144000,
      campaignName: "Acme Product Launch",
      campaignType: "Product Launch",
      campaignLocation: "Chennai",
      needPromoter: false,
      promoterQuantity: 0,
    },
    {
      vehicleName: "LED Van - 12ft Body",
      vehicleType: { _id: "vt_isuzu_npr", name: "Isuzu - NPR" },
      vehicleTypeImage: "/images/Truck_Image.jpg",
      quantity: 1,
      fromDate: "2026-08-21",
      toDate: "2026-08-23",
      totalDays: 3,
      pricePerDay: 2000,
      lineTotal: 6000,
      campaignName: "Acme Product Launch",
      campaignType: "Product Launch",
      campaignLocation: "Chennai",
      needPromoter: true,
      promoterType: "Female",
      promoterGender: "Female",
      promoterQuantity: 2,
    },
  ],
};

export const BOOKING_PENDING = {
  _id: "64f1c2e5d3b9a4001f2e3c02",
  clientOrderId: "RSQ-2026-000088",
  status: 0,
  createdAt: "2026-09-01T12:00:00.000Z",
  subtotal: 24000,
  gstAmount: 4320,
  estimatedTotal: 28320,
  name: "Test Client",
  companyName: "Beta Distributors",
  phone: "9876543210",
  email: "client@example.com",
  campaignType: "Brand Awareness",
  location: "Coimbatore",
  journeyStage: { index: 0, key: "submitted" },
  steps: [
    {
      key: "submitted",
      label: "Request Submitted",
      status: "current",
      completedAt: "2026-09-01T12:00:00.000Z",
    },
  ],
  isCancelled: false,
  vehicleUnavailable: false,
  onRoad: null,
  vehicleTypes: [
    {
      vehicleName: "LED Van - 12ft Body",
      vehicleType: { _id: "vt_isuzu_npr", name: "Isuzu - NPR" },
      vehicleTypeImage: "/images/Truck_Image.jpg",
      quantity: 1,
      fromDate: "2026-09-15",
      toDate: "2026-09-17",
      totalDays: 3,
      pricePerDay: 8000,
      lineTotal: 24000,
      campaignName: "Beta Brand Push",
      campaignType: "Brand Awareness",
      campaignLocation: "Coimbatore",
      needPromoter: true,
      promoterType: "Male",
      promoterGender: "Male",
      promoterQuantity: 3,
    },
  ],
};

export const BOOKING_CANCELLED = {
  ...BOOKING_PENDING,
  _id: "64f1c2e5d3b9a4001f2e3c03",
  clientOrderId: "RSQ-2026-000042",
  subtotal: 90000,
  gstAmount: 16200,
  estimatedTotal: 0,
  isCancelled: true,
  journeyStage: { index: 5, key: "cancelled" },
};

/* Tracking payload for the on-road booking                      */
export const TRACKING_LIVE = {
  clientOrderId: "RSQ-2026-000123",
  bookingSummary: {
    campaignName: "Acme Product Launch",
    location: "Chennai",
    startDate: "2026-08-21",
    endDate: "2026-08-26",
    totalDays: 6,
    vehicleTypeCount: 2,
    vehicleCount: 3,
  },
  journeyStage: { index: 3, key: "onRoad" },
  isCancelled: false,
  vehicleUnavailable: false,
  onRoad: { day: 3, totalDays: 6 },
  steps: sharedSteps,
  activity: [
    { label: "Campaign confirmed", at: "2026-08-11T10:00:00.000Z" },
    { label: "Vehicle dispatched", at: "2026-08-20T08:00:00.000Z" },
    { label: "On-site setup complete", at: "2026-08-21T09:00:00.000Z" },
  ],
  dayWiseReport: [
    {
      day: "2026-08-21",
      status: "completed",
      distanceCoveredKm: 85,
      activationsCount: 12,
      leadsCollected: 40,
      peopleEngaged: 800,
      routeNote: "Chennai north circuit",
      photos: [],
      isAbsentDay: false,
    },
    {
      day: "2026-08-22",
      status: "completed",
      distanceCoveredKm: 110,
      activationsCount: 15,
      leadsCollected: 55,
      peopleEngaged: 950,
      routeNote: "Chennai centre circuit",
      photos: [],
      isAbsentDay: false,
    },
    {
      day: "2026-08-23",
      status: "ongoing",
      distanceCoveredKm: 42,
      activationsCount: 6,
      leadsCollected: 18,
      peopleEngaged: 320,
      routeNote: "Chennai south circuit",
      photos: [],
      isAbsentDay: false,
    },
  ],
  photos: [],
  lastUpdatedAt: "2026-08-23T10:00:00.000Z",
};

export const LIVE_LOCATION = {
  success: true,
  data: {
    vehicles: [
      {
        registrationNumber: "TN-01-AB-1234",
        latitude: 13.0827,
        longitude: 80.2707,
        address: "Chennai (Anna Salai)",
        speedKmh: 42,
        status: "Moving",
        distanceCoveredKm: 237,
        lastUpdatedAt: "2026-08-23T09:55:00.000Z",
        isStale: false,
        unavailable: false,
        pending: false,
        vehicleIndex: 0,
        vehicleName: "LED Van - 12ft Body",
      },
      {
        registrationNumber: "TN-01-CD-5678",
        latitude: 13.0505,
        longitude: 80.2378,
        address: "Chennai (T. Nagar)",
        speedKmh: 0,
        status: "Parked",
        distanceCoveredKm: 196,
        lastUpdatedAt: "2026-08-23T09:40:00.000Z",
        isStale: false,
        unavailable: false,
        pending: false,
        vehicleIndex: 1,
        vehicleName: "LED Van - 12ft Body",
      },
    ],
  },
};

export const ROUTE_TRACK = {
  success: true,
  data: {
    vehicles: [
      { registrationNumber: "TN-01-AB-1234", trackId: "track-abc-123" },
      { registrationNumber: "TN-01-CD-5678", trackId: null },
    ],
  },
};

export const DRIVING_SUMMARY = {
  success: true,
  data: {
    day: "2026-08-22",
    distanceCoveredKm: 196,
    activationCount: 27,
    leadsCollected: 95,
    peopleEngaged: 1750,
    totalDrivingMinutes: 620,
  },
};

export const VEHICLE_HISTORY = {
  success: true,
  data: {
    history: [
      {
        day: "2026-08-21",
        registrationNumber: "TN-01-AB-1234",
        distanceCoveredKm: 85,
        durationMinutes: 300,
        reportStatus: "reported",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Routable mock backend                                               */
/* ------------------------------------------------------------------ */

export type BackendState = {
  bookings: Record<string, unknown>[];
  createBooking: Record<string, unknown> | null;
  tracking: Record<string, unknown>;
  liveLocation: Record<string, unknown>;
  routeTrack: Record<string, unknown>;
  drivingSummary: Record<string, unknown>;
  vehicleHistory: Record<string, unknown>;
  /** Truthy => order endpoints answer 500 with a message. */
  failOrders: boolean;
  /** Truthy => /client-requests/mine answers { success:true, data:[] }. */
  emptyMine: boolean;
  /** Truthy => /client-requests/mine answers a 200 with a non-JSON body. */
  malformedMine: boolean;
  mineHits: number;
  detailHits: number;
  trackingHits: number;
  contactPosts: number;
  /** Authorization header values seen on client-request calls. */
  seenAuthHeaders: string[];
};

export function makeBackendState(): BackendState {
  return {
    bookings: [BOOKING_ONROAD, BOOKING_PENDING, BOOKING_CANCELLED],
    createBooking: null,
    tracking: TRACKING_LIVE,
    liveLocation: LIVE_LOCATION,
    routeTrack: ROUTE_TRACK,
    drivingSummary: DRIVING_SUMMARY,
    vehicleHistory: VEHICLE_HISTORY,
    failOrders: false,
    emptyMine: false,
    malformedMine: false,
    mineHits: 0,
    detailHits: 0,
    trackingHits: 0,
    contactPosts: 0,
    seenAuthHeaders: [],
  };
}

/** Register the catch-all for `http://localhost:3001/**`. Everything on the
 *  Next dev origin (localhost:3000) passes through untouched. */
export function installMockBackend(page: Page, state: BackendState) {
  return page.route("**", async (route) => {
    const url = new URL(route.request().url());

    if (!(url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
      return route.continue();
    }

    if (url.port !== "3001") {
      return route.continue();
    }

    const { pathname: path } = url;
    const method = route.request().method();

    const fail = () =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Mock server failure." }),
      });

    const ok = (data: unknown) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data }),
      });

    /* ---- catalog endpoints (public, no auth) ---- */
    if (path === "/api/getNewVehicles") return ok(VEHICLE_CATALOG_RESPONSE.data);
    if (path === "/api/vehicle-types") return ok(VEHICLE_TYPES_RESPONSE.data);
    if (path === "/packages") return ok(PACKAGES_RESPONSE.data);
    if (path === "/admin/campaign-types") return ok(CAMPAIGN_TYPES_RESPONSE.data);
    if (path === "/contact-enquiry" && method === "POST") {
      state.contactPosts += 1;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Enquiry submitted." }),
      });
    }

    if (path === "/client-requests" && method === "POST") {
      if (state.createBooking) {
        state.bookings = [state.createBooking, ...state.bookings];
        return ok(state.createBooking);
      }
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Unable to submit your request." }),
      });
    }
    const isOrderRoute =
      path === "/client-requests/mine" || /^\/client-requests\//.test(path);

    if (isOrderRoute) {
      const auth = route.request().headers()["authorization"] || "";
      if (auth) state.seenAuthHeaders.push(auth);
    }

    if (path === "/client-requests/mine") {
      state.mineHits += 1;
      if (state.failOrders) return fail();
      if (state.malformedMine) {
        return route.fulfill({
          status: 200,
          contentType: "text/plain",
          body: "this is not a valid JSON payload {{{{",
        });
      }
      return ok(state.emptyMine ? [] : state.bookings);
    }

    const orderMatch = /^\/client-requests\/([^/]+)$/.exec(path);
    if (orderMatch && method === "GET") {
      state.detailHits += 1;
      if (state.failOrders) return fail();
      const found = state.bookings.find(
        (b) => b._id === orderMatch[1] || b.clientOrderId === orderMatch[1],
      );
      if (!found) {
        return route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ success: false, message: "Booking not found." }),
        });
      }
      return ok(found);
    }

    if (/^\/client-requests\/[^/]+\/tracking$/.test(path)) {
      state.trackingHits += 1;
      if (state.failOrders) return fail();
      return ok(state.tracking);
    }
    if (/^\/client-requests\/[^/]+\/live-location$/.test(path)) {
      return ok(state.liveLocation.data as Record<string, unknown>);
    }
    if (/^\/client-requests\/[^/]+\/route-track$/.test(path)) {
      return ok(state.routeTrack.data as Record<string, unknown>);
    }
    if (/^\/client-requests\/[^/]+\/driving-summary/.test(path)) {
      return ok(state.drivingSummary.data as Record<string, unknown>);
    }
    if (/^\/client-requests\/[^/]+\/vehicle-history/.test(path)) {
      return ok(state.vehicleHistory.data as Record<string, unknown>);
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Not found." }),
    });
  });
}

/** Assert representative values from the on-road booking render in the
 *  page body — order id, dates, GST and grand total (data consistency). */
export async function expectBookingSummaryVisible(page: Page) {
  const bodyText = await page.locator("body").innerText();
  for (const probe of [
    "RSQ-2026-000123",
    "Acme Traders Pvt Ltd",
    "1,77,000.00",
  ]) {
    expect(bodyText, `expected "${probe}" in page body`).toContain(probe);
  }
  expect(bodyText, "expected GST amount to render").toContain("27,000");
}