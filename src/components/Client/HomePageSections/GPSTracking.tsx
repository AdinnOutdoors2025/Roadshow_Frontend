/*eslint-disable*/
//@ts-nocheck
"use client";

import { Reveal } from "./Reveal";
import { Activity, MapPin, Navigation2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BleedButton } from "./BleedButton";

type LatLng = [number, number];

type RouteStatus = "loading" | "ready" | "error";

type VehicleZone = {
  district: string;
  code: string;
  label: string;
  center: LatLng;
  stops: LatLng[];
  major?: boolean;
};

type Vehicle = {
  id: string;
  label: string;
  district: string;
  route: LatLng[];
  size: number;
  phase: number;
};

type RouteMetrics = {
  route: LatLng[];
  cumulativeKm: number[];
  totalKm: number;
};

type VehicleMotion = {
  metrics: RouteMetrics;
  currentDistanceKm: number;
  fromDistanceKm: number;
  toDistanceKm: number;
  segmentStartMs: number;
  segmentDurationMs: number;
  pauseMs: number;
  speedKmh: number;
  seed: number;
};

const VEHICLE_IMAGE_PATH = "/images/assets/Rdsw_Web_images/map-vehicle.png";
const VEHICLE_IMAGE_ROTATION_OFFSET = 0;

// Map marker mode:
// true  -> use location pin icon style. Pin stays upright and bottom tip points GPS location.
// false -> use vehicle icon style. Icon rotates based on road direction.
const USE_LOCATION_PIN_MARKER = true;

// Pin PNG is square, so width and height should stay equal.
// Reduce this value if the pin still feels large.
const LOCATION_PIN_SIZE_MULTIPLIER = 0.72;
const LOCATION_PIN_MIN_SIZE = 18;
const LOCATION_PIN_ANCHOR_Y_RATIO = 0.86;

/*
  Vehicle zoom size control:
  - Zoom in  => vehicle becomes bigger
  - Zoom out => vehicle becomes smaller
*/
const MIN_VEHICLE_SCALE = 0.45;
const MAX_VEHICLE_SCALE = 5.2;
const VEHICLE_ZOOM_SCALE_POWER = 1.34;

const MIN_SPEED_KMH = 4;
const MAX_SPEED_KMH = 12;
const GPS_UPDATE_MIN_MS = 5000;
const GPS_UPDATE_MAX_MS = 15000;
const SIMULATION_ROUTE_SPEED_MULTIPLIER = 7;

const ROAD_ROUTE_CACHE_KEY = "adinn_zone_road_routes_v1";
const ROAD_ROUTE_CACHE_DAYS = 7;

const southIndiaBounds: LatLng[] = [
  [7.8, 76.0],
  [13.4, 80.5],
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getVehicleScaleByZoomValue(zoom: number, baseZoom: number) {
  const zoomDifference = zoom - baseZoom;

  return clamp(
    Math.pow(VEHICLE_ZOOM_SCALE_POWER, zoomDifference),
    MIN_VEHICLE_SCALE,
    MAX_VEHICLE_SCALE,
  );
}

function getVehicleScaleByZoom(map: any, baseZoom: number) {
  return getVehicleScaleByZoomValue(map.getZoom(), baseZoom);
}

function makeLoopStops(points: LatLng[]): LatLng[] {
  return [...points, points[0]];
}

const vehicleZones: VehicleZone[] = [
  {
    district: "Madurai",
    code: "MDU-01",
    label: "Arapalayam",
    major: true,
    center: [9.9305, 78.1018],
    stops: makeLoopStops([
      [9.9305, 78.1018],
      [9.9348, 78.0965],
      [9.9415, 78.1046],
      [9.9359, 78.1127],
      [9.9277, 78.1088],
    ]),
  },
  {
    district: "Madurai",
    code: "MDU-02",
    label: "Kalavasal Bypass",
    major: true,
    center: [9.9253, 78.0877],
    stops: makeLoopStops([
      [9.9253, 78.0877],
      [9.9325, 78.0835],
      [9.9369, 78.0924],
      [9.9279, 78.0996],
      [9.9184, 78.0932],
    ]),
  },
  {
    district: "Madurai",
    code: "MDU-03",
    label: "Pudur",
    major: true,
    center: [9.9578, 78.1415],
    stops: makeLoopStops([
      [9.9578, 78.1415],
      [9.9668, 78.1465],
      [9.9602, 78.1577],
      [9.9496, 78.1513],
      [9.9497, 78.1385],
    ]),
  },
  {
    district: "Madurai",
    code: "MDU-04",
    label: "Mattuthavani",
    major: true,
    center: [9.9486, 78.1638],
    stops: makeLoopStops([
      [9.9486, 78.1638],
      [9.9584, 78.1687],
      [9.9512, 78.1806],
      [9.9396, 78.1757],
      [9.9395, 78.1609],
    ]),
  },
  {
    district: "Madurai",
    code: "MDU-05",
    label: "KK Nagar",
    major: true,
    center: [9.9359, 78.1464],
    stops: makeLoopStops([
      [9.9359, 78.1464],
      [9.9442, 78.1487],
      [9.9448, 78.1598],
      [9.9323, 78.1604],
      [9.9274, 78.1491],
    ]),
  },
  {
    district: "Madurai",
    code: "MDU-06",
    label: "Tallakulam",
    major: true,
    center: [9.9403, 78.1311],
    stops: makeLoopStops([
      [9.9403, 78.1311],
      [9.9504, 78.1295],
      [9.9524, 78.1416],
      [9.9414, 78.1462],
      [9.9335, 78.1362],
    ]),
  },
  {
    district: "Madurai",
    code: "MDU-07",
    label: "Goripalayam",
    major: true,
    center: [9.9254, 78.1286],
    stops: makeLoopStops([
      [9.9254, 78.1286],
      [9.9319, 78.1233],
      [9.9363, 78.1328],
      [9.9273, 78.1408],
      [9.9197, 78.1332],
    ]),
  },
  {
    district: "Madurai",
    code: "MDU-08",
    label: "Thiruparankundram",
    major: true,
    center: [9.8811, 78.0731],
    stops: makeLoopStops([
      [9.8811, 78.0731],
      [9.8935, 78.0712],
      [9.8954, 78.0867],
      [9.8795, 78.0912],
      [9.8704, 78.0788],
    ]),
  },

  {
    district: "Chennai",
    code: "CHN-01",
    label: "T Nagar",
    major: true,
    center: [13.0418, 80.2341],
    stops: makeLoopStops([
      [13.0418, 80.2341],
      [13.0511, 80.2305],
      [13.0523, 80.2447],
      [13.0391, 80.2491],
      [13.0329, 80.2382],
    ]),
  },
  {
    district: "Chennai",
    code: "CHN-02",
    label: "Anna Nagar",
    major: true,
    center: [13.085, 80.2101],
    stops: makeLoopStops([
      [13.085, 80.2101],
      [13.0957, 80.2038],
      [13.1011, 80.2214],
      [13.0861, 80.2295],
      [13.0741, 80.2169],
    ]),
  },
  {
    district: "Chennai",
    code: "CHN-03",
    label: "Velachery",
    major: true,
    center: [12.9815, 80.2209],
    stops: makeLoopStops([
      [12.9815, 80.2209],
      [12.9918, 80.2159],
      [12.9987, 80.2322],
      [12.9842, 80.2412],
      [12.9711, 80.2294],
    ]),
  },
  {
    district: "Chennai",
    code: "CHN-04",
    label: "OMR Sholinganallur",
    major: true,
    center: [12.901, 80.2279],
    stops: makeLoopStops([
      [12.901, 80.2279],
      [12.9182, 80.2294],
      [12.9221, 80.2454],
      [12.9027, 80.2527],
      [12.8874, 80.2382],
    ]),
  },
  {
    district: "Chennai",
    code: "CHN-05",
    label: "Tambaram",
    major: true,
    center: [12.9249, 80.1],
    stops: makeLoopStops([
      [12.9249, 80.1],
      [12.9384, 80.0965],
      [12.9408, 80.1168],
      [12.9219, 80.1215],
      [12.9102, 80.1054],
    ]),
  },

  {
    district: "Coimbatore",
    code: "CBE-01",
    label: "Gandhipuram",
    major: true,
    center: [11.0183, 76.9678],
    stops: makeLoopStops([
      [11.0183, 76.9678],
      [11.0276, 76.9641],
      [11.0302, 76.9782],
      [11.0166, 76.9835],
      [11.0078, 76.9701],
    ]),
  },
  {
    district: "Coimbatore",
    code: "CBE-02",
    label: "RS Puram",
    major: true,
    center: [11.0088, 76.9492],
    stops: makeLoopStops([
      [11.0088, 76.9492],
      [11.0172, 76.9408],
      [11.0231, 76.9547],
      [11.0103, 76.9635],
      [10.9994, 76.9534],
    ]),
  },
  {
    district: "Coimbatore",
    code: "CBE-03",
    label: "Avinashi Road",
    major: true,
    center: [11.0225, 77.0005],
    stops: makeLoopStops([
      [11.0225, 77.0005],
      [11.0331, 76.9929],
      [11.0415, 77.0127],
      [11.0263, 77.0241],
      [11.0135, 77.0089],
    ]),
  },
  {
    district: "Coimbatore",
    code: "CBE-04",
    label: "Peelamedu",
    major: true,
    center: [11.0299, 77.0267],
    stops: makeLoopStops([
      [11.0299, 77.0267],
      [11.0412, 77.0205],
      [11.0487, 77.0391],
      [11.0342, 77.0511],
      [11.0198, 77.0363],
    ]),
  },
  {
    district: "Coimbatore",
    code: "CBE-05",
    label: "Singanallur",
    major: true,
    center: [11.0002, 77.0298],
    stops: makeLoopStops([
      [11.0002, 77.0298],
      [11.0125, 77.0241],
      [11.0177, 77.0425],
      [11.0018, 77.0522],
      [10.9891, 77.0384],
    ]),
  },
  {
    district: "Coimbatore",
    code: "CBE-06",
    label: "Ukkadam",
    major: true,
    center: [10.9925, 76.9663],
    stops: makeLoopStops([
      [10.9925, 76.9663],
      [11.0018, 76.9606],
      [11.0066, 76.9754],
      [10.9939, 76.9841],
      [10.9818, 76.9715],
    ]),
  },

  {
    district: "Vellore",
    code: "VEL-01",
    label: "Katpadi",
    center: [12.9701, 79.1458],
    stops: makeLoopStops([
      [12.9701, 79.1458],
      [12.9824, 79.1395],
      [12.9851, 79.1581],
      [12.9678, 79.1662],
      [12.9564, 79.1511],
    ]),
  },
  {
    district: "Vellore",
    code: "VEL-02",
    label: "Sathuvachari",
    center: [12.9441, 79.1639],
    stops: makeLoopStops([
      [12.9441, 79.1639],
      [12.9544, 79.1582],
      [12.9592, 79.1762],
      [12.9438, 79.1845],
      [12.9321, 79.1704],
    ]),
  },
  {
    district: "Vellore",
    code: "VEL-03",
    label: "Bagayam",
    center: [12.9004, 79.1356],
    stops: makeLoopStops([
      [12.9004, 79.1356],
      [12.9131, 79.1298],
      [12.9184, 79.1473],
      [12.9021, 79.1562],
      [12.8894, 79.1411],
    ]),
  },

  {
    district: "Trichy",
    code: "TRY-01",
    label: "Central Bus Stand",
    center: [10.8001, 78.6818],
    stops: makeLoopStops([
      [10.8001, 78.6818],
      [10.8127, 78.6772],
      [10.8174, 78.6952],
      [10.8016, 78.7043],
      [10.7892, 78.6904],
    ]),
  },
  {
    district: "Trichy",
    code: "TRY-02",
    label: "Thillai Nagar",
    center: [10.8264, 78.6835],
    stops: makeLoopStops([
      [10.8264, 78.6835],
      [10.8374, 78.6778],
      [10.8432, 78.6949],
      [10.8281, 78.7051],
      [10.8158, 78.6902],
    ]),
  },
  {
    district: "Salem",
    code: "SLM-01",
    label: "Five Roads",
    center: [11.6728, 78.1385],
    stops: makeLoopStops([
      [11.6728, 78.1385],
      [11.6834, 78.1321],
      [11.6891, 78.1498],
      [11.6748, 78.1607],
      [11.6618, 78.1463],
    ]),
  },
  {
    district: "Salem",
    code: "SLM-02",
    label: "New Bus Stand",
    center: [11.6808, 78.1438],
    stops: makeLoopStops([
      [11.6808, 78.1438],
      [11.6911, 78.1396],
      [11.6958, 78.1584],
      [11.6814, 78.1662],
      [11.6682, 78.1515],
    ]),
  },
  {
    district: "Tiruppur",
    code: "TUP-01",
    label: "Kumaran Road",
    center: [11.1075, 77.3414],
    stops: makeLoopStops([
      [11.1075, 77.3414],
      [11.1186, 77.3356],
      [11.1232, 77.3531],
      [11.1084, 77.3623],
      [11.0955, 77.3478],
    ]),
  },
  {
    district: "Tiruppur",
    code: "TUP-02",
    label: "Avinashi Road",
    center: [11.1293, 77.3526],
    stops: makeLoopStops([
      [11.1293, 77.3526],
      [11.1405, 77.3474],
      [11.1461, 77.3655],
      [11.1304, 77.3743],
      [11.1177, 77.3592],
    ]),
  },
  {
    district: "Erode",
    code: "ERD-01",
    label: "Perundurai Road",
    center: [11.3414, 77.7059],
    stops: makeLoopStops([
      [11.3414, 77.7059],
      [11.3528, 77.7005],
      [11.3576, 77.7188],
      [11.3424, 77.7281],
      [11.3298, 77.7129],
    ]),
  },
  {
    district: "Erode",
    code: "ERD-02",
    label: "Brough Road",
    center: [11.3426, 77.7288],
    stops: makeLoopStops([
      [11.3426, 77.7288],
      [11.3536, 77.7236],
      [11.3581, 77.7416],
      [11.3428, 77.7502],
      [11.3309, 77.7358],
    ]),
  },
  {
    district: "Thanjavur",
    code: "TNJ-01",
    label: "Old Bus Stand",
    center: [10.7867, 79.1378],
    stops: makeLoopStops([
      [10.7867, 79.1378],
      [10.7972, 79.1329],
      [10.8034, 79.1505],
      [10.7884, 79.1603],
      [10.7757, 79.1452],
    ]),
  },
  {
    district: "Thanjavur",
    code: "TNJ-02",
    label: "Medical College Road",
    center: [10.7649, 79.1185],
    stops: makeLoopStops([
      [10.7649, 79.1185],
      [10.7763, 79.1131],
      [10.7821, 79.1314],
      [10.7666, 79.1403],
      [10.7538, 79.1262],
    ]),
  },
  {
    district: "Tirunelveli",
    code: "TEN-01",
    label: "Palayamkottai",
    center: [8.7254, 77.7406],
    stops: makeLoopStops([
      [8.7254, 77.7406],
      [8.7378, 77.7351],
      [8.7426, 77.7533],
      [8.7271, 77.7621],
      [8.7148, 77.7475],
    ]),
  },
  {
    district: "Tirunelveli",
    code: "TEN-02",
    label: "Junction",
    center: [8.7139, 77.7567],
    stops: makeLoopStops([
      [8.7139, 77.7567],
      [8.7247, 77.7514],
      [8.7295, 77.7691],
      [8.7148, 77.7782],
      [8.7019, 77.7631],
    ]),
  },
  {
    district: "Thoothukudi",
    code: "TTK-01",
    label: "VOC Road",
    center: [8.7642, 78.1348],
    stops: makeLoopStops([
      [8.7642, 78.1348],
      [8.7752, 78.1291],
      [8.7816, 78.1464],
      [8.7662, 78.1565],
      [8.7536, 78.1415],
    ]),
  },
  {
    district: "Thoothukudi",
    code: "TTK-02",
    label: "Ettayapuram Road",
    center: [8.7935, 78.1241],
    stops: makeLoopStops([
      [8.7935, 78.1241],
      [8.8052, 78.1192],
      [8.8102, 78.1375],
      [8.7947, 78.1461],
      [8.7822, 78.1312],
    ]),
  },
  {
    district: "Kanyakumari",
    code: "KK-01",
    label: "Nagercoil",
    center: [8.1782, 77.4344],
    stops: makeLoopStops([
      [8.1782, 77.4344],
      [8.1902, 77.4292],
      [8.1956, 77.4476],
      [8.1799, 77.4561],
      [8.1672, 77.4415],
    ]),
  },
  {
    district: "Kanyakumari",
    code: "KK-02",
    label: "Suchindram",
    center: [8.1548, 77.4511],
    stops: makeLoopStops([
      [8.1548, 77.4511],
      [8.1661, 77.4458],
      [8.1724, 77.4633],
      [8.1568, 77.4724],
      [8.1444, 77.4577],
    ]),
  },
  {
    district: "Puducherry",
    code: "PDY-01",
    label: "White Town",
    center: [11.9347, 79.8354],
    stops: makeLoopStops([
      [11.9347, 79.8354],
      [11.9458, 79.8308],
      [11.9511, 79.8485],
      [11.9362, 79.8571],
      [11.9235, 79.8429],
    ]),
  },
  {
    district: "Puducherry",
    code: "PDY-02",
    label: "Indira Gandhi Square",
    center: [11.9237, 79.8055],
    stops: makeLoopStops([
      [11.9237, 79.8055],
      [11.9354, 79.8001],
      [11.9408, 79.8181],
      [11.9255, 79.8273],
      [11.9128, 79.8124],
    ]),
  },
  {
    district: "Tiruvannamalai",
    code: "TVM-01",
    label: "Bus Stand",
    center: [12.2253, 79.0747],
    stops: makeLoopStops([
      [12.2253, 79.0747],
      [12.2364, 79.0695],
      [12.2411, 79.0877],
      [12.2263, 79.0964],
      [12.2134, 79.0812],
    ]),
  },
  {
    district: "Tiruvannamalai",
    code: "TVM-02",
    label: "Girivalam Road",
    center: [12.2412, 79.0612],
    stops: makeLoopStops([
      [12.2412, 79.0612],
      [12.2528, 79.0563],
      [12.2574, 79.0745],
      [12.2421, 79.0832],
      [12.2294, 79.0681],
    ]),
  },
];

const VEHICLE_COUNT = vehicleZones.length;

function preloadVehicleImage() {
  if (typeof window === "undefined") return;

  const existingPreload = document.querySelector(`link[data-adinn-vehicle-preload="true"]`);

  if (!existingPreload) {
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "image";
    preloadLink.href = VEHICLE_IMAGE_PATH;
    preloadLink.setAttribute("data-adinn-vehicle-preload", "true");
    document.head.appendChild(preloadLink);
  }

  const image = new Image();
  image.loading = "eager";
  image.decoding = "async";
  image.src = VEHICLE_IMAGE_PATH;

  if ("decode" in image) {
    image.decode().catch(() => { });
  }
}

function getCachedRoadRoutes() {
  if (typeof window === "undefined") return null;

  try {
    const cachedValue = window.localStorage.getItem(ROAD_ROUTE_CACHE_KEY);
    if (!cachedValue) return null;

    const cached = JSON.parse(cachedValue) as {
      savedAt: number;
      routes: Record<string, LatLng[]>;
    };

    const cacheAge = Date.now() - cached.savedAt;
    const maxAge = ROAD_ROUTE_CACHE_DAYS * 24 * 60 * 60 * 1000;

    if (cacheAge > maxAge) {
      window.localStorage.removeItem(ROAD_ROUTE_CACHE_KEY);
      return null;
    }

    if (!cached.routes || typeof cached.routes !== "object") return null;

    return cached.routes;
  } catch {
    return null;
  }
}

function setCachedRoadRoutes(routes: Record<string, LatLng[]>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      ROAD_ROUTE_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        routes,
      }),
    );
  } catch { }
}

async function fetchRoadSnappedRoute(zone: VehicleZone) {
  const coordinates = zone.stops.map(([lat, lng]) => `${lng},${lat}`).join(";");

  const url =
    `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
    `?overview=full&geometries=geojson&continue_straight=false`;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Route failed for ${zone.code}`);
    }

    const data = await response.json();
    const routeCoordinates = data?.routes?.[0]?.geometry?.coordinates;

    if (!Array.isArray(routeCoordinates) || routeCoordinates.length < 2) {
      throw new Error(`Invalid route for ${zone.code}`);
    }

    return routeCoordinates.map(([lng, lat]: [number, number]) => [lat, lng] as LatLng);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function loadRoadRoutes() {
  const cachedRoutes = getCachedRoadRoutes();
  if (cachedRoutes) return cachedRoutes;

  const routes: Record<string, LatLng[]> = {};
  const batchSize = 6;

  for (let i = 0; i < vehicleZones.length; i += batchSize) {
    const batch = vehicleZones.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (zone) => {
        const route = await fetchRoadSnappedRoute(zone);
        return [zone.code, route] as const;
      }),
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const [code, route] = result.value;
        if (route.length > 2) routes[code] = route;
      }
    });
  }

  if (!Object.keys(routes).length) {
    throw new Error("No road routes available");
  }

  setCachedRoadRoutes(routes);
  return routes;
}

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function randomBetween(seed: number, min: number, max: number) {
  return min + seededRandom(seed) * (max - min);
}

function distanceKm(a: LatLng, b: LatLng) {
  const earthRadiusKm = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;

  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function getBearing(from: LatLng, to: LatLng) {
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const lngDiff = ((to[1] - from[1]) * Math.PI) / 180;

  const y = Math.sin(lngDiff) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lngDiff);

  return (Math.atan2(y, x) * 180) / Math.PI;
}

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function smoothAngle(current: number, target: number) {
  const currentAngle = normalizeAngle(current);
  const targetAngle = normalizeAngle(target);

  let diff = targetAngle - currentAngle;

  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  const maxStep = 1.15;
  const smoothStep = clamp(diff * 0.06, -maxStep, maxStep);

  return current + smoothStep;
}

function createRouteMetrics(route: LatLng[]): RouteMetrics {
  const cumulativeKm: number[] = [0];

  for (let index = 1; index < route.length; index += 1) {
    cumulativeKm.push(cumulativeKm[index - 1] + distanceKm(route[index - 1], route[index]));
  }

  return {
    route,
    cumulativeKm,
    totalKm: cumulativeKm[cumulativeKm.length - 1] || 1,
  };
}

function findRouteSegment(metrics: RouteMetrics, distanceValueKm: number) {
  let low = 0;
  let high = metrics.cumulativeKm.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (metrics.cumulativeKm[mid] <= distanceValueKm) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return Math.max(0, low - 1);
}

function getPositionAtDistance(metrics: RouteMetrics, distanceValueKm: number) {
  const routeDistance = ((distanceValueKm % metrics.totalKm) + metrics.totalKm) % metrics.totalKm;

  const index = Math.min(findRouteSegment(metrics, routeDistance), metrics.route.length - 2);

  const start = metrics.route[index];
  const end = metrics.route[index + 1];

  const startDistance = metrics.cumulativeKm[index];
  const endDistance = metrics.cumulativeKm[index + 1];
  const segmentLength = Math.max(endDistance - startDistance, 0.000001);

  const localProgress = clamp((routeDistance - startDistance) / segmentLength, 0, 1);

  return [
    start[0] + (end[0] - start[0]) * localProgress,
    start[1] + (end[1] - start[1]) * localProgress,
  ] as LatLng;
}

function getBearingAtDistance(metrics: RouteMetrics, distanceValueKm: number) {
  const current = getPositionAtDistance(metrics, distanceValueKm);
  const lookAhead = getPositionAtDistance(metrics, distanceValueKm + 0.035);

  if (distanceKm(current, lookAhead) < 0.005) {
    return null;
  }

  return getBearing(current, lookAhead);
}

function nextMotionRandom(motion: VehicleMotion, min: number, max: number) {
  motion.seed += 1;
  return randomBetween(motion.seed, min, max);
}

function scheduleNextVehicleMotion(motion: VehicleMotion, now: number) {
  motion.fromDistanceKm =
    ((motion.currentDistanceKm % motion.metrics.totalKm) + motion.metrics.totalKm) %
    motion.metrics.totalKm;

  const intervalMs = nextMotionRandom(motion, GPS_UPDATE_MIN_MS, GPS_UPDATE_MAX_MS);

  const trafficRoll = nextMotionRandom(motion, 0, 1);

  let nextSpeed = clamp(
    motion.speedKmh + nextMotionRandom(motion, -2.2, 2.2),
    MIN_SPEED_KMH,
    MAX_SPEED_KMH,
  );

  let pauseMs = 0;

  if (trafficRoll < 0.16) {
    pauseMs = nextMotionRandom(motion, 1800, Math.min(7000, intervalMs * 0.7));
    nextSpeed = nextMotionRandom(motion, MIN_SPEED_KMH, 6.5);
  } else if (trafficRoll < 0.42) {
    nextSpeed = nextMotionRandom(motion, MIN_SPEED_KMH, 7.2);
  } else if (trafficRoll > 0.78) {
    nextSpeed = nextMotionRandom(motion, 8.5, MAX_SPEED_KMH);
  }

  const intervalHours = intervalMs / 3600000;
  const trafficVariation = nextMotionRandom(motion, 0.78, 1.22);

  const travelDistanceKm =
    nextSpeed * intervalHours * SIMULATION_ROUTE_SPEED_MULTIPLIER * trafficVariation;

  motion.toDistanceKm = motion.fromDistanceKm + travelDistanceKm;
  motion.segmentStartMs = now;
  motion.segmentDurationMs = intervalMs;
  motion.pauseMs = pauseMs;
  motion.speedKmh = nextSpeed;
}

function createVehicleMotion(
  vehicle: Vehicle,
  metrics: RouteMetrics,
  seed: number,
  now: number,
): VehicleMotion {
  const initialDistanceKm = vehicle.phase * metrics.totalKm;

  const motion: VehicleMotion = {
    metrics,
    currentDistanceKm: initialDistanceKm,
    fromDistanceKm: initialDistanceKm,
    toDistanceKm: initialDistanceKm,
    segmentStartMs: now,
    segmentDurationMs: 0,
    pauseMs: 0,
    speedKmh: randomBetween(seed, MIN_SPEED_KMH, MAX_SPEED_KMH),
    seed,
  };

  scheduleNextVehicleMotion(motion, now);
  return motion;
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

function updateVehicleMotion(motion: VehicleMotion, now: number) {
  const elapsed = now - motion.segmentStartMs;

  if (elapsed >= motion.segmentDurationMs) {
    motion.currentDistanceKm = motion.toDistanceKm;
    scheduleNextVehicleMotion(motion, now);
  }

  const currentElapsed = now - motion.segmentStartMs;
  const paused = currentElapsed < motion.pauseMs;

  if (paused) {
    motion.currentDistanceKm = motion.fromDistanceKm;
  } else {
    const activeElapsed = Math.max(0, currentElapsed - motion.pauseMs);
    const activeDuration = Math.max(1, motion.segmentDurationMs - motion.pauseMs);
    const progress = clamp(activeElapsed / activeDuration, 0, 1);
    const easedProgress = easeInOut(progress);

    motion.currentDistanceKm =
      motion.fromDistanceKm + (motion.toDistanceKm - motion.fromDistanceKm) * easedProgress;
  }

  return {
    position: getPositionAtDistance(motion.metrics, motion.currentDistanceKm),
    paused,
  };
}

function createVehicles(routes: Record<string, LatLng[]>): Vehicle[] {
  const vehicles: Vehicle[] = [];

  vehicleZones.forEach((zone, index) => {
    const route = routes[zone.code];
    if (!route || route.length < 2) return;

    vehicles.push({
      id: zone.code,
      label: `${zone.code} • ${zone.label}`,
      district: zone.district,
      route: index % 2 === 0 ? route : [...route].reverse(),
      size: zone.major ? 13 : 11,
      phase: randomBetween(index * 17.7, 0.05, 0.95),
    });
  });

  return vehicles;
}

function createVehicleIcon(L: any, vehicle: Vehicle, scale = 1) {
  const pinSize = Math.max(
    LOCATION_PIN_MIN_SIZE,
    Math.round(vehicle.size * scale * LOCATION_PIN_SIZE_MULTIPLIER),
  );

  const scaledWidth = USE_LOCATION_PIN_MARKER
    ? pinSize
    : Math.max(8, Math.round(vehicle.size * scale));

  const scaledHeight = USE_LOCATION_PIN_MARKER
    ? pinSize
    : Math.max(14, Math.round(vehicle.size * 1.65 * scale));

  return L.divIcon({
    className: "south-vehicle-leaflet-icon",
    html: `
      <div
        class="south-live-vehicle"
        style="
          --vehicle-width:${scaledWidth}px;
          --vehicle-height:${scaledHeight}px;
        "
      >
        <img
          src="${VEHICLE_IMAGE_PATH}"
          alt="${vehicle.label}"
          loading="eager"
          decoding="async"
        />
      </div>
    `,
    iconSize: [scaledWidth, scaledHeight],
    iconAnchor: USE_LOCATION_PIN_MARKER
      ? [scaledWidth / 2, scaledHeight * LOCATION_PIN_ANCHOR_Y_RATIO]
      : [scaledWidth / 2, scaledHeight / 2],
  });
}

function applyVehicleElementStyle(
  markerElement: HTMLElement | null,
  angle: number,
  liveScale: number,
) {
  if (!markerElement) return;

  const displayAngle = USE_LOCATION_PIN_MARKER ? 0 : angle;

  markerElement.style.setProperty("--vehicle-live-scale", `${liveScale}`);
  markerElement.style.setProperty("--vehicle-angle", `${displayAngle}deg`);
}

function SouthIndiaLiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>("loading");

  useEffect(() => {
    preloadVehicleImage();

    let map: any = null;
    let LeafletModule: any = null;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let destroyed = false;
    let baseZoom = 7;

    const markerItems: {
      marker: any;
      vehicle: Vehicle;
      motion: VehicleMotion;
      angle: number;
      iconScale: number;
      committedScale: number;
    }[] = [];

    function applyNoOverlapLayout() {
      if (!map) return;

      const placed: { x: number; y: number; radius: number }[] = [];
      const currentZoom = map.getZoom();

      const zoomBasedGap =
        currentZoom <= 6
          ? 58
          : currentZoom <= 8
            ? 48
            : currentZoom <= 10
              ? 38
              : currentZoom <= 13
                ? 28
                : 18;

      markerItems.forEach((item) => {
        const markerElement = item.marker.getElement();
        if (!markerElement) return;

        const latLng = item.marker.getLatLng();
        const point = map.latLngToContainerPoint(latLng);

        const markerRadius = Math.max(
          zoomBasedGap / 2,
          (item.vehicle.size * item.iconScale) / 2 + 8,
        );

        const isOverlapping = placed.some((placedItem) => {
          const dx = point.x - placedItem.x;
          const dy = point.y - placedItem.y;
          const gap = Math.sqrt(dx * dx + dy * dy);

          return gap < markerRadius + placedItem.radius;
        });

        if (isOverlapping) {
          markerElement.style.opacity = "0";
          markerElement.style.visibility = "hidden";
          markerElement.style.pointerEvents = "none";
        } else {
          markerElement.style.opacity = "1";
          markerElement.style.visibility = "visible";
          markerElement.style.pointerEvents = "auto";

          placed.push({
            x: point.x,
            y: point.y,
            radius: markerRadius,
          });
        }
      });
    }

    function applyVehicleScale(zoomValue?: number, commitIcon = false) {
      if (!map) return;

      const scale = getVehicleScaleByZoomValue(zoomValue ?? map.getZoom(), baseZoom);

      markerItems.forEach((item) => {
        item.iconScale = scale;

        const liveScale = scale / Math.max(item.committedScale, 0.001);

        applyVehicleElementStyle(item.marker.getElement(), item.angle, liveScale);

        if (commitIcon && LeafletModule) {
          item.marker.setIcon(createVehicleIcon(LeafletModule, item.vehicle, scale));
          item.committedScale = scale;
          applyVehicleElementStyle(item.marker.getElement(), item.angle, 1);
        }
      });

      applyNoOverlapLayout();
    }

    async function initMap() {
      const L = await import("leaflet");
      LeafletModule = L;

      if (destroyed || !mapRef.current) return;

      if (mapRef.current.clientWidth < 300 || mapRef.current.clientHeight < 300) {
        window.setTimeout(initMap, 80);
        return;
      }

      mapRef.current.innerHTML = "";

      map = L.map(mapRef.current, {
        center: [10.9, 78.3],
        zoom: 7,
        minZoom: 5,
        maxZoom: 20,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
        wheelDebounceTime: 20,
        wheelPxPerZoomLevel: 80,
        doubleClickZoom: true,
        dragging: true,
        preferCanvas: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        fadeAnimation: true,
        maxBounds: [
          [7.2, 74.0],
          [14.0, 81.2],
        ],
        maxBoundsViscosity: 0.35,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 4,
      }).addTo(map);

      const bounds = L.latLngBounds(southIndiaBounds);

      map.fitBounds(bounds, {
        padding: [30, 30],
      });

      baseZoom = map.getZoom();

      const fixMapSize = () => {
        if (!map) return;
        map.invalidateSize(false);
        applyVehicleScale();
      };

      map.on("zoomanim", (event: any) => {
        applyVehicleScale(event.zoom, false);
      });

      map.on("zoom", () => applyVehicleScale(undefined, false));
      map.on("zoomend", () => applyVehicleScale(undefined, true));
      map.on("move", applyNoOverlapLayout);
      map.on("moveend", applyNoOverlapLayout);

      window.setTimeout(fixMapSize, 50);
      window.setTimeout(fixMapSize, 250);
      window.setTimeout(fixMapSize, 700);

      resizeObserver = new ResizeObserver(fixMapSize);
      resizeObserver.observe(mapRef.current);

      try {
        const roadRoutes = await loadRoadRoutes();

        if (destroyed || !map) return;

        const vehicles = createVehicles(roadRoutes);
        const now = performance.now();

        vehicles.forEach((vehicle, index) => {
          const currentScale = getVehicleScaleByZoom(map, baseZoom);
          const icon = createVehicleIcon(L, vehicle, currentScale);
          const metrics = createRouteMetrics(vehicle.route);
          const motion = createVehicleMotion(vehicle, metrics, index * 91.7 + 18, now);

          const current = getPositionAtDistance(metrics, motion.currentDistanceKm);

          const initialBearing =
            getBearingAtDistance(metrics, motion.currentDistanceKm) ??
            VEHICLE_IMAGE_ROTATION_OFFSET;

          const initialAngle = initialBearing + VEHICLE_IMAGE_ROTATION_OFFSET;

          const marker = L.marker(current, {
            icon,
            interactive: true,
            zIndexOffset: 500,
          }).addTo(map);

          marker.bindTooltip(`${vehicle.label} • ${vehicle.district}`, {
            direction: "top",
            offset: [0, -10],
            opacity: 0.95,
          });

          applyVehicleElementStyle(marker.getElement(), initialAngle, 1);

          markerItems.push({
            marker,
            vehicle,
            motion,
            angle: initialAngle,
            iconScale: currentScale,
            committedScale: currentScale,
          });
        });

        applyVehicleScale(undefined, true);
        setRouteStatus("ready");

        const animate = () => {
          if (destroyed) return;

          const frameNow = performance.now();

          markerItems.forEach((item) => {
            const movement = updateVehicleMotion(item.motion, frameNow);

            item.marker.setLatLng(movement.position);

            if (!movement.paused) {
              const targetBearing = getBearingAtDistance(
                item.motion.metrics,
                item.motion.currentDistanceKm,
              );

              if (targetBearing !== null) {
                const targetAngle = targetBearing + VEHICLE_IMAGE_ROTATION_OFFSET;

                item.angle = smoothAngle(item.angle, targetAngle);
              }
            }

            const markerElement = item.marker.getElement();

            if (markerElement) {
              markerElement.style.setProperty(
                "--vehicle-angle",
                `${USE_LOCATION_PIN_MARKER ? 0 : item.angle}deg`,
              );
            }
          });

          applyNoOverlapLayout();
          frameId = requestAnimationFrame(animate);
        };

        animate();
      } catch {
        setRouteStatus("error");
      }
    }

    initMap();

    return () => {
      destroyed = true;
      cancelAnimationFrame(frameId);

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="relative h-[560px] w-full overflow-hidden rounded-t-[30px] bg-[#E8EFF6]">
        <img
          src={VEHICLE_IMAGE_PATH}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
        />

        <div ref={mapRef} className="absolute inset-0 h-full w-full" />

        {/* <div className="absolute right-5 top-5 z-[500] rounded-full bg-white/95 px-4 py-2 text-[12px] font-semibold text-[#111827] shadow-[0_12px_34px_rgba(15,23,42,0.14)] backdrop-blur-md">
          Live Fleet • {VEHICLE_COUNT}
        </div> */}

        {routeStatus === "loading" && (
          <div className="absolute bottom-5 left-5 z-[500] rounded-full bg-white/95 px-4 py-2 text-[12px] font-semibold text-[#475467] shadow-[0_12px_34px_rgba(15,23,42,0.12)] backdrop-blur-md">
            Syncing city road routes...
          </div>
        )}

        {routeStatus === "error" && (
          <div className="absolute bottom-5 left-5 z-[500] max-w-[280px] rounded-2xl bg-white/95 px-4 py-3 text-[12px] font-medium text-[#475467] shadow-[0_12px_34px_rgba(15,23,42,0.12)] backdrop-blur-md">
            Road route service is not available now. Vehicles are hidden to avoid fake movement.
          </div>
        )}
      </div>

      {/* <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.08] bg-white px-6 py-5">
        <div className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-[#111827]" />
          <span className="text-[#667085]">Live</span>
          <span className="font-semibold text-[#111827]">
            City Fleet Tracking
          </span>
        </div>

        <div className="text-sm font-medium text-[#667085]">
          Madurai 8 • Chennai 5 • Coimbatore 6 • Vellore 3 • Other districts 20
        </div>
      </div> */}

      <style jsx global>{`
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          background: #e8eff6 !important;
          font-family: inherit;
          z-index: 1;
        }

        .leaflet-container img,
        .leaflet-tile {
          max-width: none !important;
          max-height: none !important;
        }

        .leaflet-tile {
          filter: saturate(1.02) contrast(1.02) brightness(1.02);
        }

        .leaflet-control-container {
          position: relative;
          z-index: 700;
        }

        .leaflet-control-zoom {
          overflow: hidden;
          border: 0 !important;
          border-radius: 14px !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16) !important;
        }

        .leaflet-control-zoom a {
          border: 0 !important;
          color: #111827 !important;
          background: #ffffff !important;
        }

        .south-live-vehicle {
          position: relative;
          display: grid;
          width: var(--vehicle-width);
          height: var(--vehicle-height);
          place-items: center;
          pointer-events: auto;
          background: transparent !important;
          transform: translateZ(0) scale(var(--vehicle-live-scale, 1));
          transform-origin: center 86%;
          transition: transform 0.08s linear;
          will-change: transform;
        }

        .south-live-vehicle img {
          position: relative;
          z-index: 3;
          display: block;
          width: var(--vehicle-width) !important;
          height: var(--vehicle-height) !important;
          background: transparent !important;
          object-fit: contain;
          transform: rotate(var(--vehicle-angle, 0deg)) !important;
          transform-origin: center 86%;
          filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.2));
          transition: transform 0.16s linear;
          will-change: transform;
        }

        .south-vehicle-leaflet-icon {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }

        .south-vehicle-leaflet-icon,
        .leaflet-marker-icon {
          overflow: visible !important;
          transition:
            opacity 0.12s ease-out,
            visibility 0.12s ease-out !important;
          will-change: transform, opacity;
        }

        .leaflet-tooltip {
          border: 0 !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.96) !important;
          color: #111827 !important;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16) !important;
          font-size: 12px !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
}

export function GPSTracking() {
  return (
    <section className="section-pad">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">


          <Reveal delay={1}>
            <h2 className="mt-3 font-display text-[34px] font-semibold leading-[1.05] text-balance-tight md:text-[34px]">
              GPS Tracking to monitor your campaign with confidence.
            </h2>
          </Reveal>

          <Reveal delay={2}>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              GPS-supported visibility for routes, movement, and live execution updates across city
              roads and district campaign zones.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <ul className="mt-8 space-y-4">
              {[
                {
                  i: Activity,
                  // t: ${VEHICLE_COUNT} moving vehicles,
                  t: "Live GPS Monitoring",
                  d: "Track every vehicle in real time.",
                },
                {
                  i: Navigation2,
                  t: "Execution Photo Reports",
                  d: "Verified photos from every campaign location.",
                },
                {
                  i: MapPin,
                  t: "WhatsApp Live Updates",
                  d: "Instant progress updates delivered to your team.",
                },
              ].map((f) => (
                <li key={f.t} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E3000F]/10 text-[#E3000F]">
                    <f.i className="size-5" strokeWidth={1.4} />
                  </div>

                  <div>
                    <div className="font-medium">{f.t}</div>
                    <p className="text-sm text-muted-foreground">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={4}>
            <BleedButton
              type="button"
              className="
                mt-9
                !h-auto
                !px-6
                !py-2.5
                !text-[14px]
                !shadow-none
                !drop-shadow-none
                md:!px-8
                md:!py-6
                md:!text-[15px]
              "
              onClick={() => {
                const contactSection = document.getElementById("contact");

                if (contactSection) {
                  contactSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }

                window.history.replaceState(null, "", window.location.pathname);
              }}
            >
              Consult With Our Campaign Team
            </BleedButton>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <SouthIndiaLiveMap />
        </div>
      </div>
    </section>
  );
}
