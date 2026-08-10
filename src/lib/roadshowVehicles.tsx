// /* eslint-disable */
// // @ts-nocheck

// import { baseUrl } from "@/BaseUrl";

// export type RoadshowVehicle = {
//   id: string;
//   vehicleTypeId: string;
//   vehicleTypeName: string;

//   name: string;
//   description: string;

//   image: string;
//   images: string[];

//   rate: number;
//   rating: string;

//   totalVehicles: number;
//   availableVehicles: number;

//   techSpecs: any;
//   packageDetails: any;
//   registrationVehicles: any[];
//   rawVehicle: any;
// };

// export const FALLBACK_VEHICLE_IMAGE =
//   "/images/Truck_Image.jpg";

// /* -------------------------------------------------------------------------- */
// /*                              COMMON HELPERS                                */
// /* -------------------------------------------------------------------------- */

// const getObjectId = (value: any): string => {
//   if (!value) return "";

//   if (typeof value === "object") {
//     return String(
//       value?._id ||
//         value?.id ||
//         ""
//     );
//   }

//   return String(value);
// };

// const normalizeModelName = (
//   value: any
// ): string => {
//   return String(value || "")
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "");
// };

// const resolveVehicleImage = (
//   value: any
// ): string => {
//   const image = String(value || "").trim();

//   if (!image) return "";

//   if (
//     image.startsWith("http://") ||
//     image.startsWith("https://") ||
//     image.startsWith("data:") ||
//     image.startsWith("blob:")
//   ) {
//     return image;
//   }

//   // Image from the Next.js public folder
//   if (image.startsWith("/images/")) {
//     return image;
//   }

//   // Relative image returned from backend
//   if (image.startsWith("/")) {
//     return `${baseUrl}${image}`;
//   }

//   return `${baseUrl}/${image}`;
// };

// const getVehicleImages = (
//   mediaFiles: any
// ): string[] => {
//   const images = [
//     mediaFiles?.frontViewImage,
//     mediaFiles?.leftSideImage,
//     mediaFiles?.rightSideImage,
//     mediaFiles?.rearViewImage,
//     mediaFiles?.interiorImage,
//   ]
//     .map(resolveVehicleImage)
//     .filter(Boolean);

//   return images.length > 0
//     ? Array.from(new Set(images))
//     : [FALLBACK_VEHICLE_IMAGE];
// };

// const isRegistrationAvailable = (
//   registration: any
// ): boolean => {
//   if (registration?.activeStatus === false) {
//     return false;
//   }

//   const status = String(
//     registration?.statusAvailability
//       ?.currentStatus || ""
//   )
//     .trim()
//     .toLowerCase();

//   return status === "available";
// };

// const readResponse = async (
//   response: Response,
//   fallbackMessage: string
// ) => {
//   let result: any;

//   try {
//     result = await response.json();
//   } catch (error) {
//     throw new Error(fallbackMessage);
//   }

//   if (
//     !response.ok ||
//     result?.success === false
//   ) {
//     throw new Error(
//       result?.message ||
//         fallbackMessage
//     );
//   }

//   return result;
// };

// /*
//  * Supports all common API response formats:
//  *
//  * [...]
//  *
//  * { data: [...] }
//  *
//  * { packages: [...] }
//  *
//  * { data: { packages: [...] } }
//  */
// const extractArray = (
//   result: any,
//   possibleKeys: string[] = []
// ): any[] => {
//   if (Array.isArray(result)) {
//     return result;
//   }

//   if (Array.isArray(result?.data)) {
//     return result.data;
//   }

//   for (const key of possibleKeys) {
//     if (
//       Array.isArray(
//         result?.data?.[key]
//       )
//     ) {
//       return result.data[key];
//     }
//   }

//   for (const key of possibleKeys) {
//     if (
//       Array.isArray(
//         result?.[key]
//       )
//     ) {
//       return result[key];
//     }
//   }

//   return [];
// };

// /* -------------------------------------------------------------------------- */
// /*                         BUILD FRONTEND VEHICLES                            */
// /* -------------------------------------------------------------------------- */

// export const buildRoadshowVehicles = (
//   vehicleGroups: any[],
//   vehicleTypes: any[],
//   packages: any[]
// ): RoadshowVehicle[] => {
//   if (!Array.isArray(vehicleGroups)) {
//     return [];
//   }

//   return vehicleGroups
//     .map((group) => {
//       const id = String(
//         group?._id ||
//           group?.id ||
//           ""
//       );

//       /*
//        * Vehicle schema:
//        * basicInfo.vehicleType
//        */
//       const vehicleTypeId =
//         getObjectId(
//           group?.basicInfo
//             ?.vehicleType
//         );

//       /*
//        * Vehicle schema:
//        * basicInfo.vehicleName
//        */
//       const name = String(
//         group?.basicInfo
//           ?.vehicleName ||
//           "Roadshow Vehicle"
//       ).trim();

//       /*
//        * Match vehicle type:
//        *
//        * vehicle.basicInfo.vehicleType
//        * vehicleType._id
//        */
//       const matchedVehicleType =
//         vehicleTypes.find(
//           (type) =>
//             getObjectId(type) ===
//             vehicleTypeId
//         ) || null;

//       /*
//        * Get active packages belonging
//        * to this vehicle type.
//        */
//       const activePackagesForType =
//         packages.filter(
//           (pkg) =>
//             pkg?.isActive !==
//               false &&
//             getObjectId(
//               pkg?.vehicleType
//             ) === vehicleTypeId
//         );

//       /*
//        * Exact package match:
//        *
//        * package.vehicleType
//        * package.vehicleModel
//        *
//        * against:
//        *
//        * vehicle.basicInfo.vehicleType
//        * vehicle.basicInfo.vehicleName
//        */
//       const exactPackage =
//         activePackagesForType.find(
//           (pkg) =>
//             normalizeModelName(
//               pkg?.vehicleModel
//             ) ===
//             normalizeModelName(name)
//         ) || null;

//       /*
//        * Use the exact model package.
//        *
//        * When only one active package
//        * exists for the vehicle type,
//        * use that package as fallback.
//        */
//       const matchedPackage =
//         exactPackage ||
//         (activePackagesForType.length ===
//         1
//           ? activePackagesForType[0]
//           : null);

//       /*
//        * Helpful development warning.
//        * This does not affect the UI.
//        */
//       if (!matchedPackage) {
//         console.warn(
//           "Package not matched:",
//           {
//             vehicleId: id,
//             vehicleName: name,
//             vehicleTypeId,
//             availablePackages:
//               activePackagesForType.map(
//                 (pkg) => ({
//                   id: pkg?._id,
//                   vehicleType:
//                     getObjectId(
//                       pkg?.vehicleType
//                     ),
//                   vehicleModel:
//                     pkg?.vehicleModel,
//                   perDayRentalCost:
//                     pkg?.perDayRentalCost,
//                 })
//               ),
//           }
//         );
//       }

//       const images =
//         getVehicleImages(
//           group?.mediaFiles || {}
//         );

//       const registrationVehicles =
//         Array.isArray(
//           group?.registrationVehicles
//         )
//           ? group.registrationVehicles
//           : [];

//       const availableVehicles =
//         registrationVehicles.filter(
//           isRegistrationAvailable
//         ).length;

//       return {
//         id,

//         vehicleTypeId,

//         vehicleTypeName: String(
//           matchedVehicleType
//             ?.typeName ||
//             group?.basicInfo
//               ?.vehicleType
//               ?.typeName ||
//             ""
//         ),

//         name,

//         description: String(
//           group?.vehicleDescription ||
//             "Our roadshow vehicle provides high visibility, professional audio support and complete branding options."
//         ),

//         image: images[0],

//         images,

//         /*
//          * Package schema:
//          * perDayRentalCost
//          */
//         rate: Number(
//           matchedPackage
//             ?.perDayRentalCost ??
//             0
//         ),

//         rating: "4.3",

//         totalVehicles: Number(
//           group?.totalVehicles ||
//             registrationVehicles.length ||
//             0
//         ),

//         availableVehicles,

//         techSpecs:
//           group?.techSpecs || {},

//         packageDetails:
//           matchedPackage,

//         registrationVehicles,

//         rawVehicle: group,
//       };
//     })
//     .filter(
//       (vehicle) => vehicle.id
//     );
// };

// /* -------------------------------------------------------------------------- */
// /*                              FETCH VEHICLES                                */
// /* -------------------------------------------------------------------------- */

// export const fetchAllRoadshowVehicles =
//   async (): Promise<
//     RoadshowVehicle[]
//   > => {
//     const [
//       vehicleResponse,
//       vehicleTypeResponse,
//       packageResponse,
//     ] = await Promise.all([
//       fetch(
//         `${baseUrl}/api/getNewVehicles`,
//         {
//           cache: "no-store",
//         }
//       ),

//       fetch(
//         `${baseUrl}/api/vehicle-types`,
//         {
//           cache: "no-store",
//         }
//       ),

//       fetch(
//         `${baseUrl}/packages`,
//         {
//           cache: "no-store",
//         }
//       ),
//     ]);

//     const [
//       vehicleResult,
//       vehicleTypeResult,
//       packageResult,
//     ] = await Promise.all([
//       readResponse(
//         vehicleResponse,
//         "Failed to load vehicles."
//       ),

//       readResponse(
//         vehicleTypeResponse,
//         "Failed to load vehicle types."
//       ),

//       readResponse(
//         packageResponse,
//         "Failed to load packages."
//       ),
//     ]);

//     /*
//      * Handle every common API
//      * response format.
//      */
//     const vehicleGroups =
//       extractArray(
//         vehicleResult,
//         [
//           "vehicles",
//           "vehicleDetails",
//           "items",
//         ]
//       );

//     const vehicleTypes =
//       extractArray(
//         vehicleTypeResult,
//         [
//           "vehicleTypes",
//           "types",
//           "items",
//         ]
//       );

//     const packages =
//       extractArray(
//         packageResult,
//         [
//           "packages",
//           "items",
//         ]
//       );

//     console.log(
//       "Vehicle groups:",
//       vehicleGroups
//     );

//     console.log(
//       "Vehicle types:",
//       vehicleTypes
//     );

//     console.log(
//       "Packages:",
//       packages
//     );

//     const frontendVehicles =
//       buildRoadshowVehicles(
//         vehicleGroups,
//         vehicleTypes,
//         packages
//       );

//     console.log(
//       "Mapped frontend vehicles:",
//       frontendVehicles.map(
//         (vehicle) => ({
//           id: vehicle.id,
//           name: vehicle.name,
//           vehicleTypeId:
//             vehicle.vehicleTypeId,
//           packageId:
//             vehicle.packageDetails
//               ?._id,
//           rate: vehicle.rate,
//         })
//       )
//     );

//     return frontendVehicles;
//   };

// /* -------------------------------------------------------------------------- */
// /*                           FETCH VEHICLE BY ID                              */
// /* -------------------------------------------------------------------------- */

// export const fetchRoadshowVehicleById =
//   async (
//     vehicleId: string
//   ): Promise<RoadshowVehicle> => {
//     const vehicles =
//       await fetchAllRoadshowVehicles();

//     const selectedVehicle =
//       vehicles.find(
//         (vehicle) =>
//           String(vehicle.id) ===
//           String(vehicleId)
//       );

//     if (!selectedVehicle) {
//       throw new Error(
//         "Selected vehicle was not found."
//       );
//     }

//     return selectedVehicle;
//   };
















/* eslint-disable */
// @ts-nocheck

import { baseUrl } from "@/BaseUrl";

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

export const FALLBACK_VEHICLE_IMAGE =
  "/images/Truck_Image.jpg";

/* -------------------------------------------------------------------------- */
/*                              COMMON HELPERS                                */
/* -------------------------------------------------------------------------- */

const getObjectId = (value: any): string => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(
      value?._id ||
        value?.id ||
        ""
    );
  }

  return String(value);
};

const normalizeModelName = (
  value: any
): string => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
};

const resolveVehicleImage = (
  value: any
): string => {
  const image = String(value || "").trim();

  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  // Image from the Next.js public folder
  if (image.startsWith("/images/")) {
    return image;
  }

  // Relative image returned from backend
  if (image.startsWith("/")) {
    return `${baseUrl}${image}`;
  }

  return `${baseUrl}/${image}`;
};

const getVehicleImages = (
  mediaFiles: any
): string[] => {
  const images = [
    mediaFiles?.frontViewImage,
    mediaFiles?.leftSideImage,
    mediaFiles?.rightSideImage,
    mediaFiles?.rearViewImage,
    mediaFiles?.interiorImage,
  ]
    .map(resolveVehicleImage)
    .filter(Boolean);

  return images.length > 0
    ? Array.from(new Set(images))
    : [FALLBACK_VEHICLE_IMAGE];
};

const isRegistrationAvailable = (
  registration: any
): boolean => {
  if (registration?.activeStatus === false) {
    return false;
  }

  const status = String(
    registration?.statusAvailability
      ?.currentStatus || ""
  )
    .trim()
    .toLowerCase();

  return status === "available";
};

const readResponse = async (
  response: Response,
  fallbackMessage: string
) => {
  let result: any;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error(fallbackMessage);
  }

  if (
    !response.ok ||
    result?.success === false
  ) {
    throw new Error(
      result?.message ||
        fallbackMessage
    );
  }

  return result;
};

/*
 * Supports all common API response formats:
 *
 * [...]
 *
 * { data: [...] }
 *
 * { packages: [...] }
 *
 * { data: { packages: [...] } }
 */
const extractArray = (
  result: any,
  possibleKeys: string[] = []
): any[] => {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  for (const key of possibleKeys) {
    if (
      Array.isArray(
        result?.data?.[key]
      )
    ) {
      return result.data[key];
    }
  }

  for (const key of possibleKeys) {
    if (
      Array.isArray(
        result?.[key]
      )
    ) {
      return result[key];
    }
  }

  return [];
};

/* -------------------------------------------------------------------------- */
/*                         BUILD FRONTEND VEHICLES                            */
/* -------------------------------------------------------------------------- */

export const buildRoadshowVehicles = (
  vehicleGroups: any[],
  vehicleTypes: any[],
  packages: any[]
): RoadshowVehicle[] => {
  if (!Array.isArray(vehicleGroups)) {
    return [];
  }

  return vehicleGroups
    .map((group) => {
      const id = String(group?._id || group?.id || "");

      /*
       * Primary relationship:
       * vehicle.basicInfo.vehicleType -> VehicleType._id
       */
      const vehicleTypeId = getObjectId(
        group?.basicInfo?.vehicleType
      );

      const matchedVehicleType =
        vehicleTypes.find(
          (type) =>
            getObjectId(type) === vehicleTypeId
        ) ||
        group?.vehicleTypeDetails ||
        (typeof group?.basicInfo?.vehicleType === "object"
          ? group.basicInfo.vehicleType
          : null);

      /*
       * Keep the old stored vehicleName only for package-model
       * compatibility. It is NOT used as the user-facing name.
       */
      const storedVehicleName = String(
        group?.basicInfo?.vehicleName || ""
      ).trim();

      /*
       * User-facing vehicle name always comes from the current
       * VehicleType record matched by ID.
       */
      const resolvedVehicleTypeName = String(
        matchedVehicleType?.typeName ||
          group?.basicInfo?.vehicleTypeName ||
          storedVehicleName ||
          "Roadshow Vehicle"
      ).trim();

      const activePackagesForType = packages.filter(
        (pkg) =>
          pkg?.isActive !== false &&
          getObjectId(pkg?.vehicleType) ===
            vehicleTypeId
      );

      /*
       * Preserve existing package behavior:
       * - primary package relationship is vehicleType ID
       * - vehicleModel is retained only to choose a variant when
       *   multiple packages exist for the same type
       * - both the cached old name and latest type name are accepted,
       *   so renaming VehicleType does not remove the existing rate
       */
      const exactPackage =
        activePackagesForType.find((pkg) => {
          const packageModel = normalizeModelName(
            pkg?.vehicleModel
          );

          return (
            packageModel ===
              normalizeModelName(storedVehicleName) ||
            packageModel ===
              normalizeModelName(
                resolvedVehicleTypeName
              )
          );
        }) || null;

      const matchedPackage =
        exactPackage ||
        (activePackagesForType.length === 1
          ? activePackagesForType[0]
          : null);

      if (!matchedPackage) {
        console.warn("Package not matched:", {
          vehicleId: id,
          vehicleTypeId,
          displayName: resolvedVehicleTypeName,
          cachedVehicleName: storedVehicleName,
          availablePackages:
            activePackagesForType.map((pkg) => ({
              id: pkg?._id,
              vehicleType: getObjectId(
                pkg?.vehicleType
              ),
              vehicleModel: pkg?.vehicleModel,
              perDayRentalCost:
                pkg?.perDayRentalCost,
            })),
        });
      }

      const images = getVehicleImages(
        group?.mediaFiles || {}
      );

      const registrationVehicles = Array.isArray(
        group?.registrationVehicles
      )
        ? group.registrationVehicles
        : [];

      const availableVehicles =
        registrationVehicles.filter(
          isRegistrationAvailable
        ).length;

      return {
        id,
        vehicleTypeId,

        vehicleTypeName:
          resolvedVehicleTypeName,

        // Existing Home and Vehicle Details pages already use
        // vehicle.name, so no UI component change is required.
        name: resolvedVehicleTypeName,

        description: String(
          group?.vehicleDescription ||
            "Our roadshow vehicle provides high visibility, professional audio support and complete branding options."
        ),

        image: images[0],
        images,

        rate: Number(
          matchedPackage?.perDayRentalCost ?? 0
        ),

        rating: "4.3",

        totalVehicles: Number(
          group?.totalVehicles ||
            registrationVehicles.length ||
            0
        ),

        availableVehicles,
        techSpecs: group?.techSpecs || {},
        packageDetails: matchedPackage,
        registrationVehicles,
        rawVehicle: group,
      };
    })
    .filter((vehicle) => vehicle.id);
};

/* -------------------------------------------------------------------------- */
/*                              FETCH VEHICLES                                */
/* -------------------------------------------------------------------------- */

export const fetchAllRoadshowVehicles =
  async (): Promise<
    RoadshowVehicle[]
  > => {
    const [
      vehicleResponse,
      vehicleTypeResponse,
      packageResponse,
    ] = await Promise.all([
      fetch(
        `${baseUrl}/api/getNewVehicles`,
        {
          cache: "no-store",
        }
      ),

      fetch(
        `${baseUrl}/api/vehicle-types`,
        {
          cache: "no-store",
        }
      ),

      fetch(
        `${baseUrl}/packages`,
        {
          cache: "no-store",
        }
      ),
    ]);

    const [
      vehicleResult,
      vehicleTypeResult,
      packageResult,
    ] = await Promise.all([
      readResponse(
        vehicleResponse,
        "Failed to load vehicles."
      ),

      readResponse(
        vehicleTypeResponse,
        "Failed to load vehicle types."
      ),

      readResponse(
        packageResponse,
        "Failed to load packages."
      ),
    ]);

    /*
     * Handle every common API
     * response format.
     */
    const vehicleGroups =
      extractArray(
        vehicleResult,
        [
          "vehicles",
          "vehicleDetails",
          "items",
        ]
      );

    const vehicleTypes =
      extractArray(
        vehicleTypeResult,
        [
          "vehicleTypes",
          "types",
          "items",
        ]
      );

    const packages =
      extractArray(
        packageResult,
        [
          "packages",
          "items",
        ]
      );

    console.log(
      "Vehicle groups:",
      vehicleGroups
    );

    console.log(
      "Vehicle types:",
      vehicleTypes
    );

    console.log(
      "Packages:",
      packages
    );

    const frontendVehicles =
      buildRoadshowVehicles(
        vehicleGroups,
        vehicleTypes,
        packages
      );

    console.log(
      "Mapped frontend vehicles:",
      frontendVehicles.map(
        (vehicle) => ({
          id: vehicle.id,
          name: vehicle.name,
          vehicleTypeId:
            vehicle.vehicleTypeId,
          packageId:
            vehicle.packageDetails
              ?._id,
          rate: vehicle.rate,
        })
      )
    );

    return frontendVehicles;
  };

/* -------------------------------------------------------------------------- */
/*                           FETCH VEHICLE BY ID                              */
/* -------------------------------------------------------------------------- */

export const fetchRoadshowVehicleById =
  async (
    vehicleId: string
  ): Promise<RoadshowVehicle> => {
    const vehicles =
      await fetchAllRoadshowVehicles();

    const selectedVehicle =
      vehicles.find(
        (vehicle) =>
          String(vehicle.id) ===
          String(vehicleId)
      );

    if (!selectedVehicle) {
      throw new Error(
        "Selected vehicle was not found."
      );
    }

    return selectedVehicle;
  };
