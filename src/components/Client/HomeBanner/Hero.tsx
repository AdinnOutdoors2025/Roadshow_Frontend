/* eslint-disable */
// @ts-nocheck
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";

import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";

import {
  ACESFilmicToneMapping,
  Box3,
  BufferAttribute,
  ClampToEdgeWrapping,
  DoubleSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
  VideoTexture,
} from "three";
import "./Hero.css";
type VehicleItem = {
  id: string;

  label: string;

  path: string;

  scale: number;

  rotationY: number;
};

type AxisKey = "x" | "y" | "z";

const VEHICLES: VehicleItem[] = [
  {
    id: "ultra",

    label: "3 Sided LED ULTRA",

    path: "/models/ultra.glb",

    scale: 1,

    rotationY: -0.25,
  },

  {
    id: "l_type_led",

    label: "2 Sided LED",

    path: "/models/l_type_led.glb",

    scale: 1,

    rotationY: -0.25,
  },

  {
    id: "single_side",

    label: "Single Side Ultra",

    path: "/models/19_single_side.glb",

    scale: 1,

    rotationY: -0.25,
  },

  {
    id: "7x5",

    label: "Hybrid LED",

    path: "/models/7x5.glb",

    scale: 1,

    rotationY: -0.25,
  },
];

const LED_PANEL_OBJECT_NAMES = ["led_texture", "l_type_led_screen", "back", "side"];

const GLOBAL_LOGO_MESH_NAME = "blinn9";

const GLOBAL_LOGO_TEXTURE_SRC = "/models/adinn_logo_l_type.jpg";

const SINGLE_SIDE_BRANDING_TEXTURES: Record<string, string> = {
  Blinn_42: "/models/17x7.jpg",
};

const SINGLE_SIDE_BRANDING_MESH_NAMES = Object.keys(SINGLE_SIDE_BRANDING_TEXTURES);

// 19_single_side.glb texture mapping.
// Applies /assets/17x7.jpg only to the direct mesh named Blinn_42 / Blinn_42_001.
// It will not apply through parent/group matching, so other single-side meshes stay unchanged.
const SINGLE_SIDE_BRANDING_VEHICLE_ID = "single_side";
const SINGLE_SIDE_BLINN_42_TEXTURE_KEY = "Blinn_42";

// Important:
// Blinn_42 existing UV is coming reversed on 19_single_side.glb.
// So we regenerate UV only for this mesh and mirror X to make 17x7.jpg readable.
const SINGLE_SIDE_BLINN_42_FORCE_GENERATE_UV = true;
const SINGLE_SIDE_BLINN_42_MIRROR_X = false;
const SINGLE_SIDE_BLINN_42_MIRROR_Y = true;

const HYBRID_LED_BRANDING_TEXTURES: Record<string, string> = {
  "5x1_back_bottom": "/assets/5x1_back_bottom.jpg",
  "8x1_side_bottom": "/assets/8x1_side_bottom.jpg",
  aircutter_lf: "/assets/aircutter_lf.jpg",
  aircutter_rg: "/assets/aircutter_rg.jpg",
  cabin_front: "/assets/cabin_poster.jpg",
};

const HYBRID_LED_BRANDING_MESH_NAMES = Object.keys(HYBRID_LED_BRANDING_TEXTURES);

// Cabin front texture is intentionally strict.
// It will apply only to the real mesh named cabin_front / cabin_front001.
// It will NOT apply through material name or parent/group name, because that
// was the reason the logo appeared on the wrong side panels.
const HYBRID_CABIN_FRONT_TEXTURE_KEY = "cabin_front";

const HYBRID_CABIN_FRONT_TEXTURE_TARGET_MESH_NAMES = ["cabin_front"];

// cabin_poster.jpg has a lot of white space around the logo.
// repeat values below crop/zoom the center area so the logo becomes bigger
// and readable on the cabin_front mesh.
// Decrease these values to zoom in more. Increase them to show more of the poster.
const HYBRID_CABIN_FRONT_TEXTURE_REPEAT: [number, number] = [0.36, 0.36];
const HYBRID_CABIN_FRONT_TEXTURE_CENTER: [number, number] = [0.5, 0.5];
const HYBRID_CABIN_FRONT_TEXTURE_OFFSET: [number, number] = [0, 0];
const HYBRID_CABIN_FRONT_TEXTURE_ROTATION = 0;

const HYBRID_NON_CABIN_BRANDING_MESH_NAMES = HYBRID_LED_BRANDING_MESH_NAMES.filter(
  (meshName) => meshName !== HYBRID_CABIN_FRONT_TEXTURE_KEY,
);

const DEMO_VIDEO_SRC = "/assets/demo-campaign.mp4";

const ENABLE_LED_VIDEO_TEXTURE = false;

const ENABLE_LED_RED_FALLBACK = false;

// UI flag: set false to hide both Live Demo and Night View buttons.
const SHOW_DEMO_AND_NIGHT_VIEW_BUTTONS = false;

// System performance flag:
// true  -> vehicle GLB will load/render
// false -> vehicle GLB will not load/render, useful when system/browser hangs
const ENABLE_VEHICLE_GLB_LOADING = false;
// const ENABLE_VEHICLE_GLB_LOADING = true;

/*
  Fix for reversed video text:

  Previous output showed "contact" as "tcatnoc", so X mirror must be false.

*/

const LED_VIDEO_MIRROR_X = false;

const LED_VIDEO_MIRROR_Y = false;

/*

  Video 90 degree rotate-aa irundha true pannunga.

  Current issue mirror only, so false.

*/

const LED_VIDEO_SWAP_UV_AXES = false;

/*

  For VideoTexture on GLB/gltf, flipY false keeps the video readable.
  true can make the LED video look upside-down / inverted.

*/

const LED_VIDEO_FLIP_Y = false;

/*

  L Type mesh panels can be ordered opposite to the camera-visible L shape.
  This reverses only the UV slice order, not the text itself.

*/

const LED_L_TYPE_REVERSE_PANEL_ORDER = true;

const CAMERA_DEFAULT_POSITION: [number, number, number] = [5.15, 1.2, 5.85];

const CAMERA_DEMO_POSITION: [number, number, number] = [4.15, 1.15, 4.65];

const CAMERA_DEFAULT_FOV = 27.2;

const CAMERA_DEMO_FOV = 23.8;

// Camera switch transition only. Final zoom values are not changed.
// This creates the same "unzoom first, then gently zoom into the selected vehicle" feel
// for 7x5 LED and L Type LED too.
const CAMERA_SWITCH_ZOOM_OUT_POSITION: [number, number, number] = [6.85, 1.42, 7.75];

const CAMERA_SWITCH_ZOOM_OUT_FOV = 30.4;

const CAMERA_SWITCH_ZOOM_OUT_DURATION_MS = 420;

type VehicleCameraConfig = {
  position: [number, number, number];
  fov: number;
  boundsMargin: number;
  zoomSpeed: number;
  minDistance: number;
  maxDistance: number;
};

// Used for vehicle-specific camera fit. The first/default vehicle uses this from initial page load;
// other GLBs use their config once the user switches vehicles.
const AFTER_SWITCH_CAMERA_CONFIG_BY_VEHICLE: Record<string, VehicleCameraConfig> = {
  "7x5": {
    position: [5.15, 1.2, 5.85],
    fov: 27.2,
    boundsMargin: 0.95,
    zoomSpeed: 0.5,
    minDistance: 3.6,
    maxDistance: 9.2,
  },

  l_type_led: {
    position: [5.15, 1.2, 5.85],
    fov: 27.2,
    boundsMargin: 0.95,
    zoomSpeed: 0.5,
    minDistance: 3.6,
    maxDistance: 9.2,
  },

  single_side: {
    position: [6.85, 1.42, 7.75],
    fov: 30.4,
    boundsMargin: 1.28,
    zoomSpeed: 0.42,
    minDistance: 5.1,
    maxDistance: 10.2,
  },

  ultra: {
    position: [6.85, 1.42, 7.75],
    fov: 30.4,
    boundsMargin: 1.28,
    zoomSpeed: 0.42,
    minDistance: 5.1,
    maxDistance: 10.2,
  },

  "3_side": {
    position: [6.75, 1.4, 7.65],
    fov: 30.2,
    boundsMargin: 1.24,
    zoomSpeed: 0.42,
    minDistance: 5,
    maxDistance: 10,
  },
};

function getAfterSwitchCameraConfig(vehicleId: string): VehicleCameraConfig {
  return (
    AFTER_SWITCH_CAMERA_CONFIG_BY_VEHICLE[vehicleId] || AFTER_SWITCH_CAMERA_CONFIG_BY_VEHICLE["7x5"]
  );
}

const CAMERA_TARGET: [number, number, number] = [0, 0.02, 0];

const CAMERA_DEMO_TARGET: [number, number, number] = [0, 0.05, 0];

const AUTO_ROTATE_SPEED = 0.045;

const AUTO_ROTATE_PAUSE_AFTER_DRAG_MS = 2200;

const DRAG_ROTATE_SENSITIVITY = 0.032;

// Left-mouse drag up/down lift. Keep it small so the vehicle feels premium, not jumpy.
const DRAG_VERTICAL_MOVE_SENSITIVITY = 0.0048;

const DRAG_VERTICAL_MAX_UP_OFFSET = 0.1; // upward drag limit - keeps vehicle below tabs

const DRAG_VERTICAL_MAX_DOWN_OFFSET = 0.16; // downward drag limit

const DRAG_VERTICAL_SMOOTHNESS = 18;

const DRAG_VERTICAL_RETURN_SMOOTHNESS = 7;

const DRAG_VELOCITY_MULTIPLIER = 0.0075;

const DRAG_INERTIA_DAMPING = 0.9;

const ROTATION_SMOOTHNESS = 26;

// Preload only the first/default vehicle on initial page load.
// Other GLBs load only when their vehicle tab is selected.
// If ENABLE_VEHICLE_GLB_LOADING is false, no vehicle GLB is preloaded.
if (ENABLE_VEHICLE_GLB_LOADING) {
  useGLTF.preload(VEHICLES[0].path);
}

function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

function compactName(name: string) {
  return normalizeName(name).replace(/[^a-z0-9]+/g, "");
}

function isLedPanelName(name: string) {
  const normalized = normalizeName(name);
  const compact = compactName(name);

  return LED_PANEL_OBJECT_NAMES.some((targetName) => {
    const target = normalizeName(targetName);
    const compactTarget = compactName(targetName);

    return (
      normalized === target ||
      normalized.includes(target) ||
      compact === compactTarget ||
      compact.includes(compactTarget)
    );
  });
}

function isGlobalLogoTargetName(name: string) {
  const compact = compactName(name);
  const target = compactName(GLOBAL_LOGO_MESH_NAME);

  return compact === target;
}

function isCabinBrandingTextureKey(key: string | null) {
  return key === HYBRID_CABIN_FRONT_TEXTURE_KEY;
}

function isDirectCabinFrontTargetName(name: string) {
  const compact = compactName(name);

  if (!compact) return false;

  return HYBRID_CABIN_FRONT_TEXTURE_TARGET_MESH_NAMES.some((targetName) => {
    const target = compactName(targetName);

    // Allows cabin_front, cabin_front_001, cabin_frontMesh after compacting.
    // Does not allow object_cabin_front or parent cabin_front, to avoid wrong side matches.
    return compact === target || compact.startsWith(target);
  });
}

function forceObjectAndParentsVisible(object: Object3D) {
  let current: Object3D | null = object;

  while (current) {
    current.visible = true;
    current = current.parent;
  }
}

function isDirectSingleSideBrandingTargetName(name: string) {
  const compact = compactName(name);

  if (!compact) return false;

  return SINGLE_SIDE_BRANDING_MESH_NAMES.some((targetName) => {
    const target = compactName(targetName);

    return compact === target || compact.startsWith(target);
  });
}

function getSingleSideBrandingTextureKeyForMesh(object: Object3D) {
  // Strict direct mesh-name match only.
  // This prevents /assets/17x7.jpg from applying to any parent/group/other mesh.
  return isDirectSingleSideBrandingTargetName(object.name || "")
    ? SINGLE_SIDE_BLINN_42_TEXTURE_KEY
    : null;
}

function getHybridLedBrandingTextureKey(name: string, options: { allowCabinFront?: boolean } = {}) {
  const compact = compactName(name);

  if (!compact) return null;

  if (options.allowCabinFront && isDirectCabinFrontTargetName(name)) {
    return HYBRID_CABIN_FRONT_TEXTURE_KEY;
  }

  const exactMatch = HYBRID_NON_CABIN_BRANDING_MESH_NAMES.find(
    (meshName) => compact === compactName(meshName),
  );

  if (exactMatch) return exactMatch;

  const softMatch = HYBRID_NON_CABIN_BRANDING_MESH_NAMES.find((meshName) => {
    const target = compactName(meshName);

    return compact.includes(target);
  });

  return softMatch || null;
}

function getHybridLedBrandingTextureKeyForMesh(
  object: Object3D,
  materials: Array<{ name?: string } | null | undefined> = [],
) {
  // Cabin front must be matched ONLY by the direct mesh name.
  // Do not use material name or parent/group name for cabin_front.
  const directObjectMatch = getHybridLedBrandingTextureKey(object.name || "", {
    allowCabinFront: true,
  });

  if (directObjectMatch) return directObjectMatch;

  // Other hybrid textures can still use material-name matching.
  const materialMatch =
    materials
      .map((material) =>
        getHybridLedBrandingTextureKey(material?.name || "", {
          allowCabinFront: false,
        }),
      )
      .find(Boolean) || null;

  if (materialMatch) return materialMatch;

  // Other hybrid textures can still use parent/group matching.
  // Cabin front is intentionally excluded here.
  let current = object.parent;

  while (current) {
    const ancestorMatch = getHybridLedBrandingTextureKey(current.name || "", {
      allowCabinFront: false,
    });

    if (ancestorMatch) return ancestorMatch;

    current = current.parent;
  }

  return null;
}

type AppliedLogoTextureWindow = Window & {
  __ADINN_LOGO_TEXTURE_APPLIED_VEHICLES__?: Record<string, string>;
};

function printAppliedLogoTextureVehicles(vehicle: VehicleItem, appliedMeshCount: number) {
  if (typeof window === "undefined" || appliedMeshCount <= 0) return;

  const browserWindow = window as AppliedLogoTextureWindow;

  browserWindow.__ADINN_LOGO_TEXTURE_APPLIED_VEHICLES__ = {
    ...(browserWindow.__ADINN_LOGO_TEXTURE_APPLIED_VEHICLES__ || {}),
    [vehicle.id]: vehicle.label,
  };

  const appliedVehicles = VEHICLES.filter(
    (item) => browserWindow.__ADINN_LOGO_TEXTURE_APPLIED_VEHICLES__?.[item.id],
  ).map((item) => item.label);

  console.info(`[Adinn Logo Texture] ${GLOBAL_LOGO_TEXTURE_SRC} applied vehicles`, appliedVehicles);
}

function hasLedPanelAncestor(object: Object3D) {
  let current = object.parent;

  while (current) {
    if (isLedPanelName(current.name || "")) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function getAxisValue(vertex: Vector3, axis: AxisKey) {
  if (axis === "x") return vertex.x;

  if (axis === "y") return vertex.y;

  return vertex.z;
}

function getProjectionFromNormal(normal: Vector3): {
  key: string;

  axisU: AxisKey;

  axisV: AxisKey;
} {
  const absX = Math.abs(normal.x);

  const absY = Math.abs(normal.y);

  const absZ = Math.abs(normal.z);

  if (absX >= absY && absX >= absZ) {
    return {
      key: normal.x >= 0 ? "posX-side-panel" : "negX-side-panel",

      axisU: "z",

      axisV: "y",
    };
  }

  if (absZ >= absX && absZ >= absY) {
    return {
      key: normal.z >= 0 ? "posZ-front-panel" : "negZ-front-panel",

      axisU: "x",

      axisV: "y",
    };
  }

  return {
    key: normal.y >= 0 ? "posY-horizontal" : "negY-horizontal",

    axisU: "x",

    axisV: "z",
  };
}

function getUvSpread(mesh: Mesh) {
  const uv = mesh.geometry.attributes.uv;

  if (!uv) {
    return {
      hasUv: false,

      spreadX: 0,

      spreadY: 0,

      isUsable: false,
    };
  }

  let minU = Number.POSITIVE_INFINITY;

  let maxU = Number.NEGATIVE_INFINITY;

  let minV = Number.POSITIVE_INFINITY;

  let maxV = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < uv.count; index += 1) {
    const u = uv.getX(index);

    const v = uv.getY(index);

    minU = Math.min(minU, u);

    maxU = Math.max(maxU, u);

    minV = Math.min(minV, v);

    maxV = Math.max(maxV, v);
  }

  const spreadX = maxU - minU;

  const spreadY = maxV - minV;

  return {
    hasUv: true,

    spreadX,

    spreadY,

    isUsable: spreadX > 0.05 && spreadY > 0.05,
  };
}

function applyMultiPanelUvToMesh(mesh: Mesh) {
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();

  geometry.computeBoundingBox();

  const position = geometry.attributes.position as BufferAttribute;

  if (!position) {
    mesh.geometry = geometry;

    return {
      applied: false,

      reason: "missing position attribute",
    };
  }

  const triangleCount = Math.floor(position.count / 3);

  type ClusterData = {
    key: string;

    axisU: AxisKey;

    axisV: AxisKey;

    minU: number;

    maxU: number;

    minV: number;

    maxV: number;
  };

  type TriangleInfo = {
    key: string;

    axisU: AxisKey;

    axisV: AxisKey;
  };

  const clusters = new Map<string, ClusterData>();

  const triangleInfos: TriangleInfo[] = [];

  const a = new Vector3();

  const b = new Vector3();

  const c = new Vector3();

  const edge1 = new Vector3();

  const edge2 = new Vector3();

  const normal = new Vector3();

  const expandCluster = (cluster: ClusterData, vertex: Vector3) => {
    const u = getAxisValue(vertex, cluster.axisU);

    const v = getAxisValue(vertex, cluster.axisV);

    cluster.minU = Math.min(cluster.minU, u);

    cluster.maxU = Math.max(cluster.maxU, u);

    cluster.minV = Math.min(cluster.minV, v);

    cluster.maxV = Math.max(cluster.maxV, v);
  };

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
    const baseIndex = triangleIndex * 3;

    a.fromBufferAttribute(position, baseIndex);

    b.fromBufferAttribute(position, baseIndex + 1);

    c.fromBufferAttribute(position, baseIndex + 2);

    edge1.subVectors(b, a);

    edge2.subVectors(c, a);

    normal.crossVectors(edge1, edge2).normalize();

    const projection = getProjectionFromNormal(normal);

    let cluster = clusters.get(projection.key);

    if (!cluster) {
      cluster = {
        key: projection.key,

        axisU: projection.axisU,

        axisV: projection.axisV,

        minU: Number.POSITIVE_INFINITY,

        maxU: Number.NEGATIVE_INFINITY,

        minV: Number.POSITIVE_INFINITY,

        maxV: Number.NEGATIVE_INFINITY,
      };

      clusters.set(projection.key, cluster);
    }

    expandCluster(cluster, a);

    expandCluster(cluster, b);

    expandCluster(cluster, c);

    triangleInfos.push(projection);
  }

  const uvArray = new Float32Array(position.count * 2);

  const vertex = new Vector3();

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
    const triangleInfo = triangleInfos[triangleIndex];

    const cluster = clusters.get(triangleInfo.key);

    if (!cluster) continue;

    const rangeU = Math.max(cluster.maxU - cluster.minU, 0.00001);

    const rangeV = Math.max(cluster.maxV - cluster.minV, 0.00001);

    for (let localIndex = 0; localIndex < 3; localIndex++) {
      const vertexIndex = triangleIndex * 3 + localIndex;

      vertex.fromBufferAttribute(position, vertexIndex);

      let u = (getAxisValue(vertex, cluster.axisU) - cluster.minU) / rangeU;

      let v = (getAxisValue(vertex, cluster.axisV) - cluster.minV) / rangeV;

      if (LED_VIDEO_SWAP_UV_AXES) {
        const temp = u;

        u = v;

        v = temp;
      }

      if (LED_VIDEO_MIRROR_X) {
        u = 1 - u;
      }

      if (LED_VIDEO_MIRROR_Y) {
        v = 1 - v;
      }

      uvArray[vertexIndex * 2] = MathUtils.clamp(u, 0, 1);

      uvArray[vertexIndex * 2 + 1] = MathUtils.clamp(v, 0, 1);
    }
  }

  geometry.setAttribute("uv", new BufferAttribute(uvArray, 2));

  geometry.attributes.uv.needsUpdate = true;

  geometry.computeVertexNormals();

  mesh.geometry = geometry;

  return {
    applied: true,

    reason: `multi-panel UV generated | clusters: ${Array.from(clusters.keys()).join(", ")}`,
  };
}


function applySingleSideBlinn42UvToMesh(mesh: Mesh) {
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();

  geometry.computeBoundingBox();
  mesh.updateMatrixWorld(true);

  const position = geometry.attributes.position as BufferAttribute | undefined;

  if (!position) {
    mesh.geometry = geometry;

    return {
      applied: false,
      reason: "single side Blinn_42 UV skipped - missing position attribute",
    };
  }

  type SingleSideFaceCluster = {
    key: string;
    axisU: AxisKey;
    axisV: AxisKey;
    minU: number;
    maxU: number;
    minV: number;
    maxV: number;
    area: number;
  };

  type SingleSideTriangleInfo = {
    key: string;
  };

  const clusters = new Map<string, SingleSideFaceCluster>();
  const triangleInfos: SingleSideTriangleInfo[] = [];

  const localA = new Vector3();
  const localB = new Vector3();
  const localC = new Vector3();
  const worldA = new Vector3();
  const worldB = new Vector3();
  const worldC = new Vector3();
  const edge1 = new Vector3();
  const edge2 = new Vector3();
  const normal = new Vector3();

  const expandCluster = (cluster: SingleSideFaceCluster, vertex: Vector3) => {
    const u = getAxisValue(vertex, cluster.axisU);
    const v = getAxisValue(vertex, cluster.axisV);

    cluster.minU = Math.min(cluster.minU, u);
    cluster.maxU = Math.max(cluster.maxU, u);
    cluster.minV = Math.min(cluster.minV, v);
    cluster.maxV = Math.max(cluster.maxV, v);
  };

  const triangleCount = Math.floor(position.count / 3);

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
    const baseIndex = triangleIndex * 3;

    localA.fromBufferAttribute(position, baseIndex);
    localB.fromBufferAttribute(position, baseIndex + 1);
    localC.fromBufferAttribute(position, baseIndex + 2);

    worldA.copy(localA).applyMatrix4(mesh.matrixWorld);
    worldB.copy(localB).applyMatrix4(mesh.matrixWorld);
    worldC.copy(localC).applyMatrix4(mesh.matrixWorld);

    edge1.subVectors(worldB, worldA);
    edge2.subVectors(worldC, worldA);

    normal.crossVectors(edge1, edge2);
    const triangleArea = normal.length() * 0.5;
    normal.normalize();

    const projection = getProjectionFromNormal(normal);

    let cluster = clusters.get(projection.key);

    if (!cluster) {
      cluster = {
        key: projection.key,
        axisU: projection.axisU,
        axisV: projection.axisV,
        minU: Number.POSITIVE_INFINITY,
        maxU: Number.NEGATIVE_INFINITY,
        minV: Number.POSITIVE_INFINITY,
        maxV: Number.NEGATIVE_INFINITY,
        area: 0,
      };

      clusters.set(projection.key, cluster);
    }

    cluster.area += triangleArea;

    expandCluster(cluster, worldA);
    expandCluster(cluster, worldB);
    expandCluster(cluster, worldC);

    triangleInfos.push({
      key: projection.key,
    });
  }

  const uvArray = new Float32Array(position.count * 2);
  const vertex = new Vector3();
  const worldVertex = new Vector3();

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
    const triangleInfo = triangleInfos[triangleIndex];
    const cluster = clusters.get(triangleInfo.key);
    const baseIndex = triangleIndex * 3;

    if (!cluster) continue;

    const rangeU = Math.max(cluster.maxU - cluster.minU, 0.00001);
    const rangeV = Math.max(cluster.maxV - cluster.minV, 0.00001);

    for (let localIndex = 0; localIndex < 3; localIndex++) {
      const vertexIndex = baseIndex + localIndex;

      vertex.fromBufferAttribute(position, vertexIndex);
      worldVertex.copy(vertex).applyMatrix4(mesh.matrixWorld);

      let u = (getAxisValue(worldVertex, cluster.axisU) - cluster.minU) / rangeU;
      let v = (getAxisValue(worldVertex, cluster.axisV) - cluster.minV) / rangeV;

      // The visible side of Blinn_42 is rendered from the opposite side in the GLB,
      // so X mirroring is required to make /assets/17x7.jpg read in the correct direction.
      if (SINGLE_SIDE_BLINN_42_MIRROR_X) {
        u = 1 - u;
      }

      if (SINGLE_SIDE_BLINN_42_MIRROR_Y) {
        v = 1 - v;
      }

      uvArray[vertexIndex * 2] = MathUtils.clamp(u, 0, 1);
      uvArray[vertexIndex * 2 + 1] = MathUtils.clamp(v, 0, 1);
    }
  }

  geometry.setAttribute("uv", new BufferAttribute(uvArray, 2));
  geometry.attributes.uv.needsUpdate = true;
  geometry.computeVertexNormals();

  mesh.geometry = geometry;

  const clusterNames = Array.from(clusters.keys()).join(", ");

  return {
    applied: true,
    reason: `single side Blinn_42 UV generated | mirrorX: ${SINGLE_SIDE_BLINN_42_MIRROR_X} | mirrorY: ${SINGLE_SIDE_BLINN_42_MIRROR_Y} | clusters: ${clusterNames}`,
  };
}


function applySingleCabinFrontFaceUvToMesh(mesh: Mesh) {
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();

  geometry.computeBoundingBox();
  mesh.updateMatrixWorld(true);

  const position = geometry.attributes.position as BufferAttribute | undefined;

  if (!position) {
    mesh.geometry = geometry;

    return {
      applied: false,
      reason: "cabin front UV skipped - missing position attribute",
    };
  }

  type CabinFaceCluster = {
    key: string;
    axisU: AxisKey;
    axisV: AxisKey;
    isVertical: boolean;
    minU: number;
    maxU: number;
    minV: number;
    maxV: number;
    area: number;
  };

  type CabinTriangleInfo = {
    key: string;
  };

  const clusters = new Map<string, CabinFaceCluster>();
  const triangleInfos: CabinTriangleInfo[] = [];

  const localA = new Vector3();
  const localB = new Vector3();
  const localC = new Vector3();
  const worldA = new Vector3();
  const worldB = new Vector3();
  const worldC = new Vector3();
  const edge1 = new Vector3();
  const edge2 = new Vector3();
  const normal = new Vector3();

  const expandCluster = (cluster: CabinFaceCluster, vertex: Vector3) => {
    const u = getAxisValue(vertex, cluster.axisU);
    const v = getAxisValue(vertex, cluster.axisV);

    cluster.minU = Math.min(cluster.minU, u);
    cluster.maxU = Math.max(cluster.maxU, u);
    cluster.minV = Math.min(cluster.minV, v);
    cluster.maxV = Math.max(cluster.maxV, v);
  };

  const triangleCount = Math.floor(position.count / 3);

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
    const baseIndex = triangleIndex * 3;

    localA.fromBufferAttribute(position, baseIndex);
    localB.fromBufferAttribute(position, baseIndex + 1);
    localC.fromBufferAttribute(position, baseIndex + 2);

    worldA.copy(localA).applyMatrix4(mesh.matrixWorld);
    worldB.copy(localB).applyMatrix4(mesh.matrixWorld);
    worldC.copy(localC).applyMatrix4(mesh.matrixWorld);

    edge1.subVectors(worldB, worldA);
    edge2.subVectors(worldC, worldA);

    normal.crossVectors(edge1, edge2);
    const triangleArea = normal.length() * 0.5;
    normal.normalize();

    const projection = getProjectionFromNormal(normal);
    const isVertical = projection.axisV === "y";

    let cluster = clusters.get(projection.key);

    if (!cluster) {
      cluster = {
        key: projection.key,
        axisU: projection.axisU,
        axisV: projection.axisV,
        isVertical,
        minU: Number.POSITIVE_INFINITY,
        maxU: Number.NEGATIVE_INFINITY,
        minV: Number.POSITIVE_INFINITY,
        maxV: Number.NEGATIVE_INFINITY,
        area: 0,
      };

      clusters.set(projection.key, cluster);
    }

    cluster.area += triangleArea;

    expandCluster(cluster, worldA);
    expandCluster(cluster, worldB);
    expandCluster(cluster, worldC);

    triangleInfos.push({
      key: projection.key,
    });
  }

  const validClusters = Array.from(clusters.values()).filter((cluster) => {
    const width = cluster.maxU - cluster.minU;
    const height = cluster.maxV - cluster.minV;

    return width > 0.0001 && height > 0.0001;
  });

  const frontFacingVerticalClusters = validClusters.filter((cluster) => {
    return cluster.isVertical && cluster.key.includes("front-panel");
  });

  const verticalClusters = validClusters.filter((cluster) => cluster.isVertical);

  // cabin_front should show only on the actual front face.
  // 1st preference: Z-facing "front-panel" cluster.
  // 2nd preference: any vertical cluster.
  // This prevents the logo from appearing on side walls, roof, or interior surfaces.
  const selectedCluster =
    (frontFacingVerticalClusters.length > 0 ? frontFacingVerticalClusters : verticalClusters).sort(
      (a, b) => b.area - a.area,
    )[0] || null;

  if (!selectedCluster) {
    mesh.geometry = geometry;

    return {
      applied: false,
      reason: "cabin front UV skipped - no usable front face cluster",
    };
  }

  const rangeU = Math.max(selectedCluster.maxU - selectedCluster.minU, 0.00001);
  const rangeV = Math.max(selectedCluster.maxV - selectedCluster.minV, 0.00001);
  const uvArray = new Float32Array(position.count * 2);
  const vertex = new Vector3();
  const worldVertex = new Vector3();

  geometry.clearGroups();

  for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
    const triangleInfo = triangleInfos[triangleIndex];
    const isSelectedFace = triangleInfo.key === selectedCluster.key;
    const materialIndex = isSelectedFace ? 1 : 0;
    const baseIndex = triangleIndex * 3;

    geometry.addGroup(baseIndex, 3, materialIndex);

    for (let localIndex = 0; localIndex < 3; localIndex++) {
      const vertexIndex = baseIndex + localIndex;

      vertex.fromBufferAttribute(position, vertexIndex);
      worldVertex.copy(vertex).applyMatrix4(mesh.matrixWorld);

      let u = 0;
      let v = 0;

      if (isSelectedFace) {
        u = (getAxisValue(worldVertex, selectedCluster.axisU) - selectedCluster.minU) / rangeU;

        v = (getAxisValue(worldVertex, selectedCluster.axisV) - selectedCluster.minV) / rangeV;
      }

      uvArray[vertexIndex * 2] = MathUtils.clamp(u, 0, 1);
      uvArray[vertexIndex * 2 + 1] = MathUtils.clamp(v, 0, 1);
    }
  }

  geometry.setAttribute("uv", new BufferAttribute(uvArray, 2));
  geometry.attributes.uv.needsUpdate = true;
  geometry.computeVertexNormals();

  mesh.geometry = geometry;

  return {
    applied: true,
    reason: `cabin front single-face UV generated | selected: ${selectedCluster.key}`,
  };
}

function useHybridLedBrandingTextures(enabled: boolean, maxAnisotropy: number) {
  const [textures, setTextures] = useState<Record<string, Texture>>({});

  useEffect(() => {
    if (!enabled) {
      setTextures({});

      return;
    }

    let isMounted = true;
    const loadedTextures: Texture[] = [];
    const loader = new TextureLoader();

    const configureTexture = (texture: Texture, textureKey: string) => {
      const isCabinFrontTexture = isCabinBrandingTextureKey(textureKey);

      texture.colorSpace = SRGBColorSpace;
      texture.flipY = false;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.anisotropy = Math.min(16, maxAnisotropy);

      if (isCabinFrontTexture) {
        // Important fix:
        // The source poster has empty white padding, so the full image looked tiny
        // on the cabin mesh. Cropping the center makes the logo visibly larger.
        texture.center.set(
          HYBRID_CABIN_FRONT_TEXTURE_CENTER[0],
          HYBRID_CABIN_FRONT_TEXTURE_CENTER[1],
        );
        texture.repeat.set(
          HYBRID_CABIN_FRONT_TEXTURE_REPEAT[0],
          HYBRID_CABIN_FRONT_TEXTURE_REPEAT[1],
        );
        texture.offset.set(
          HYBRID_CABIN_FRONT_TEXTURE_OFFSET[0],
          HYBRID_CABIN_FRONT_TEXTURE_OFFSET[1],
        );
        texture.rotation = HYBRID_CABIN_FRONT_TEXTURE_ROTATION;

        // Disable mipmaps only for this small cabin poster.
        // Mipmaps make small logo/text look soft from the camera distance.
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;
      } else {
        texture.minFilter = LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = true;
      }

      texture.needsUpdate = true;
    };

    const loadTexture = ([meshName, textureSrc]: [string, string]) =>
      new Promise<[string, Texture] | null>((resolve) => {
        loader.load(
          textureSrc,
          (texture) => {
            configureTexture(texture, meshName);
            loadedTextures.push(texture);
            resolve([meshName, texture]);
          },
          undefined,
          () => resolve(null),
        );
      });

    Promise.all(Object.entries(HYBRID_LED_BRANDING_TEXTURES).map(loadTexture))
      .then((loadedEntries) => {
        if (!isMounted) {
          loadedTextures.forEach((texture) => texture.dispose());

          return;
        }

        const nextTextures = loadedEntries.reduce<Record<string, Texture>>((accumulator, entry) => {
          if (!entry) return accumulator;

          const [meshName, texture] = entry;

          accumulator[meshName] = texture;

          return accumulator;
        }, {});

        setTextures(nextTextures);
      })
      .catch(() => {
        if (isMounted) {
          setTextures({});
        }
      });

    return () => {
      isMounted = false;

      loadedTextures.forEach((texture) => texture.dispose());
    };
  }, [enabled, maxAnisotropy]);

  return textures;
}


function useSingleSideBrandingTextures(enabled: boolean, maxAnisotropy: number) {
  const [textures, setTextures] = useState<Record<string, Texture>>({});

  useEffect(() => {
    if (!enabled) {
      setTextures({});

      return;
    }

    let isMounted = true;
    const loadedTextures: Texture[] = [];
    const loader = new TextureLoader();

    const configureTexture = (texture: Texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.flipY = false;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = Math.min(16, maxAnisotropy);
      texture.needsUpdate = true;
    };

    const loadTexture = ([meshName, textureSrc]: [string, string]) =>
      new Promise<[string, Texture] | null>((resolve) => {
        loader.load(
          textureSrc,
          (texture) => {
            configureTexture(texture);
            loadedTextures.push(texture);
            resolve([meshName, texture]);
          },
          undefined,
          () => resolve(null),
        );
      });

    Promise.all(Object.entries(SINGLE_SIDE_BRANDING_TEXTURES).map(loadTexture))
      .then((loadedEntries) => {
        if (!isMounted) {
          loadedTextures.forEach((texture) => texture.dispose());

          return;
        }

        const nextTextures = loadedEntries.reduce<Record<string, Texture>>((accumulator, entry) => {
          if (!entry) return accumulator;

          const [meshName, texture] = entry;

          accumulator[meshName] = texture;

          return accumulator;
        }, {});

        setTextures(nextTextures);
      })
      .catch(() => {
        if (isMounted) {
          setTextures({});
        }
      });

    return () => {
      isMounted = false;

      loadedTextures.forEach((texture) => texture.dispose());
    };
  }, [enabled, maxAnisotropy]);

  return textures;
}

function useLedVideoTexture(src: string, enabled: boolean) {
  const [state, setState] = useState<{
    texture: VideoTexture | null;

    isReady: boolean;

    status: string;
  }>({
    texture: null,

    isReady: false,

    status: "idle",
  });

  useEffect(() => {
    if (!ENABLE_LED_VIDEO_TEXTURE || !enabled) {
      setState({
        texture: null,

        isReady: false,

        status: !ENABLE_LED_VIDEO_TEXTURE ? "disabled" : "waiting-for-led-mesh",
      });

      return;
    }

    if (typeof document === "undefined") return;

    let isMounted = true;
    let hasMarkedReady = false;
    let hasRequestedPlay = false;

    const video = document.createElement("video");

    video.src = src;

    video.muted = true;

    video.loop = true;

    video.autoplay = true;

    video.playsInline = true;

    video.preload = "auto";

    video.crossOrigin = "anonymous";

    video.setAttribute("muted", "true");

    video.setAttribute("playsinline", "true");

    video.setAttribute("webkit-playsinline", "true");

    const texture = new VideoTexture(video);

    texture.colorSpace = SRGBColorSpace;

    texture.minFilter = LinearFilter;

    texture.magFilter = LinearFilter;

    texture.wrapS = ClampToEdgeWrapping;

    texture.wrapT = ClampToEdgeWrapping;

    texture.generateMipmaps = false;

    texture.flipY = LED_VIDEO_FLIP_Y;

    const playVideo = async () => {
      if (hasRequestedPlay || !isMounted) return;

      hasRequestedPlay = true;

      try {
        await video.play();

        if (isMounted) {
          texture.needsUpdate = true;
        }
      } catch {
        hasRequestedPlay = false;
      }
    };

    const markReady = (status: string) => {
      if (!isMounted || hasMarkedReady) return;

      hasMarkedReady = true;
      texture.needsUpdate = true;

      setState({
        texture,

        isReady: true,

        status,
      });

      playVideo();
    };

    const handleLoadedData = () => {
      markReady("loadeddata");
    };

    const handleCanPlay = () => {
      markReady("canplay");
    };

    const handleCanPlayThrough = () => {
      markReady("canplaythrough");
    };

    const handleError = () => {
      if (isMounted) {
        setState({
          texture: null,

          isReady: false,

          status: "error",
        });
      }
    };

    video.addEventListener("loadeddata", handleLoadedData);

    video.addEventListener("canplay", handleCanPlay);

    video.addEventListener("canplaythrough", handleCanPlayThrough);

    video.addEventListener("error", handleError);

    setState({
      texture: null,

      isReady: false,

      status: "loading",
    });

    video.load();

    return () => {
      isMounted = false;

      video.removeEventListener("loadeddata", handleLoadedData);

      video.removeEventListener("canplay", handleCanPlay);

      video.removeEventListener("canplaythrough", handleCanPlayThrough);

      video.removeEventListener("error", handleError);

      video.pause();

      video.removeAttribute("src");

      video.load();

      texture.dispose();
    };
  }, [src, enabled]);

  return state;
}

type LedUvResult = {
  applied: boolean;
  reason: string;
  hasUv: boolean;
  spreadX: number;
  spreadY: number;
};

type LedTriangleInfo = {
  key: string;
  axisU: AxisKey;
  axisV: AxisKey;
  isVertical: boolean;
};

type LedPanelCluster = {
  key: string;
  axisU: AxisKey;
  axisV: AxisKey;
  isVertical: boolean;
  minU: number;
  maxU: number;
  minV: number;
  maxV: number;
  centerX: number;
  centerZ: number;
  sampleCount: number;
};

type LedMeshUvData = {
  mesh: Mesh;
  position: BufferAttribute;
  triangleInfos: LedTriangleInfo[];
};

function applyContinuousLedWrapUvToMeshes(
  meshes: Mesh[],
  root: Object3D,
  vehicleId?: string,
): Map<Mesh, LedUvResult> {
  const results = new Map<Mesh, LedUvResult>();

  if (meshes.length === 0) {
    return results;
  }

  root.updateMatrixWorld(true);

  const rootBox = new Box3().setFromObject(root);
  const rootCenter = new Vector3();
  const rootMin = rootBox.min.clone();
  const rootMax = rootBox.max.clone();

  rootBox.getCenter(rootCenter);

  const rootRangeX = Math.max(rootMax.x - rootMin.x, 0.00001);
  const rootRangeY = Math.max(rootMax.y - rootMin.y, 0.00001);

  const clusters = new Map<string, LedPanelCluster>();
  const meshData: LedMeshUvData[] = [];

  const localA = new Vector3();
  const localB = new Vector3();
  const localC = new Vector3();
  const worldA = new Vector3();
  const worldB = new Vector3();
  const worldC = new Vector3();
  const edge1 = new Vector3();
  const edge2 = new Vector3();
  const normal = new Vector3();

  const expandCluster = (cluster: LedPanelCluster, vertex: Vector3) => {
    const u = getAxisValue(vertex, cluster.axisU);
    const v = getAxisValue(vertex, cluster.axisV);

    cluster.minU = Math.min(cluster.minU, u);
    cluster.maxU = Math.max(cluster.maxU, u);
    cluster.minV = Math.min(cluster.minV, v);
    cluster.maxV = Math.max(cluster.maxV, v);
    cluster.centerX += vertex.x;
    cluster.centerZ += vertex.z;
    cluster.sampleCount += 1;
  };

  for (const mesh of meshes) {
    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();

    mesh.geometry = geometry;
    mesh.updateMatrixWorld(true);

    const position = geometry.attributes.position as BufferAttribute | undefined;

    if (!position) {
      results.set(mesh, {
        applied: false,
        reason: "continuous L-wrap UV skipped - missing position attribute",
        hasUv: false,
        spreadX: 0,
        spreadY: 0,
      });
      continue;
    }

    const triangleCount = Math.floor(position.count / 3);
    const triangleInfos: LedTriangleInfo[] = [];

    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
      const baseIndex = triangleIndex * 3;

      localA.fromBufferAttribute(position, baseIndex);
      localB.fromBufferAttribute(position, baseIndex + 1);
      localC.fromBufferAttribute(position, baseIndex + 2);

      worldA.copy(localA).applyMatrix4(mesh.matrixWorld);
      worldB.copy(localB).applyMatrix4(mesh.matrixWorld);
      worldC.copy(localC).applyMatrix4(mesh.matrixWorld);

      edge1.subVectors(worldB, worldA);
      edge2.subVectors(worldC, worldA);
      normal.crossVectors(edge1, edge2).normalize();

      const projection = getProjectionFromNormal(normal);
      const isVertical = projection.axisV === "y";

      let cluster = clusters.get(projection.key);

      if (!cluster) {
        cluster = {
          key: projection.key,
          axisU: projection.axisU,
          axisV: projection.axisV,
          isVertical,
          minU: Number.POSITIVE_INFINITY,
          maxU: Number.NEGATIVE_INFINITY,
          minV: Number.POSITIVE_INFINITY,
          maxV: Number.NEGATIVE_INFINITY,
          centerX: 0,
          centerZ: 0,
          sampleCount: 0,
        };

        clusters.set(projection.key, cluster);
      }

      expandCluster(cluster, worldA);
      expandCluster(cluster, worldB);
      expandCluster(cluster, worldC);

      triangleInfos.push({
        key: projection.key,
        axisU: projection.axisU,
        axisV: projection.axisV,
        isVertical,
      });
    }

    meshData.push({
      mesh,
      position,
      triangleInfos,
    });
  }

  const orderedVerticalClusters = Array.from(clusters.values())
    .filter((cluster) => {
      const width = cluster.maxU - cluster.minU;
      const height = cluster.maxV - cluster.minV;

      return cluster.isVertical && width > 0.0001 && height > 0.0001;
    })
    .sort((a, b) => {
      const aCenterX = a.centerX / Math.max(a.sampleCount, 1);
      const aCenterZ = a.centerZ / Math.max(a.sampleCount, 1);
      const bCenterX = b.centerX / Math.max(b.sampleCount, 1);
      const bCenterZ = b.centerZ / Math.max(b.sampleCount, 1);

      const angleA = Math.atan2(aCenterZ - rootCenter.z, aCenterX - rootCenter.x);
      const angleB = Math.atan2(bCenterZ - rootCenter.z, bCenterX - rootCenter.x);

      return angleA - angleB;
    });

  if (vehicleId === "l_type_led" && LED_L_TYPE_REVERSE_PANEL_ORDER) {
    orderedVerticalClusters.reverse();
  }

  if (LED_VIDEO_MIRROR_X) {
    orderedVerticalClusters.reverse();
  }

  if (orderedVerticalClusters.length === 0) {
    for (const mesh of meshes) {
      const fallback = applyMultiPanelUvToMesh(mesh);
      const spread = getUvSpread(mesh);

      results.set(mesh, {
        applied: fallback.applied,
        reason: `${fallback.reason} | fallback because no vertical LED cluster was found`,
        hasUv: spread.hasUv,
        spreadX: spread.spreadX,
        spreadY: spread.spreadY,
      });
    }

    return results;
  }

  const clusterRanges = new Map<string, { start: number; end: number }>();
  const totalPanelWidth = orderedVerticalClusters.reduce((sum, cluster) => {
    return sum + Math.max(cluster.maxU - cluster.minU, 0.00001);
  }, 0);

  let cursor = 0;

  for (const cluster of orderedVerticalClusters) {
    const width = Math.max(cluster.maxU - cluster.minU, 0.00001);

    clusterRanges.set(cluster.key, {
      start: cursor / totalPanelWidth,
      end: (cursor + width) / totalPanelWidth,
    });

    cursor += width;
  }

  const verticalMinY = Math.min(...orderedVerticalClusters.map((cluster) => cluster.minV));
  const verticalMaxY = Math.max(...orderedVerticalClusters.map((cluster) => cluster.maxV));
  const verticalHeight = Math.max(verticalMaxY - verticalMinY, 0.00001);

  const vertex = new Vector3();
  const worldVertex = new Vector3();

  for (const data of meshData) {
    const { mesh, position, triangleInfos } = data;
    const uvArray = new Float32Array(position.count * 2);
    const triangleCount = Math.floor(position.count / 3);

    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
      const triangleInfo = triangleInfos[triangleIndex];
      const cluster = clusters.get(triangleInfo.key);
      const range = clusterRanges.get(triangleInfo.key);

      for (let localIndex = 0; localIndex < 3; localIndex++) {
        const vertexIndex = triangleIndex * 3 + localIndex;

        vertex.fromBufferAttribute(position, vertexIndex);
        worldVertex.copy(vertex).applyMatrix4(mesh.matrixWorld);

        let u = 0;
        let v = 0;

        if (cluster && range && triangleInfo.isVertical) {
          const localRangeU = Math.max(cluster.maxU - cluster.minU, 0.00001);
          const localU = (getAxisValue(worldVertex, cluster.axisU) - cluster.minU) / localRangeU;

          u = range.start + MathUtils.clamp(localU, 0, 1) * (range.end - range.start);
          v = (worldVertex.y - verticalMinY) / verticalHeight;
        } else {
          u = (worldVertex.x - rootMin.x) / rootRangeX;
          v = (worldVertex.y - rootMin.y) / rootRangeY;
        }

        if (LED_VIDEO_SWAP_UV_AXES) {
          const temp = u;
          u = v;
          v = temp;
        }

        if (LED_VIDEO_MIRROR_X) {
          u = 1 - u;
        }

        if (LED_VIDEO_MIRROR_Y) {
          v = 1 - v;
        }

        uvArray[vertexIndex * 2] = MathUtils.clamp(u, 0, 1);
        uvArray[vertexIndex * 2 + 1] = MathUtils.clamp(v, 0, 1);
      }
    }

    mesh.geometry.setAttribute("uv", new BufferAttribute(uvArray, 2));
    mesh.geometry.attributes.uv.needsUpdate = true;
    mesh.geometry.computeVertexNormals();

    const spread = getUvSpread(mesh);

    results.set(mesh, {
      applied: true,
      reason: `continuous one-screen L-wrap UV generated | panels: ${orderedVerticalClusters
        .map((cluster) => cluster.key)
        .join(" + ")} | shared across ${meshes.length} LED mesh(es)`,
      hasUv: spread.hasUv,
      spreadX: spread.spreadX,
      spreadY: spread.spreadY,
    });
  }

  return results;
}

function VehicleModel({ vehicle }: { vehicle: VehicleItem }) {
  const { scene } = useGLTF(vehicle.path);
  const { gl } = useThree();
  const vehicleLogoTexture = useTexture(GLOBAL_LOGO_TEXTURE_SRC);
  const maxTextureAnisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 1;
  const hybridLedBrandingTextures = useHybridLedBrandingTextures(
    vehicle.id === "7x5",
    maxTextureAnisotropy,
  );

  const singleSideBrandingTextures = useSingleSideBrandingTextures(
    vehicle.id === SINGLE_SIDE_BRANDING_VEHICLE_ID,
    maxTextureAnisotropy,
  );

  useEffect(() => {
    const maxAnisotropy = maxTextureAnisotropy;

    vehicleLogoTexture.colorSpace = SRGBColorSpace;
    vehicleLogoTexture.flipY = false;
    vehicleLogoTexture.wrapS = ClampToEdgeWrapping;
    vehicleLogoTexture.wrapT = ClampToEdgeWrapping;
    vehicleLogoTexture.minFilter = LinearMipmapLinearFilter;
    vehicleLogoTexture.magFilter = LinearFilter;
    vehicleLogoTexture.generateMipmaps = true;
    vehicleLogoTexture.anisotropy = Math.min(16, maxAnisotropy);
    vehicleLogoTexture.needsUpdate = true;
  }, [maxTextureAnisotropy, vehicleLogoTexture]);

  const hasMatchingLedMesh = useMemo(() => {
    let found = false;

    scene.traverse((child: Object3D) => {
      if (found || !(child instanceof Mesh)) return;

      const originalMaterials = Array.isArray(child.material) ? child.material : [child.material];

      const objectNameMatch = isLedPanelName(child.name || "");
      const ancestorNameMatch = hasLedPanelAncestor(child);
      const materialNameMatch = originalMaterials.some((material) =>
        isLedPanelName(material?.name || ""),
      );

      found = objectNameMatch || materialNameMatch || ancestorNameMatch;
    });

    return found;
  }, [scene]);

  const shouldLoadLedVideoTexture = hasMatchingLedMesh;

  const { texture: ledVideoTexture, isReady: isVideoReady } = useLedVideoTexture(
    DEMO_VIDEO_SRC,
    shouldLoadLedVideoTexture,
  );

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true) as Group;
    const clonedMaterialMap = new Map<Mesh, any[]>();
    const materialWasArrayMap = new Map<Mesh, boolean>();
    const ledMeshes: Mesh[] = [];

    clone.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) return;

      const objectNameMatch = isLedPanelName(child.name || "");
      const ancestorNameMatch = hasLedPanelAncestor(child);
      const originalMaterials = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMaterials = originalMaterials.map((material) => material.clone());
      const materialNameMatch = clonedMaterials.some((material) =>
        isLedPanelName(material.name || ""),
      );
      const isLedPanel = objectNameMatch || materialNameMatch || ancestorNameMatch;

      clonedMaterialMap.set(child, clonedMaterials);
      materialWasArrayMap.set(child, Array.isArray(child.material));

      child.castShadow = true;
      child.receiveShadow = true;

      if (isLedPanel) {
        ledMeshes.push(child);
      }
    });

    clone.updateMatrixWorld(true);

    const ledUvResults = applyContinuousLedWrapUvToMeshes(ledMeshes, clone, vehicle.id);

    const sharedLedVideoMaterial =
      ENABLE_LED_VIDEO_TEXTURE && ledVideoTexture && isVideoReady
        ? new MeshBasicMaterial({
            name: "demo_campaign_video_material_single_l_shape_screen",
            color: "#ffffff",
            map: ledVideoTexture,
            toneMapped: false,
            side: DoubleSide,
          })
        : null;

    if (sharedLedVideoMaterial) {
      sharedLedVideoMaterial.needsUpdate = true;
    }

    const sharedVehicleLogoMaterial = vehicleLogoTexture
      ? new MeshBasicMaterial({
          name: "adinn_logo_blinn9_image_material",
          color: "#ffffff",
          map: vehicleLogoTexture,
          toneMapped: false,
          side: DoubleSide,
        })
      : null;

    if (sharedVehicleLogoMaterial) {
      sharedVehicleLogoMaterial.needsUpdate = true;
    }

    const hybridLedBrandingMaterials = new Map<string, MeshBasicMaterial>();

    if (vehicle.id === "7x5") {
      Object.entries(hybridLedBrandingTextures).forEach(([meshName, texture]) => {
        const isCabinFrontMaterial = isCabinBrandingTextureKey(meshName);

        const material = new MeshBasicMaterial({
          name: `hybrid_led_${meshName}_image_material`,
          color: "#ffffff",
          map: texture,
          toneMapped: false,
          side: DoubleSide,
          transparent: false,
        });

        if (isCabinFrontMaterial) {
          // Keep cabin poster crisp and always drawn cleanly on the selected face.
          material.depthTest = true;
          material.depthWrite = true;
          material.fog = false;
        }

        material.needsUpdate = true;

        hybridLedBrandingMaterials.set(meshName, material);
      });
    }

    const singleSideBrandingMaterials = new Map<string, MeshBasicMaterial>();

    if (vehicle.id === SINGLE_SIDE_BRANDING_VEHICLE_ID) {
      Object.entries(singleSideBrandingTextures).forEach(([meshName, texture]) => {
        const material = new MeshBasicMaterial({
          name: `single_side_${meshName}_17x7_image_material`,
          color: "#ffffff",
          map: texture,
          toneMapped: false,
          side: DoubleSide,
          transparent: false,
        });

        material.depthTest = true;
        material.depthWrite = true;
        material.fog = false;
        material.needsUpdate = true;

        singleSideBrandingMaterials.set(meshName, material);
      });
    }

    let appliedLogoMeshCount = 0;

    clone.traverse((child: Object3D) => {
      if (!(child instanceof Mesh) || !child.material) return;

      const clonedMaterials = clonedMaterialMap.get(child) || [];
      const materialWasArray = materialWasArrayMap.get(child) ?? Array.isArray(child.material);

      const objectNameMatch = isLedPanelName(child.name || "");
      const ancestorNameMatch = hasLedPanelAncestor(child);
      const materialNameMatch = clonedMaterials.some((material) =>
        isLedPanelName(material.name || ""),
      );

      const isLedPanel = objectNameMatch || materialNameMatch || ancestorNameMatch;
      const uvResult = ledUvResults.get(child);
      const hasUv = uvResult?.hasUv ?? Boolean(child.geometry?.attributes?.uv);

      const singleSideTextureKey =
        vehicle.id === SINGLE_SIDE_BRANDING_VEHICLE_ID
          ? getSingleSideBrandingTextureKeyForMesh(child)
          : null;
      const singleSideBrandingMaterial = singleSideTextureKey
        ? singleSideBrandingMaterials.get(singleSideTextureKey)
        : null;

      const hybridLedTextureKey =
        vehicle.id === "7x5" ? getHybridLedBrandingTextureKeyForMesh(child, clonedMaterials) : null;
      const hybridLedBrandingMaterial = hybridLedTextureKey
        ? hybridLedBrandingMaterials.get(hybridLedTextureKey)
        : null;

      const vehicleLogoObjectNameMatch = isGlobalLogoTargetName(child.name || "");
      const vehicleLogoMaterialNameMatch = clonedMaterials.some((material) =>
        isGlobalLogoTargetName(material.name || ""),
      );
      const isVehicleLogoTarget = vehicleLogoObjectNameMatch || vehicleLogoMaterialNameMatch;

      if (singleSideBrandingMaterial) {
        forceObjectAndParentsVisible(child);

        const uvSpread = getUvSpread(child);

        if (SINGLE_SIDE_BLINN_42_FORCE_GENERATE_UV || !uvSpread.isUsable) {
          const singleSideUvResult = applySingleSideBlinn42UvToMesh(child);

          if (!singleSideUvResult.applied) {
            console.warn("[Single Side Blinn_42 Texture]", singleSideUvResult.reason, child.name);
            applyMultiPanelUvToMesh(child);
          }
        }

        child.material = singleSideBrandingMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
      } else if (hybridLedBrandingMaterial) {
        if (isCabinBrandingTextureKey(hybridLedTextureKey)) {
          forceObjectAndParentsVisible(child);

          const baseMaterial =
            clonedMaterials[0]?.clone?.() ||
            new MeshBasicMaterial({
              name: "hybrid_cabin_front_base_material",
              color: "#ffffff",
              toneMapped: true,
              side: DoubleSide,
            });

          const cabinUvResult = applySingleCabinFrontFaceUvToMesh(child);

          if (!cabinUvResult.applied) {
            console.warn("[Hybrid Cabin Front Texture]", cabinUvResult.reason, child.name);

            applyMultiPanelUvToMesh(child);
            child.material = hybridLedBrandingMaterial;
          } else {
            child.material = [baseMaterial, hybridLedBrandingMaterial];
          }

          child.castShadow = false;
          child.receiveShadow = false;
        } else {
          const uvSpread = getUvSpread(child);

          if (!uvSpread.isUsable) {
            applyMultiPanelUvToMesh(child);
          }

          child.material = hybridLedBrandingMaterial;
          child.castShadow = false;
          child.receiveShadow = false;
        }
      } else if (isVehicleLogoTarget && sharedVehicleLogoMaterial) {
        child.material = sharedVehicleLogoMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
        appliedLogoMeshCount += 1;
      } else if (isLedPanel && sharedLedVideoMaterial && hasUv) {
        child.material = sharedLedVideoMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
      } else {
        if (clonedMaterials.length > 0) {
          child.material = materialWasArray ? clonedMaterials : clonedMaterials[0];
        }

        clonedMaterials.forEach((material) => {
          const tunedMaterial = material as typeof material & {
            color?: { set: (color: string) => void };
            emissive?: { set: (color: string) => void };
            emissiveIntensity?: number;
            envMapIntensity?: number;
            roughness?: number;
            metalness?: number;
            toneMapped?: boolean;
          };

          if (typeof tunedMaterial.envMapIntensity === "number") {
            tunedMaterial.envMapIntensity = 1.46;
          }

          if (typeof tunedMaterial.roughness === "number") {
            tunedMaterial.roughness = Math.min(tunedMaterial.roughness, 0.64);
          }

          if (isLedPanel && ENABLE_LED_RED_FALLBACK) {
            if (tunedMaterial.color) {
              tunedMaterial.color.set("#ff1010");
            }

            if (tunedMaterial.emissive) {
              tunedMaterial.emissive.set("#ff0000");
            }

            if (typeof tunedMaterial.emissiveIntensity === "number") {
              tunedMaterial.emissiveIntensity = 2.4;
            }

            if (typeof tunedMaterial.roughness === "number") {
              tunedMaterial.roughness = 0.22;
            }

            if (typeof tunedMaterial.metalness === "number") {
              tunedMaterial.metalness = 0.04;
            }

            if (typeof tunedMaterial.toneMapped === "boolean") {
              tunedMaterial.toneMapped = false;
            }
          }

          material.needsUpdate = true;
        });
      }
    });

    printAppliedLogoTextureVehicles(vehicle, appliedLogoMeshCount);

    clone.updateMatrixWorld(true);

    const box = new Box3().setFromObject(clone);
    const center = new Vector3();

    box.getCenter(center);

    clone.position.set(-center.x, -center.y, -center.z);
    clone.updateMatrixWorld(true);

    return clone;
  }, [
    scene,
    vehicle,
    ledVideoTexture,
    isVideoReady,
    vehicleLogoTexture,
    hybridLedBrandingTextures,
    singleSideBrandingTextures,
  ]);

  return <primitive object={clonedScene} dispose={null} />;
}

function VehicleHotspots({
  isDemoMode,

  isNightMode,
}: {
  isDemoMode: boolean;

  isNightMode: boolean;
}) {
  const hotspots = [
    {
      label: "LED Display",

      position: [0.95, 0.58, 1.1] as [number, number, number],
    },

    {
      label: "GPS Proof",

      position: [-1.05, 0.45, 0.85] as [number, number, number],
    },

    {
      label: "Audio Support",

      position: [0.2, 0.85, -1.05] as [number, number, number],
    },

    {
      label: "Branding Area",

      position: [1.15, -0.05, -0.25] as [number, number, number],
    },
  ];

  if (!isDemoMode) return null;

  return (
    <>
      {hotspots.map((hotspot, index) => (
        <Html
          key={hotspot.label}
          position={hotspot.position}
          center
          distanceFactor={7.5}
          zIndexRange={[55, 0]}
        >
          <div
            className={`pointer-events-none flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-[11px] font-semibold shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur-2xl transition-all duration-700 ${isNightMode ? "border-white/14 bg-black/62 text-white" : "border-white/90 bg-white/84 text-slate-700"}`}
            style={{
              animation: `hotspotFloat 2.6s ease-in-out ${index * 0.18}s infinite`,
            }}
          >
            <span
              className={`relative h-2.5 w-2.5 rounded-full ${isNightMode ? "bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)]" : "bg-slate-950 shadow-[0_0_18px_rgba(15,23,42,0.22)]"}`}
            />

            {hotspot.label}
          </div>
        </Html>
      ))}
    </>
  );
}

function VehicleTurntable({
  vehicle,

  isDemoMode,

  onUserInteract,
}: {
  vehicle: VehicleItem;

  isDemoMode: boolean;

  onUserInteract: () => void;
}) {
  const pivotRef = useRef<Group>(null);

  const targetRotationRef = useRef(vehicle.rotationY);

  const targetVerticalOffsetRef = useRef(0);

  const dragStateRef = useRef({
    isDragging: false,

    lastX: 0,

    lastY: 0,

    velocity: 0,

    pauseAutoUntil: 0,
  });

  const stopDragging = useCallback(() => {
    dragStateRef.current.isDragging = false;

    dragStateRef.current.pauseAutoUntil = performance.now() + AUTO_ROTATE_PAUSE_AFTER_DRAG_MS;
  }, []);

  useEffect(() => {
    const handleWindowPointerUp = () => {
      stopDragging();
    };

    window.addEventListener("pointerup", handleWindowPointerUp);

    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointerup", handleWindowPointerUp);

      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [stopDragging]);

  useEffect(() => {
    if (!pivotRef.current) return;

    pivotRef.current.rotation.set(0, vehicle.rotationY, 0);

    targetRotationRef.current = vehicle.rotationY;

    targetVerticalOffsetRef.current = 0;

    pivotRef.current.position.y = 0;

    dragStateRef.current.isDragging = false;

    dragStateRef.current.lastX = 0;

    dragStateRef.current.lastY = 0;

    dragStateRef.current.velocity = 0;

    dragStateRef.current.pauseAutoUntil = performance.now() + AUTO_ROTATE_PAUSE_AFTER_DRAG_MS;
  }, [vehicle.id, vehicle.rotationY]);

  useFrame((_, delta) => {
    const pivot = pivotRef.current;

    if (!pivot) return;

    const dragState = dragStateRef.current;

    const now = performance.now();

    if (!dragState.isDragging) {
      targetVerticalOffsetRef.current = MathUtils.damp(
        targetVerticalOffsetRef.current,

        0,

        DRAG_VERTICAL_RETURN_SMOOTHNESS,

        delta,
      );
    }

    pivot.position.y = MathUtils.damp(
      pivot.position.y,

      targetVerticalOffsetRef.current,

      DRAG_VERTICAL_SMOOTHNESS,

      delta,
    );

    if (!dragState.isDragging) {
      if (isDemoMode) {
        const demoAngle = vehicle.rotationY - 0.62;

        targetRotationRef.current = MathUtils.damp(
          targetRotationRef.current,

          demoAngle,

          2.4,

          delta,
        );

        dragState.velocity = 0;
      } else {
        if (Math.abs(dragState.velocity) > 0.0001) {
          targetRotationRef.current += dragState.velocity * delta * 60;

          dragState.velocity *= Math.pow(DRAG_INERTIA_DAMPING, delta * 60);
        } else {
          dragState.velocity = 0;
        }

        const canAutoRotate =
          now > dragState.pauseAutoUntil && Math.abs(dragState.velocity) < 0.002;

        if (canAutoRotate) {
          targetRotationRef.current += AUTO_ROTATE_SPEED * delta;
        }
      }
    }

    pivot.rotation.y = MathUtils.damp(
      pivot.rotation.y,

      targetRotationRef.current,

      ROTATION_SMOOTHNESS,

      delta,
    );
  });

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (isDemoMode) return;

      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.stopPropagation();

      onUserInteract();

      dragStateRef.current.isDragging = true;

      dragStateRef.current.lastX = event.clientX;

      dragStateRef.current.lastY = event.clientY;

      dragStateRef.current.velocity = 0;

      dragStateRef.current.pauseAutoUntil = performance.now() + AUTO_ROTATE_PAUSE_AFTER_DRAG_MS;

      targetRotationRef.current = pivotRef.current?.rotation.y ?? vehicle.rotationY;

      const target = event.target as unknown as {
        setPointerCapture?: (pointerId: number) => void;
      };

      target.setPointerCapture?.(event.pointerId);
    },

    [isDemoMode, onUserInteract, vehicle.rotationY],
  );

  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    const dragState = dragStateRef.current;

    if (!dragState.isDragging) return;

    event.stopPropagation();

    const deltaX = event.clientX - dragState.lastX;

    const deltaY = event.clientY - dragState.lastY;

    targetRotationRef.current += deltaX * DRAG_ROTATE_SENSITIVITY;

    targetVerticalOffsetRef.current = MathUtils.clamp(
      targetVerticalOffsetRef.current - deltaY * DRAG_VERTICAL_MOVE_SENSITIVITY,

      -DRAG_VERTICAL_MAX_DOWN_OFFSET,

      DRAG_VERTICAL_MAX_UP_OFFSET,
    );

    dragState.velocity = deltaX * DRAG_VELOCITY_MULTIPLIER;

    dragState.lastX = event.clientX;

    dragState.lastY = event.clientY;

    dragState.pauseAutoUntil = performance.now() + AUTO_ROTATE_PAUSE_AFTER_DRAG_MS;
  }, []);

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();

      stopDragging();

      const target = event.target as unknown as {
        releasePointerCapture?: (pointerId: number) => void;
      };

      target.releasePointerCapture?.(event.pointerId);
    },

    [stopDragging],
  );

  return (
    <group
      ref={pivotRef}
      scale={vehicle.scale}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <VehicleModel vehicle={vehicle} />
    </group>
  );
}

function CameraDemoControls({
  isDemoMode,
  hasVehicleSwitched,
  vehicleId,
  vehicleSwitchVersion,
}: {
  isDemoMode: boolean;
  hasVehicleSwitched: boolean;
  vehicleId: string;
  vehicleSwitchVersion: number;
}) {
  const controlsRef = useRef<any>(null);

  const { camera } = useThree();

  const afterSwitchCameraConfig = getAfterSwitchCameraConfig(vehicleId);
  const shouldUseVehicleCameraConfig = hasVehicleSwitched || vehicleId === VEHICLES[0].id;

  const switchZoomOutRef = useRef({
    version: vehicleSwitchVersion,
    startedAt: 0,
  });

  useEffect(() => {
    if (vehicleSwitchVersion <= 0) return;

    switchZoomOutRef.current = {
      version: vehicleSwitchVersion,
      startedAt: performance.now(),
    };
  }, [vehicleSwitchVersion]);

  useFrame((_, delta) => {
    const now = performance.now();

    const isSwitchZoomOutPhase =
      !isDemoMode &&
      vehicleSwitchVersion > 0 &&
      switchZoomOutRef.current.version === vehicleSwitchVersion &&
      now - switchZoomOutRef.current.startedAt < CAMERA_SWITCH_ZOOM_OUT_DURATION_MS;

    const finalTargetPosition = shouldUseVehicleCameraConfig
      ? afterSwitchCameraConfig.position
      : CAMERA_DEFAULT_POSITION;

    const finalTargetFov = shouldUseVehicleCameraConfig
      ? afterSwitchCameraConfig.fov
      : CAMERA_DEFAULT_FOV;

    const targetPosition = isDemoMode
      ? CAMERA_DEMO_POSITION
      : isSwitchZoomOutPhase
        ? CAMERA_SWITCH_ZOOM_OUT_POSITION
        : finalTargetPosition;

    const targetLookAt = isDemoMode ? CAMERA_DEMO_TARGET : CAMERA_TARGET;

    const targetFov = isDemoMode
      ? CAMERA_DEMO_FOV
      : isSwitchZoomOutPhase
        ? CAMERA_SWITCH_ZOOM_OUT_FOV
        : finalTargetFov;

    camera.position.x = MathUtils.damp(
      camera.position.x,

      targetPosition[0],

      2.6,

      delta,
    );

    camera.position.y = MathUtils.damp(
      camera.position.y,

      targetPosition[1],

      2.6,

      delta,
    );

    camera.position.z = MathUtils.damp(
      camera.position.z,

      targetPosition[2],

      2.6,

      delta,
    );

    const perspectiveCamera = camera as PerspectiveCamera;

    perspectiveCamera.fov = MathUtils.damp(
      perspectiveCamera.fov,

      targetFov,

      2.8,

      delta,
    );

    perspectiveCamera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.x = MathUtils.damp(
        controlsRef.current.target.x,

        targetLookAt[0],

        2.8,

        delta,
      );

      controlsRef.current.target.y = MathUtils.damp(
        controlsRef.current.target.y,

        targetLookAt[1],

        2.8,

        delta,
      );

      controlsRef.current.target.z = MathUtils.damp(
        controlsRef.current.target.z,

        targetLookAt[2],

        2.8,

        delta,
      );

      controlsRef.current.update();
    }
  });

  const lockedCameraAngle = Math.PI / 2.3;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enableRotate={false}
      enablePan={false}
      enableZoom={false}
      zoomSpeed={0}
      minDistance={shouldUseVehicleCameraConfig ? afterSwitchCameraConfig.minDistance : 5.8}
      maxDistance={shouldUseVehicleCameraConfig ? afterSwitchCameraConfig.maxDistance : 8.8}
      target={CAMERA_TARGET}
      minPolarAngle={lockedCameraAngle}
      maxPolarAngle={lockedCameraAngle}
    />
  );
}

function VehicleCanvas({
  vehicle,

  isDemoMode,

  isNightMode,

  hasVehicleSwitched,

  vehicleSwitchVersion,

  onUserInteract,
}: {
  vehicle: VehicleItem;

  isDemoMode: boolean;

  isNightMode: boolean;

  hasVehicleSwitched: boolean;

  vehicleSwitchVersion: number;

  onUserInteract: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.85]}
      camera={{
        position: CAMERA_DEFAULT_POSITION,

        fov: CAMERA_DEFAULT_FOV,

        near: 0.1,

        far: 100,
      }}
      gl={{
        antialias: true,

        alpha: true,

        powerPreference: "high-performance",
      }}
      onPointerDown={onUserInteract}
      onWheel={onUserInteract}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;

        gl.toneMappingExposure = isNightMode ? 1.04 : 1.12;

        gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      <ambientLight intensity={isNightMode ? 0.42 : 0.9} color="#ffffff" />

      <hemisphereLight
        intensity={isNightMode ? 0.5 : 1.04}
        color="#ffffff"
        groundColor={isNightMode ? "#111827" : "#DCE7F3"}
      />

      <directionalLight
        position={[5.8, 7.4, 5.6]}
        intensity={isNightMode ? 1.8 : 2.52}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0007}
        shadow-normalBias={0.026}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <directionalLight
        position={[-6.4, 3.9, 4.9]}
        intensity={isNightMode ? 0.7 : 1.02}
        color={isNightMode ? "#BFD7FF" : "#F5F7FA"}
      />

      <directionalLight
        position={[5.1, 4.3, -6]}
        intensity={isNightMode ? 1.1 : 1.62}
        color="#ffffff"
      />

      <pointLight position={[-5.2, 1.6, 3]} intensity={isNightMode ? 0.46 : 0.16} color="#5683A0" />

      <pointLight position={[5, 1.5, 2.7]} intensity={isNightMode ? 0.3 : 0.1} color="#8F93C0" />

      <pointLight
        position={[0, 1.95, 5.05]}
        intensity={isNightMode || isDemoMode ? 0.82 : 0.44}
        color="#ffffff"
      />

      {isDemoMode && (
        <>
          <pointLight position={[0.8, 0.85, 2.2]} intensity={1.4} color="#ffffff" />

          <pointLight position={[-1.3, 0.7, 1.8]} intensity={0.72} color="#DCE7F3" />
        </>
      )}

      <Suspense fallback={null}>
        <Environment files="/models/studio.hdr" background={false} />

        {ENABLE_VEHICLE_GLB_LOADING ? (
          <Bounds
            key={vehicle.id}
            fit
            clip
            margin={
              hasVehicleSwitched || vehicle.id === VEHICLES[0].id
                ? getAfterSwitchCameraConfig(vehicle.id).boundsMargin
                : 1.36
            }
          >
            <Center position={[0, vehicle.id === "7x5" ? -0.04 : 0.18, 0]}>
              <VehicleTurntable
                key={vehicle.id}
                vehicle={vehicle}
                isDemoMode={isDemoMode}
                onUserInteract={onUserInteract}
              />

              <VehicleHotspots isDemoMode={isDemoMode} isNightMode={isNightMode} />
            </Center>
          </Bounds>
        ) : (
          <Html center zIndexRange={[60, 0]}>
            <div
              className={`rounded-2xl border px-5 py-3 text-sm font-semibold shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl ${isNightMode ? "border-white/12 bg-black/48 text-white/80" : "border-white/90 bg-white/76 text-slate-600"}`}
            >
              Vehicle preview disabled
            </div>
          </Html>
        )}

        <ContactShadows
          position={[0, -1.02, 0]}
          opacity={isNightMode ? 0.34 : 0.24}
          scale={9.8}
          blur={4.1}
          far={4.8}
          color={isNightMode ? "#020617" : "#64748B"}
        />
      </Suspense>

      <CameraDemoControls
        isDemoMode={isDemoMode}
        hasVehicleSwitched={hasVehicleSwitched}
        vehicleId={vehicle.id}
        vehicleSwitchVersion={vehicleSwitchVersion}
      />
    </Canvas>
  );
}

function RouteProofCards({
  isDemoMode,

  isNightMode,
}: {
  isDemoMode: boolean;

  isNightMode: boolean;
}) {
  const cards = [
    {
      label: "Route Active",

      value: "Anna Salai → T. Nagar",
    },

    {
      label: "GPS Proof",

      value: "Live tracking enabled",
    },

    {
      label: "Photo Updates",

      value: "3 proofs captured",
    },

    {
      label: "Campaign Time",

      value: "8 hours execution",
    },
  ];

  return (
    <div
      className={`pointer-events-none absolute right-4 top-[18%] z-[52] hidden w-[250px] flex-col gap-3 transition-all duration-700 lg:flex ${isDemoMode ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
    >
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={`rounded-2xl border px-4 py-3.5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur-2xl transition-all duration-700 ${isNightMode ? "border-white/12 bg-black/48 text-white" : "border-white/90 bg-white/76 text-slate-950"}`}
          style={{
            transitionDelay: `${index * 90}ms`,
          }}
        >
          <div
            className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${isNightMode ? "text-white/50" : "text-slate-400"}`}
          >
            {card.label}
          </div>

          <div className="mt-1 text-sm font-semibold tracking-[-0.02em]">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

function DemoStatusBar({
  isDemoMode,

  isNightMode,
}: {
  isDemoMode: boolean;

  isNightMode: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-[14%] z-[54] hidden -translate-x-1/2 items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur-2xl transition-all duration-700 md:flex ${isDemoMode ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} ${isNightMode ? "border-white/12 bg-black/44 text-white" : "border-white/90 bg-white/78 text-slate-700"}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      Live Demo Running
      <span className={isNightMode ? "text-white/38" : "text-slate-300"}>|</span>
      demo-campaign.mp4 on LED panel
    </div>
  );
}

// function RotateHintCard({ onDismiss }: { onDismiss: () => void }) {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const showFrame = requestAnimationFrame(() => {
//       setIsVisible(true);
//     });

//     const fadeTimer = window.setTimeout(() => {
//       setIsVisible(false);
//     }, 3600);

//     const dismissTimer = window.setTimeout(() => {
//       onDismiss();
//     }, 4100);

//     return () => {
//       cancelAnimationFrame(showFrame);

//       window.clearTimeout(fadeTimer);

//       window.clearTimeout(dismissTimer);
//     };
//   }, [onDismiss]);

//   return (
//     <button
//       type="button"

//       aria-label="Dismiss rotate hint"

//       onClick={onDismiss}

//       className={`absolute left-1/2 top-0 z-[70] flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/90 bg-white/82 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-[0_16px_48px_rgba(15,23,42,0.095)] outline-none ring-1 ring-slate-950/[0.04] backdrop-blur-2xl transition-all duration-500 ease-out hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#5683A0]/40 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
//     >
//       <span
//         aria-hidden="true"

//         className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
//       >
//         🖱
//       </span>

//       <span>Drag to Rotate 360°</span>
//     </button>
//   );
// }

function RotateHintCard({ onDismiss }: { onDismiss: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showFrame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const fadeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    const dismissTimer = window.setTimeout(() => {
      onDismiss();
    }, 2500);

    return () => {
      cancelAnimationFrame(showFrame);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  return (
    <button
      type="button"
      aria-label="Drag to rotate 360 degrees"
      onClick={onDismiss}
      className={`absolute left-1/2 top-6 z-[80] flex h-[74px] w-[74px] -translate-x-1/2 items-center justify-center rounded-full border border-white/35 bg-[rgba(54,46,49,0.58)] text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] outline-none backdrop-blur-xl transition-all duration-700 ease-out hover:scale-105 hover:bg-[rgba(38,34,37,0.72)] focus-visible:ring-2 focus-visible:ring-white/50 RdswNew_Rotate360Hint ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.32),rgba(255,255,255,0.08)_34%,rgba(0,0,0,0.18)_100%)]" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 74 74"
        aria-hidden="true"
      >
        <circle
          cx="37"
          cy="37"
          r="34"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1"
        />
        <path
          className="RdswNew_Rotate360Arc"
          d="M 22 49 C 28 57, 46 57, 52 49"
          fill="none"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          className="RdswNew_Rotate360Arrow"
          d="M 50 49 L 55 48 L 52 52"
          fill="none"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="relative z-[2] flex flex-col items-center justify-center leading-none">
        <span className="text-[21px] font-medium tracking-[-0.04em] text-white/95">360</span>
      </span>
    </button>
  );
}

// function VehicleSelector({
//   vehicles,

//   activeVehicle,

//   isNightMode,

//   onSelect,
// }: {
//   vehicles: VehicleItem[];

//   activeVehicle: VehicleItem;

//   isNightMode: boolean;

//   onSelect: (vehicle: VehicleItem) => void;
// }) {
//   const selectorRef = useRef<HTMLDivElement>(null);

//   const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

//   const truckMoveTimerRef = useRef<number | null>(null);

//   const [displayVehicle, setDisplayVehicle] = useState(activeVehicle);

//   const [isTruckMoving, setIsTruckMoving] = useState(false);

//   const [activeIndicator, setActiveIndicator] = useState({
//     left: 0,

//     top: 0,

//     width: 0,

//     height: 0,
//   });

//   const getIndicatorForVehicle = useCallback((vehicleId: string) => {
//     const selector = selectorRef.current;

//     const targetButton = buttonRefs.current[vehicleId];

//     if (!selector || !targetButton) return null;

//     const selectorRect = selector.getBoundingClientRect();

//     const targetButtonRect = targetButton.getBoundingClientRect();

//     return {
//       left: targetButtonRect.left - selectorRect.left,

//       top: targetButtonRect.top - selectorRect.top,

//       width: targetButtonRect.width,

//       height: targetButtonRect.height,
//     };
//   }, []);

//   const updateActiveIndicator = useCallback(() => {
//     const nextIndicator = getIndicatorForVehicle(activeVehicle.id);

//     if (!nextIndicator) return;

//     setActiveIndicator(nextIndicator);
//   }, [activeVehicle.id, getIndicatorForVehicle]);

//   const startTruckMove = useCallback(() => {
//     setIsTruckMoving(true);

//     if (truckMoveTimerRef.current) {
//       window.clearTimeout(truckMoveTimerRef.current);
//     }

//     truckMoveTimerRef.current = window.setTimeout(() => {
//       setIsTruckMoving(false);
//     }, 760);
//   }, []);

//   const handleVehicleSelect = useCallback(
//     (vehicle: VehicleItem) => {
//       const nextIndicator = getIndicatorForVehicle(vehicle.id);

//       if (nextIndicator) {
//         setActiveIndicator(nextIndicator);
//       }

//       if (vehicle.id !== activeVehicle.id) {
//         setDisplayVehicle(vehicle);

//         startTruckMove();
//       }

//       onSelect(vehicle);
//     },
//     [activeVehicle.id, getIndicatorForVehicle, onSelect, startTruckMove],
//   );

//   useLayoutEffect(() => {
//     updateActiveIndicator();

//     setDisplayVehicle(activeVehicle);
//   }, [activeVehicle, updateActiveIndicator, vehicles.length]);

//   useEffect(() => {
//     window.addEventListener("resize", updateActiveIndicator);

//     return () => {
//       window.removeEventListener("resize", updateActiveIndicator);

//       if (truckMoveTimerRef.current) {
//         window.clearTimeout(truckMoveTimerRef.current);
//       }
//     };
//   }, [updateActiveIndicator]);

//   return (
//     <div
//       ref={selectorRef}

//       className={`relative z-[60] mt-6 flex max-w-full flex-wrap justify-center gap-1.5 overflow-visible rounded-[999px] border p-1.5 shadow-[0_18px_56px_rgba(15,23,42,0.07)] backdrop-blur-2xl pointer-events-auto RdswNew_VehicleSelector ${ isNightMode ? "border-white/12 bg-white/[0.06] ring-1 ring-white/[0.05]" : "border-white/90 bg-white/68 ring-1 ring-slate-950/[0.04]" }`}

//       role="tablist"

//       aria-label="Select roadshow vehicle type"
//     >
//       <span
//         aria-hidden="true"

//         className="pointer-events-none absolute z-[1] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] rdswVehicleTabVehicle"

//         style={{
//           left: activeIndicator.left - 8,

//           top: activeIndicator.top - 7,

//           width: activeIndicator.width + 16,

//           height: activeIndicator.height + 14,

//           opacity: activeIndicator.width > 0 ? 1 : 0,
//         }}
//       >
//         <svg
//           viewBox="0 0 210 60"
//           preserveAspectRatio="none"
//           className={`rdswVehicleTab absolute inset-0 h-full w-full overflow-visible ${ isTruckMoving ? "animate-[selectorTruckDrive_0.76s_ease-in-out_1]" : "animate-[selectorTruckFloat_2.2s_ease-in-out_infinite]" }`}
//         >
//           <defs>
//             <filter
//               id={`selectorTruckShadow-${displayVehicle.id}`}
//               x="-20%"
//               y="-40%"
//               width="140%"
//               height="210%"
//             >
//               <feDropShadow
//                 dx="0"
//                 dy="7"
//                 stdDeviation="5"
//                 floodColor={
//                   isNightMode ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.24)"
//                 }
//               />
//             </filter>

//             <clipPath id={`selectorRoadClip-${displayVehicle.id}`}>
//               <rect x="16" y="47" width="178" height="7" rx="3.5" />
//             </clipPath>
//           </defs>

//           <rect
//             x="16"
//             y="47"
//             width="178"
//             height="7"
//             rx="3.5"
//             fill={
//               isNightMode ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.12)"
//             }
//           />

//           <g clipPath={`url(#selectorRoadClip-${displayVehicle.id})`}>
//             <g className="animate-[selectorRoadLine_0.9s_linear_infinite]">
//               <line
//                 x1="-60"
//                 y1="50.5"
//                 x2="-26"
//                 y2="50.5"
//                 stroke={
//                   isNightMode
//                     ? "rgba(255,255,255,0.55)"
//                     : "rgba(255,255,255,0.86)"
//                 }
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//               <line
//                 x1="4"
//                 y1="50.5"
//                 x2="38"
//                 y2="50.5"
//                 stroke={
//                   isNightMode
//                     ? "rgba(255,255,255,0.55)"
//                     : "rgba(255,255,255,0.86)"
//                 }
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//               <line
//                 x1="68"
//                 y1="50.5"
//                 x2="102"
//                 y2="50.5"
//                 stroke={
//                   isNightMode
//                     ? "rgba(255,255,255,0.55)"
//                     : "rgba(255,255,255,0.86)"
//                 }
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//               <line
//                 x1="132"
//                 y1="50.5"
//                 x2="166"
//                 y2="50.5"
//                 stroke={
//                   isNightMode
//                     ? "rgba(255,255,255,0.55)"
//                     : "rgba(255,255,255,0.86)"
//                 }
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//             </g>
//           </g>

//           <g filter={`url(#selectorTruckShadow-${displayVehicle.id})`}>
//             <rect
//               x="12"
//               y="9"
//               width="136"
//               height="30"
//               rx="7"
//               fill={isNightMode ? "#ffffff" : "#020617"}
//             />

//             <rect
//               x="24"
//               y="14"
//               width="102"
//               height="20"
//               rx="4"
//               fill={isNightMode ? "#020617" : "#ffffff"}
//             />

//             <text
//               x="75"
//               y="24"
//               textAnchor="middle"
//               dominantBaseline="middle"
//               fill={isNightMode ? "#ffffff" : "#020617"}
//               fontSize="10.8"
//               fontWeight="800"
//               fontFamily="Inter, Outfit, Arial, sans-serif"
//               letterSpacing="-0.45"
//             >
//               {displayVehicle.label}
//             </text>

//             <path
//               d="M148 15H176C184 15 191 24 194 32V39H148Z"
//               fill={isNightMode ? "#ffffff" : "#020617"}
//             />

//             <path
//               d="M160 18H175C180 18 184 23 187 29H160Z"
//               fill={
//                 isNightMode ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.74)"
//               }
//             />

//             <rect
//               x="143"
//               y="21"
//               width="9"
//               height="15"
//               rx="2"
//               transform="skewX(-16)"
//               fill={
//                 isNightMode ? "rgba(255,255,255,0.88)" : "rgba(2,6,23,0.88)"
//               }
//             />

//             <circle
//               cx="42"
//               cy="41"
//               r="5.2"
//               fill={isNightMode ? "#E5E7EB" : "#020617"}
//               stroke={isNightMode ? "#020617" : "#ffffff"}
//               strokeWidth="1.5"
//             />

//             <circle
//               cx="42"
//               cy="41"
//               r="2"
//               fill={isNightMode ? "#020617" : "#E5E7EB"}
//             />

//             <circle
//               cx="171"
//               cy="41"
//               r="5.2"
//               fill={isNightMode ? "#E5E7EB" : "#020617"}
//               stroke={isNightMode ? "#020617" : "#ffffff"}
//               strokeWidth="1.5"
//             />

//             <circle
//               cx="171"
//               cy="41"
//               r="2"
//               fill={isNightMode ? "#020617" : "#E5E7EB"}
//             />

//             <circle cx="196" cy="35" r="2" fill="#FACC15" />
//           </g>
//         </svg>
//       </span>

//       {vehicles.map((vehicle) => {
//         const isActive = activeVehicle.id === vehicle.id;

//         return (
//           <button
//             key={vehicle.id}

//             ref={(node) => {
//               buttonRefs.current[vehicle.id] = node;
//             }}

//             type="button"

//             role="tab"

//             aria-selected={isActive}

//             aria-pressed={isActive}

//             onClick={() => handleVehicleSelect(vehicle)}

//             className={`relative z-[2] rounded-full border border-transparent bg-transparent px-4 py-2.5 text-sm font-semibold tracking-[-0.01em] outline-none transition-colors duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#5683A0]/35 sm:px-5 ${ isActive ? "text-transparent" : isNightMode ? "text-white/58 hover:text-white" : "text-slate-500 hover:text-slate-950" }`}
//           >
//             {vehicle.label}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

function VehicleSelector({
  vehicles,
  activeVehicle,
  isNightMode,
  onSelect,
}: {
  vehicles: VehicleItem[];
  activeVehicle: VehicleItem;
  isNightMode: boolean;
  onSelect: (vehicle: VehicleItem) => void;
}) {
  const selectorRef = useRef<HTMLDivElement>(null);

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const truckMoveTimerRef = useRef<number | null>(null);

  const [displayVehicle, setDisplayVehicle] = useState(activeVehicle);

  const [isTruckMoving, setIsTruckMoving] = useState(false);

  const [activeIndicator, setActiveIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const getIndicatorForVehicle = useCallback((vehicleId: string) => {
    const selector = selectorRef.current;
    const targetButton = buttonRefs.current[vehicleId];

    if (!selector || !targetButton) return null;

    const selectorRect = selector.getBoundingClientRect();
    const targetButtonRect = targetButton.getBoundingClientRect();

    return {
      left: targetButtonRect.left - selectorRect.left,
      top: targetButtonRect.top - selectorRect.top,
      width: targetButtonRect.width,
      height: targetButtonRect.height,
    };
  }, []);

  const updateActiveIndicator = useCallback(() => {
    const nextIndicator = getIndicatorForVehicle(activeVehicle.id);

    if (!nextIndicator) return;

    setActiveIndicator(nextIndicator);
  }, [activeVehicle.id, getIndicatorForVehicle]);

  const startTruckMove = useCallback(() => {
    setIsTruckMoving(true);

    if (truckMoveTimerRef.current) {
      window.clearTimeout(truckMoveTimerRef.current);
    }

    truckMoveTimerRef.current = window.setTimeout(() => {
      setIsTruckMoving(false);
    }, 760);
  }, []);

  const handleVehicleSelect = useCallback(
    (vehicle: VehicleItem) => {
      const nextIndicator = getIndicatorForVehicle(vehicle.id);

      if (nextIndicator) {
        setActiveIndicator(nextIndicator);
      }

      if (vehicle.id !== activeVehicle.id) {
        setDisplayVehicle(vehicle);
        startTruckMove();
      }

      onSelect(vehicle);
    },
    [activeVehicle.id, getIndicatorForVehicle, onSelect, startTruckMove],
  );

  useLayoutEffect(() => {
    updateActiveIndicator();
    setDisplayVehicle(activeVehicle);
  }, [activeVehicle, updateActiveIndicator, vehicles.length]);

  useEffect(() => {
    window.addEventListener("resize", updateActiveIndicator);

    return () => {
      window.removeEventListener("resize", updateActiveIndicator);

      if (truckMoveTimerRef.current) {
        window.clearTimeout(truckMoveTimerRef.current);
      }
    };
  }, [updateActiveIndicator]);

  return (
    <div
      ref={selectorRef}
      className={`relative z-[60] mt-6 flex max-w-full flex-wrap justify-center gap-1.5 overflow-visible rounded-[999px] border p-1.5 shadow-[0_18px_56px_rgba(15,23,42,0.07)] backdrop-blur-2xl pointer-events-auto RdswNew_VehicleSelector ${
        isNightMode
          ? "border-white/12 bg-white/[0.06] ring-1 ring-white/[0.05]"
          : "border-white/90 bg-white/68 ring-1 ring-slate-950/[0.04]"
      }`}
      role="tablist"
      aria-label="Select roadshow vehicle type"
    >
      {/* Desktop / Laptop active SVG vehicle indicator */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-[1] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] rdswVehicleTabVehicle"
        style={{
          left: activeIndicator.left - 8,
          top: activeIndicator.top - 7,
          width: activeIndicator.width + 16,
          height: activeIndicator.height + 14,
          opacity: activeIndicator.width > 0 ? 1 : 0,
        }}
      >
        <svg
          viewBox="0 0 210 60"
          preserveAspectRatio="none"
          className={`rdswVehicleTab absolute inset-0 h-full w-full overflow-visible ${
            isTruckMoving
              ? "animate-[selectorTruckDrive_0.76s_ease-in-out_1]"
              : "animate-[selectorTruckFloat_2.2s_ease-in-out_infinite]"
          }`}
        >
          <defs>
            <filter
              id={`selectorTruckShadow-${displayVehicle.id}`}
              x="-20%"
              y="-40%"
              width="140%"
              height="210%"
            >
              <feDropShadow
                dx="0"
                dy="7"
                stdDeviation="5"
                floodColor={isNightMode ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.24)"}
              />
            </filter>

            <clipPath id={`selectorRoadClip-${displayVehicle.id}`}>
              <rect x="16" y="47" width="178" height="7" rx="3.5" />
            </clipPath>
          </defs>

          <rect
            x="16"
            y="47"
            width="178"
            height="7"
            rx="3.5"
            fill={isNightMode ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.12)"}
          />

          <g clipPath={`url(#selectorRoadClip-${displayVehicle.id})`}>
            <g className="animate-[selectorRoadLine_0.9s_linear_infinite]">
              <line
                x1="-60"
                y1="50.5"
                x2="-26"
                y2="50.5"
                stroke={isNightMode ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.86)"}
                strokeWidth="2"
                strokeLinecap="round"
              />

              <line
                x1="4"
                y1="50.5"
                x2="38"
                y2="50.5"
                stroke={isNightMode ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.86)"}
                strokeWidth="2"
                strokeLinecap="round"
              />

              <line
                x1="68"
                y1="50.5"
                x2="102"
                y2="50.5"
                stroke={isNightMode ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.86)"}
                strokeWidth="2"
                strokeLinecap="round"
              />

              <line
                x1="132"
                y1="50.5"
                x2="166"
                y2="50.5"
                stroke={isNightMode ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.86)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </g>

          <g filter={`url(#selectorTruckShadow-${displayVehicle.id})`}>
            <rect
              x="12"
              y="9"
              width="136"
              height="30"
              rx="7"
              fill={isNightMode ? "#ffffff" : "#020617"}
            />

            <rect
              x="24"
              y="14"
              width="102"
              height="20"
              rx="4"
              fill={isNightMode ? "#020617" : "#ffffff"}
            />

            <text
              x="75"
              y="24"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isNightMode ? "#ffffff" : "#020617"}
              fontSize="10.8"
              fontWeight="800"
              fontFamily="Inter, Outfit, Arial, sans-serif"
              letterSpacing="-0.45"
            >
              {displayVehicle.label}
            </text>

            <path
              d="M148 15H176C184 15 191 24 194 32V39H148Z"
              fill={isNightMode ? "#ffffff" : "#020617"}
            />

            <path
              d="M160 18H175C180 18 184 23 187 29H160Z"
              fill={isNightMode ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.74)"}
            />

            <rect
              x="143"
              y="21"
              width="9"
              height="15"
              rx="2"
              transform="skewX(-16)"
              fill={isNightMode ? "rgba(255,255,255,0.88)" : "rgba(2,6,23,0.88)"}
            />

            <circle
              cx="42"
              cy="41"
              r="5.2"
              fill={isNightMode ? "#E5E7EB" : "#020617"}
              stroke={isNightMode ? "#020617" : "#ffffff"}
              strokeWidth="1.5"
            />

            <circle cx="42" cy="41" r="2" fill={isNightMode ? "#020617" : "#E5E7EB"} />

            <circle
              cx="171"
              cy="41"
              r="5.2"
              fill={isNightMode ? "#E5E7EB" : "#020617"}
              stroke={isNightMode ? "#020617" : "#ffffff"}
              strokeWidth="1.5"
            />

            <circle cx="171" cy="41" r="2" fill={isNightMode ? "#020617" : "#E5E7EB"} />

            <circle cx="196" cy="35" r="2" fill="#FACC15" />
          </g>
        </svg>
      </span>

      {vehicles.map((vehicle) => {
        const isActive = activeVehicle.id === vehicle.id;

        return (
          <button
            key={vehicle.id}
            ref={(node) => {
              buttonRefs.current[vehicle.id] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => handleVehicleSelect(vehicle)}
            className={`relative z-[2] rounded-full border border-transparent bg-transparent px-4 py-2.5 text-sm font-semibold tracking-[-0.01em] outline-none transition-colors duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#5683A0]/35 sm:px-5 RdswNew_VehicleTabButton ${
              vehicle.id === "single_side"
                ? "RdswNew_VehicleTabButtonLong"
                : "RdswNew_VehicleTabButtonNormal"
            } ${
              isActive
                ? "RdswNew_VehicleTabButtonActive text-transparent"
                : isNightMode
                  ? "text-white/58 hover:text-white"
                  : "text-slate-500 hover:text-slate-950"
            }`}
          >
            {vehicle.label}
          </button>
        );
      })}
    </div>
  );
}

function DemoControls({
  isDemoMode,

  isNightMode,

  onToggleDemo,

  onToggleNight,
}: {
  isDemoMode: boolean;

  isNightMode: boolean;

  onToggleDemo: () => void;

  onToggleNight: () => void;
}) {
  if (!SHOW_DEMO_AND_NIGHT_VIEW_BUTTONS) return null;

  return (
    <div className="relative z-[62] mt-4 flex flex-wrap items-center justify-center gap-2.5">
      <button
        type="button"
        onClick={onToggleDemo}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] shadow-[0_18px_44px_rgba(15,23,42,0.09)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 ${isDemoMode ? "border-emerald-400/60 bg-emerald-500 text-white shadow-[0_18px_48px_rgba(16,185,129,0.24)]" : isNightMode ? "border-white/14 bg-white/10 text-white hover:bg-white/16" : "border-slate-950 bg-slate-950 text-white"}`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />

        {isDemoMode ? "Exit Live Demo" : "View Live Demo"}
      </button>

      <button
        type="button"
        onClick={onToggleNight}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 ${isNightMode ? "border-white bg-white text-slate-950" : "border-white/90 bg-white/74 text-slate-600 hover:bg-white hover:text-slate-950"}`}
      >
        {isNightMode ? "Day View" : "Night View"}
      </button>
    </div>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  const ambientRef = useRef<HTMLDivElement>(null);

  const bgRef = useRef<HTMLDivElement>(null);

  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const [activeVehicle, setActiveVehicle] = useState<VehicleItem>(VEHICLES[0]);

  const [hasVehicleSwitched, setHasVehicleSwitched] = useState(false);

  const [vehicleSwitchVersion, setVehicleSwitchVersion] = useState(0);

  const [hasSeenRotateHint, setHasSeenRotateHint] = useState(false);

  const [showRotateHint, setShowRotateHint] = useState(true);

  const [isDemoMode, setIsDemoMode] = useState(false);

  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    if (!SHOW_DEMO_AND_NIGHT_VIEW_BUTTONS) {
      setIsDemoMode(false);
      setIsNightMode(false);
    }
  }, []);

  const dismissRotateHint = useCallback(() => {
    setHasSeenRotateHint(true);

    setShowRotateHint(false);
  }, []);

  const handleVehicleSelect = useCallback(
    (vehicle: VehicleItem) => {
      if (vehicle.id !== activeVehicle.id) {
        setHasVehicleSwitched(true);

        setVehicleSwitchVersion((current) => current + 1);
      }

      setActiveVehicle(vehicle);

      dismissRotateHint();

      setIsDemoMode(false);
    },

    [activeVehicle.id, dismissRotateHint],
  );

  const handleToggleDemo = useCallback(() => {
    dismissRotateHint();

    setIsDemoMode((current) => !current);
  }, [dismissRotateHint]);

  const handleToggleNight = useCallback(() => {
    setIsNightMode((current) => !current);
  }, []);

  // iOS Safari / mobile browser pinch zoom disable only inside Hero section.
  // This stops 2-finger zoom on the 3D vehicle area without affecting the full website.
  useEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    const preventMultiTouchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
    };

    hero.addEventListener("touchstart", preventMultiTouchZoom, {
      passive: false,
    });
    hero.addEventListener("touchmove", preventMultiTouchZoom, {
      passive: false,
    });

    // iOS Safari specific gesture events.
    hero.addEventListener("gesturestart", preventGestureZoom, {
      passive: false,
    });
    hero.addEventListener("gesturechange", preventGestureZoom, {
      passive: false,
    });
    hero.addEventListener("gestureend", preventGestureZoom, {
      passive: false,
    });

    return () => {
      hero.removeEventListener("touchstart", preventMultiTouchZoom);
      hero.removeEventListener("touchmove", preventMultiTouchZoom);

      hero.removeEventListener("gesturestart", preventGestureZoom);
      hero.removeEventListener("gesturechange", preventGestureZoom);
      hero.removeEventListener("gestureend", preventGestureZoom);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;

    const ambient = ambientRef.current;

    const bg = bgRef.current;

    const canvasWrap = canvasWrapRef.current;

    if (!hero || !ambient || !bg || !canvasWrap) return;

    let currentX = 0;

    let currentY = 0;

    let targetX = 0;

    let targetY = 0;

    let frameId = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (isDemoMode) {
        targetX = 0;

        targetY = 0;

        return;
      }

      const rect = hero.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;

      const y = (event.clientY - rect.top) / rect.height - 0.5;

      targetX = x * 12;

      targetY = y * 6;
    };

    const handleMouseLeave = () => {
      targetX = 0;

      targetY = 0;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.075;

      currentY += (targetY - currentY) * 0.1;

      canvasWrap.style.transform = `

        translate3d(${currentX}px, ${currentY}px, 0)

        scale(${isDemoMode ? 1.018 : 1.006})

      `;

      ambient.style.transform = `

        translate3d(calc(-50% + ${currentX * 0.22}px), calc(-50% + ${currentY * 0.16}px), 0)

      `;

      bg.style.transform = `

        translate3d(${-currentX * 0.03}px, ${-currentY * 0.02}px, 0)

        scale(${isDemoMode ? 1.04 : 1.026})

      `;

      frameId = requestAnimationFrame(animate);
    };

    hero.addEventListener("mousemove", handleMouseMove);

    hero.addEventListener("mouseleave", handleMouseLeave);

    frameId = requestAnimationFrame(animate);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);

      hero.removeEventListener("mouseleave", handleMouseLeave);

      cancelAnimationFrame(frameId);
    };
  }, [isDemoMode]);

  const isLightVehicleContrastBackground = activeVehicle.id === "7x5" && !isNightMode;

  return (
    <section
      id="home"
      ref={heroRef}
      className={`HomeBannerSectionID relative isolate min-h-screen w-full overflow-hidden text-slate-950 transition-colors duration-700 ${isNightMode ? "bg-[#05070B]" : "bg-[#FAFBFC]"}`}
      style={{ height: "max-content" }}
    >
      <style>{`

        @keyframes hotspotFloat {

          0%, 100% { transform: translate3d(0, 0, 0); }

          50% { transform: translate3d(0, -6px, 0); }

        }

        @keyframes selectorTruckFloat {

          0%, 100% { transform: translate3d(0, 0, 0); }

          50% { transform: translate3d(0, -1px, 0); }

        }

        @keyframes selectorTruckDrive {

          0% { transform: translate3d(-8px, 1px, 0); }

          50% { transform: translate3d(4px, -1px, 0); }

          100% { transform: translate3d(0, 0, 0); }

        }

        @keyframes selectorRoadLine {

          0% { transform: translate3d(-42px, 0, 0); }

          100% { transform: translate3d(140px, 0, 0); }

        }

        @keyframes selectorWheelSpin {

          0% { transform: rotate(0deg); }

          100% { transform: rotate(360deg); }

        }

      `}</style>

      <div
        ref={bgRef}
        className="pointer-events-none absolute -inset-10 will-change-transform transition-all duration-700"
        style={{
          background: isNightMode
            ? "radial-gradient(circle at 50% 8%, rgba(255,255,255,0.1) 0%, transparent 38%), radial-gradient(circle at 18% 38%, rgba(86,131,160,0.18) 0%, transparent 34%), radial-gradient(circle at 84% 34%, rgba(143,147,192,0.14) 0%, transparent 32%), linear-gradient(180deg, #070A10 0%, #080B12 28%, #0D121C 52%, #121826 74%, #05070B 100%)"
            : isLightVehicleContrastBackground
              ? "radial-gradient(ellipse at 50% 34%, rgba(202,222,241,0.72) 0%, rgba(225,237,249,0.48) 24%, transparent 56%), radial-gradient(ellipse at 50% 52%, rgba(86,131,160,0.18) 0%, rgba(86,131,160,0.11) 36%, transparent 66%), radial-gradient(circle at 16% 36%, rgba(86,131,160,0.13) 0%, transparent 33%), radial-gradient(circle at 84% 34%, rgba(143,147,192,0.11) 0%, transparent 32%), linear-gradient(180deg, #FFFFFF 0%, #F7FBFF 16%, #EEF7FF 34%, #E5F1FC 54%, #D8E8F6 78%, #FFFFFF 100%)"
              : "radial-gradient(circle at 50% 5%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.88) 28%, transparent 52%), radial-gradient(circle at 16% 34%, rgba(86,131,160,0.075) 0%, transparent 32%), radial-gradient(circle at 84% 34%, rgba(143,147,192,0.075) 0%, transparent 32%), linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 20%, #F5F7FA 40%, #EEF3F8 60%, #E7EEF7 76%, #FFFFFF 100%)",
        }}
      />

      <div
        ref={ambientRef}
        className="pointer-events-none absolute left-1/2 top-[66%] h-[520px] w-[1080px] rounded-full blur-3xl will-change-transform transition-all duration-700"
        style={{
          background: isNightMode
            ? "radial-gradient(ellipse at center, rgba(86,131,160,0.18) 0%, rgba(255,255,255,0.08) 30%, rgba(143,147,192,0.09) 48%, transparent 76%)"
            : isLightVehicleContrastBackground
              ? "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(86,131,160,0.16) 32%, rgba(47,81,110,0.1) 52%, transparent 76%)"
              : "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, rgba(86,131,160,0.075) 32%, rgba(143,147,192,0.045) 50%, transparent 76%)",
        }}
      />

      <div
        className={`pointer-events-none absolute inset-0 z-[11] transition-opacity duration-700 ${isLightVehicleContrastBackground ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 43%, rgba(86,131,160,0.18) 0%, rgba(86,131,160,0.12) 28%, rgba(15,23,42,0.055) 46%, transparent 68%), radial-gradient(ellipse at 50% 60%, rgba(86,131,160,0.18) 0%, rgba(86,131,160,0.11) 32%, rgba(15,23,42,0.055) 52%, transparent 74%), radial-gradient(ellipse at 50% 76%, rgba(15,23,42,0.07) 0%, transparent 44%)",
        }}
      />

      <div
        className={`pointer-events-none absolute inset-0 z-[12] transition-opacity duration-700 ${isDemoMode ? (isNightMode ? "opacity-60" : "opacity-34") : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(circle at 50% 48%, transparent 0%, transparent 34%, rgba(0,0,0,0.24) 72%, rgba(0,0,0,0.48) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[13] h-[320px] transition-opacity duration-700"
        style={{
          background: isNightMode
            ? "linear-gradient(180deg, rgba(5,7,11,0.72) 0%, rgba(5,7,11,0.24) 52%, transparent 100%)"
            : isLightVehicleContrastBackground
              ? "linear-gradient(180deg, rgba(255,255,255,0.66) 0%, rgba(232,242,252,0.34) 44%, rgba(198,218,236,0.14) 76%, transparent 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.36) 52%, transparent 100%)",
        }}
      />

      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col items-center px-4 pt-[96px] text-center md:px-8 md:pt-[104px] lg:pt-[104px] xl:pt-[112px] RdswNew_HomeBannerMain">
        <h1
          className={`relative z-40 max-w-4xl bg-clip-text text-[36px] font-semibold leading-[1.03] tracking-[-0.055em] text-transparent transition-all duration-700 md:text-[52px] lg:text-[50px] RdswNew_HeroTitle ${isNightMode ? "bg-gradient-to-b from-white via-slate-200 to-slate-500" : "bg-gradient-to-b from-slate-950 via-slate-800 to-slate-500"}`}
        >
          Take Your Brand Where Your Customers Are
        </h1>

        <p
          className={`relative z-40 mt-4 max-w-2xl text-sm leading-6 transition-colors duration-500 md:text-base RdswNew_HeroSubTitle ${isNightMode ? "text-white/54" : "text-slate-500"}`}
        >
          Built to be seen. Designed to be remembered
        </p>

        <VehicleSelector
          vehicles={VEHICLES}
          activeVehicle={activeVehicle}
          isNightMode={isNightMode}
          onSelect={handleVehicleSelect}
        />

        <DemoControls
          isDemoMode={isDemoMode}
          isNightMode={isNightMode}
          onToggleDemo={handleToggleDemo}
          onToggleNight={handleToggleNight}
        />

        {/* <div
          className="relative z-[65] mt-4 h-11 w-full pointer-events-auto"
        >
          {showRotateHint && !hasSeenRotateHint && !isDemoMode && (
            <RotateHintCard onDismiss={dismissRotateHint} />
          )}
        </div> */}

        {/* <div ref={canvasWrapRef} className="cursor-grab absolute inset-x-0 top-[252px] z-10 mx-auto h-[calc(100vh-272px)] min-h-[330px] max-h-[500px] w-full max-w-[1160px] touch-none overflow-visible will-change-transform transition-transform duration-700 RdswNew_VehicleCanvasWrap md:top-[244px] md:h-[calc(100vh-264px)] lg:top-[236px] lg:h-[calc(100vh-256px)]"  >
          <VehicleCanvas
            vehicle={activeVehicle}

            isDemoMode={isDemoMode}

            isNightMode={isNightMode}

            hasVehicleSwitched={hasVehicleSwitched}

            vehicleSwitchVersion={vehicleSwitchVersion}

            onUserInteract={dismissRotateHint}
          />

          <RouteProofCards
            isDemoMode={isDemoMode}

            isNightMode={isNightMode}
          />

          <DemoStatusBar
            isDemoMode={isDemoMode}

            isNightMode={isNightMode}
          />
        </div> */}

        <div
          ref={canvasWrapRef}
          className="absolute inset-x-0 top-[252px] z-10 mx-auto h-[calc(100svh-272px)] min-h-[330px] max-h-[500px] w-full max-w-[1160px] touch-none overflow-visible will-change-transform transition-transform duration-700 RdswNew_VehicleCanvasWrap md:top-[244px] md:h-[calc(100svh-264px)] lg:top-[236px] lg:h-[calc(100svh-256px)]"
        >
          <VehicleCanvas
            vehicle={activeVehicle}
            isDemoMode={isDemoMode}
            isNightMode={isNightMode}
            hasVehicleSwitched={hasVehicleSwitched}
            vehicleSwitchVersion={vehicleSwitchVersion}
            onUserInteract={dismissRotateHint}
          />

          {showRotateHint && !hasSeenRotateHint && !isDemoMode && (
            <RotateHintCard onDismiss={dismissRotateHint} />
          )}

          <RouteProofCards isDemoMode={isDemoMode} isNightMode={isNightMode} />

          <DemoStatusBar isDemoMode={isDemoMode} isNightMode={isNightMode} />
        </div>
      </div>

      {/* <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[76px] transition-all duration-700 ${ isNightMode ? "bg-gradient-to-t from-[#05070B] via-[#05070B]/62 to-transparent" : isLightVehicleContrastBackground ? "bg-gradient-to-t from-[#F3F8FF]/88 via-[#F3F8FF]/48 to-transparent" : "bg-gradient-to-t from-white/84 via-white/46 to-transparent" }`}
      /> */}
    </section>
  );
}
