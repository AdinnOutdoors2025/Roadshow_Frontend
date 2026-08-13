/* eslint-disable */
// @ts-nocheck

import { baseUrl } from "@/BaseUrl";

/* =========================================================
   TYPES
========================================================= */

export type RoadshowVehicle = {
  id: string;

  vehicleTypeId: string;
  vehicleTypeName: string;

  name: string;
  description: string;

  image: string;
  images: string[];

  rate: number;
  rating: string;

  totalVehicles: number;
  availableVehicles: number;

  techSpecs: any;
  packageDetails: any;

  registrationVehicles: any[];

  rawVehicle: any;
};

/* =========================================================
   API BASE

   IMPORTANT:
   Use ONLY src/BaseUrl.tsx for this file.

   Do not automatically use localhost/frontend URL.
========================================================= */

const API_BASE = String(baseUrl || "")
  .trim()
  .replace(/\/+$/, "");

export const FALLBACK_VEHICLE_IMAGE =
  "/images/Truck_Image.jpg";

/* =========================================================
   HELPERS
========================================================= */

const getObjectId = (
  value: any,
): string => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return String(
      value?._id ||
        value?.id ||
        "",
    );
  }

  return String(value);
};

const normalizeModelName = (
  value: any,
): string =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "",
    );

/* =========================================================
   IMAGE URL
========================================================= */

const resolveVehicleImage = (
  value: any,
): string => {
  const image = String(
    value || "",
  ).trim();

  if (!image) {
    return "";
  }

  /*
   * Already absolute.
   */
  if (
    image.startsWith(
      "http://",
    ) ||
    image.startsWith(
      "https://",
    ) ||
    image.startsWith(
      "data:",
    ) ||
    image.startsWith(
      "blob:",
    )
  ) {
    return image;
  }

  /*
   * Local public image.
   */
  if (
    image.startsWith(
      "/images/",
    )
  ) {
    return image;
  }

  /*
   * Backend relative image.
   */
  if (
    image.startsWith("/")
  ) {
    return `${API_BASE}${image}`;
  }

  return `${API_BASE}/${image}`;
};

const getVehicleImages = (
  mediaFiles: any,
): string[] => {
  const images = [
    mediaFiles?.frontViewImage,
    mediaFiles?.leftSideImage,
    mediaFiles?.rightSideImage,
    mediaFiles?.rearViewImage,
    mediaFiles?.interiorImage,
  ]
    .map(
      resolveVehicleImage,
    )
    .filter(Boolean);

  return images.length
    ? Array.from(
        new Set(images),
      )
    : [
        FALLBACK_VEHICLE_IMAGE,
      ];
};

/* =========================================================
   AVAILABILITY
========================================================= */

const isRegistrationAvailable = (
  registration: any,
): boolean => {
  if (
    registration
      ?.activeStatus === false
  ) {
    return false;
  }

  const status = String(
    registration
      ?.statusAvailability
      ?.currentStatus ||
      "",
  )
    .trim()
    .toLowerCase();

  return (
    status === "available"
  );
};

/* =========================================================
   SAFE API RESPONSE

   We read text FIRST.

   If backend accidentally gives HTML, we can detect it
   properly rather than letting response.json() crash.
========================================================= */

const readResponse = async (
  response: Response,
  fallbackMessage: string,
) => {
  let text = "";

  try {
    text =
      await response.text();
  } catch {
    throw new Error(
      fallbackMessage,
    );
  }

  if (!text.trim()) {
    throw new Error(
      fallbackMessage,
    );
  }

  let result: any;

  try {
    result =
      JSON.parse(text);
  } catch {
    /*
     * Do NOT use console.error here.
     *
     * Next.js development mode displays console.error
     * as a red error overlay.
     */
    console.warn(
      `[Roadshow API] Expected JSON but received another response.`,
      {
        url:
          response.url,

        status:
          response.status,

        contentType:
          response.headers.get(
            "content-type",
          ),
      },
    );

    throw new Error(
      fallbackMessage,
    );
  }

  if (
    !response.ok ||
    result?.success === false
  ) {
    throw new Error(
      result?.message ||
        fallbackMessage,
    );
  }

  return result;
};

/* =========================================================
   API FETCH
========================================================= */

const fetchApi = async (
  path: string,
  fallbackMessage: string,
) => {
  const url =
    `${API_BASE}${path}`;

  let response: Response;

  try {
    response =
      await fetch(url, {
        method: "GET",

        cache:
          "no-store",

        headers: {
          Accept:
            "application/json",
        },
      });
  } catch (error) {
    console.warn(
      `[Roadshow API] Request failed: ${url}`,
      error,
    );

    throw new Error(
      fallbackMessage,
    );
  }

  return readResponse(
    response,
    fallbackMessage,
  );
};

/* =========================================================
   RESULT ARRAY

   Supports:

   { data: [...] }

   { data: { vehicles: [...] } }

   { vehicles: [...] }

   [...]
========================================================= */

const extractArray = (
  result: any,
  keys: string[] = [],
): any[] => {
  if (
    Array.isArray(result)
  ) {
    return result;
  }

  if (
    Array.isArray(
      result?.data,
    )
  ) {
    return result.data;
  }

  for (
    const key of keys
  ) {
    if (
      Array.isArray(
        result?.data?.[
          key
        ],
      )
    ) {
      return result
        .data[key];
    }
  }

  for (
    const key of keys
  ) {
    if (
      Array.isArray(
        result?.[key],
      )
    ) {
      return result[key];
    }
  }

  return [];
};

/* =========================================================
   BUILD VEHICLES
========================================================= */

export const buildRoadshowVehicles =
  (
    vehicleGroups: any[],
    vehicleTypes: any[],
    packages: any[],
  ): RoadshowVehicle[] => {
    if (
      !Array.isArray(
        vehicleGroups,
      )
    ) {
      return [];
    }

    return vehicleGroups
      .map((group) => {
        /* -----------------------------------------------
           ID
        ----------------------------------------------- */

        const id =
          String(
            group?._id ||
              group?.id ||
              "",
          );

        /* -----------------------------------------------
           TYPE
        ----------------------------------------------- */

        const vehicleTypeId =
          getObjectId(
            group
              ?.basicInfo
              ?.vehicleType,
          );

        const name =
          String(
            group
              ?.basicInfo
              ?.vehicleName ||
              "Roadshow Vehicle",
          ).trim();

        const matchedVehicleType =
          vehicleTypes.find(
            (type) =>
              getObjectId(
                type,
              ) ===
              vehicleTypeId,
          ) || null;

        /* -----------------------------------------------
           PACKAGE
        ----------------------------------------------- */

        const matchedPackage =
          packages.find(
            (pkg) =>
              pkg?.isActive !==
                false &&
              getObjectId(
                pkg
                  ?.vehicleType,
              ) ===
                vehicleTypeId &&
              normalizeModelName(
                pkg
                  ?.vehicleModel,
              ) ===
                normalizeModelName(
                  name,
                ),
          ) || null;

        /* -----------------------------------------------
           IMAGES
        ----------------------------------------------- */

        const images =
          getVehicleImages(
            group
              ?.mediaFiles ||
              {},
          );

        /* -----------------------------------------------
           REGISTRATION VEHICLES
        ----------------------------------------------- */

        const registrationVehicles =
          Array.isArray(
            group
              ?.registrationVehicles,
          )
            ? group
                .registrationVehicles
            : [];

        const availableVehicles =
          registrationVehicles.filter(
            isRegistrationAvailable,
          ).length;

        /* -----------------------------------------------
           RESULT
        ----------------------------------------------- */

        return {
          id,

          vehicleTypeId,

          vehicleTypeName:
            String(
              matchedVehicleType
                ?.typeName ||
                group
                  ?.basicInfo
                  ?.vehicleType
                  ?.typeName ||
                "",
            ),

          name,

          description:
            String(
              group
                ?.vehicleDescription ||
                "Our roadshow vehicle provides high visibility, professional audio support and complete branding options.",
            ),

          image:
            images[0],

          images,

          rate:
            Number(
              matchedPackage
                ?.perDayRentalCost ||
                0,
            ),

          rating:
            "4.3",

          totalVehicles:
            Number(
              group
                ?.totalVehicles ||
                registrationVehicles.length ||
                0,
            ),

          availableVehicles,

          techSpecs:
            group
              ?.techSpecs ||
            {},

          packageDetails:
            matchedPackage,

          registrationVehicles,

          rawVehicle:
            group,
        };
      })
      .filter(
        (vehicle) =>
          vehicle.id,
      );
  };

/* =========================================================
   FETCH VEHICLES

   Vehicles are REQUIRED.

   Vehicle types and packages are supporting requests.
   If either supporting API fails, the vehicle listing
   will still be allowed to render.
========================================================= */

export const fetchAllRoadshowVehicles =
  async (): Promise<
    RoadshowVehicle[]
  > => {
    /* -----------------------------------------------
       VEHICLES
       REQUIRED
    ----------------------------------------------- */

    const vehicleResult =
      await fetchApi(
        "/api/getNewVehicles",

        "Failed to load vehicles.",
      );

    /* -----------------------------------------------
       TYPES + PACKAGES
       OPTIONAL
    ----------------------------------------------- */

    const [
      vehicleTypeResult,
      packageResult,
    ] =
      await Promise.all([
        fetchApi(
          "/api/vehicle-types",

          "Failed to load vehicle types.",
        ).catch(
          (error) => {
            console.warn(
              "[Roadshow] Vehicle types unavailable.",
              error,
            );

            return {
              data: [],
            };
          },
        ),

        fetchApi(
          "/packages",

          "Failed to load packages.",
        ).catch(
          (error) => {
            console.warn(
              "[Roadshow] Packages unavailable.",
              error,
            );

            return {
              data: [],
            };
          },
        ),
      ]);

    /* -----------------------------------------------
       NORMALIZE DATA
    ----------------------------------------------- */

    const vehicleGroups =
      extractArray(
        vehicleResult,
        [
          "vehicles",
          "vehicleDetails",
          "allVehicles",
          "results",
          "items",
        ],
      );

    const vehicleTypes =
      extractArray(
        vehicleTypeResult,
        [
          "vehicleTypes",
          "types",
          "results",
          "items",
        ],
      );

    const packageList =
      extractArray(
        packageResult,
        [
          "packages",
          "results",
          "items",
        ],
      );

    /* -----------------------------------------------
       DEVELOPMENT INFO

       console.log is intentional.
       It does not create a Next red overlay.
    ----------------------------------------------- */

    if (
      process.env
        .NODE_ENV ===
      "development"
    ) {
      console.log(
        "[Roadshow API]",
        {
          api:
            API_BASE,

          vehicles:
            vehicleGroups.length,

          vehicleTypes:
            vehicleTypes.length,

          packages:
            packageList.length,
        },
      );
    }

    return buildRoadshowVehicles(
      vehicleGroups,
      vehicleTypes,
      packageList,
    );
  };

/* =========================================================
   FETCH VEHICLE BY ID
========================================================= */

export const fetchRoadshowVehicleById =
  async (
    vehicleId: string,
  ): Promise<RoadshowVehicle> => {
    const vehicles =
      await fetchAllRoadshowVehicles();

    const selectedVehicle =
      vehicles.find(
        (vehicle) =>
          String(
            vehicle.id,
          ) ===
          String(
            vehicleId,
          ),
      );

    if (
      !selectedVehicle
    ) {
      throw new Error(
        "Selected vehicle was not found.",
      );
    }

    return selectedVehicle;
  };