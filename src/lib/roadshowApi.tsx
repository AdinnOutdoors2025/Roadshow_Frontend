/* eslint-disable */
// @ts-nocheck

export const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export type RoadshowVehicle = {
  id: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  name: string;
  description: string;
  image: string;
  images: string[];
  pricePerDay: number;
  rating: number;
  raw: any;
};

export type SelectedBookingVehicle =
  RoadshowVehicle & {
    startDate: string;
    endDate: string;
    quantity: number;
  };

const getApiData = async (path: string) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || "Unable to load data."
    );
  }

  return result?.data ?? result;
};

const getImageUrl = (image: any): string => {
  if (!image) return "";

  if (typeof image === "string") {
    return image;
  }

  return (
    image?.url ||
    image?.imageUrl ||
    image?.location ||
    image?.path ||
    ""
  );
};

/*
 * Handles API responses such as:
 *
 * data: [...]
 * data: { vehicles: [...] }
 * data: { type1: [...], type2: [...] }
 */
export const flattenVehicles = (
  source: any
): any[] => {
  if (!source) return [];

  if (Array.isArray(source)) {
    return source.flatMap((item) =>
      flattenVehicles(item)
    );
  }

  if (typeof source !== "object") {
    return [];
  }

  const looksLikeVehicle =
    source?._id &&
    (
      source?.vehicleName ||
      source?.modelName ||
      source?.name ||
      source?.vehicleNumber ||
      source?.price ||
      source?.rate ||
      source?.pricePerDay
    );

  if (looksLikeVehicle) {
    return [source];
  }

  if (Array.isArray(source?.vehicles)) {
    return flattenVehicles(source.vehicles);
  }

  if (Array.isArray(source?.items)) {
    return flattenVehicles(source.items);
  }

  return Object.values(source).flatMap((value) =>
    flattenVehicles(value)
  );
};

export const normalizeVehicle = (
  vehicle: any,
  vehicleTypes: any[] = [],
  packages: any[] = []
): RoadshowVehicle => {
  const id = String(
    vehicle?._id ||
    vehicle?.id ||
    vehicle?.vehicleId ||
    ""
  );

  const vehicleTypeValue =
    vehicle?.vehicleType ||
    vehicle?.vehicle_type ||
    vehicle?.type ||
    vehicle?.vehicleTypeId ||
    "";

  const vehicleTypeId =
    typeof vehicleTypeValue === "object"
      ? String(
          vehicleTypeValue?._id ||
          vehicleTypeValue?.id ||
          ""
        )
      : String(vehicleTypeValue || "");

  const matchedVehicleType =
    vehicleTypes.find(
      (type) =>
        String(type?._id || type?.id) ===
        vehicleTypeId
    ) || null;

  const vehicleTypeName =
    typeof vehicleTypeValue === "object"
      ? String(
          vehicleTypeValue?.name ||
          vehicleTypeValue?.vehicleTypeName ||
          ""
        )
      : String(
          matchedVehicleType?.name ||
          matchedVehicleType?.vehicleTypeName ||
          vehicle?.vehicleTypeName ||
          vehicle?.typeName ||
          ""
        );

  const matchedPackage =
    packages.find((packageItem) => {
      const packageVehicleId = String(
        packageItem?.vehicleId?._id ||
        packageItem?.vehicleId ||
        packageItem?.vehicle?._id ||
        packageItem?.vehicle ||
        ""
      );

      return packageVehicleId === id;
    }) || null;

  const rawImages =
    vehicle?.images ||
    vehicle?.vehicleImages ||
    vehicle?.gallery ||
    vehicle?.imageGallery ||
    [];

  const images = Array.isArray(rawImages)
    ? rawImages
        .map(getImageUrl)
        .filter(Boolean)
    : [];

  const primaryImage = getImageUrl(
    vehicle?.image ||
    vehicle?.vehicleImage ||
    vehicle?.mainImage ||
    vehicle?.thumbnail
  );

  if (
    primaryImage &&
    !images.includes(primaryImage)
  ) {
    images.unshift(primaryImage);
  }

  const finalImages =
    images.length > 0
      ? images
      : [
          "/images/assets/HomeBanner_MainPageFinal.png",
        ];

  return {
    id,

    vehicleTypeId,

    vehicleTypeName,

    name: String(
      vehicle?.vehicleName ||
      vehicle?.modelName ||
      vehicle?.name ||
      "Roadshow Vehicle"
    ),

    description: String(
      vehicle?.description ||
      vehicle?.productDescription ||
      vehicle?.vehicleDescription ||
      matchedPackage?.description ||
      matchedPackage?.packageDescription ||
      "Our roadshow vehicle provides high visibility, clear audio and complete branding support for your campaign."
    ),

    image: finalImages[0],

    images: finalImages,

    pricePerDay: Number(
      vehicle?.pricePerDay ||
      vehicle?.dailyRate ||
      vehicle?.rate ||
      vehicle?.price ||
      vehicle?.cost ||
      matchedPackage?.pricePerDay ||
      matchedPackage?.price ||
      0
    ),

    rating: Number(
      vehicle?.rating ||
      vehicle?.reviewRating ||
      4.3
    ),

    raw: vehicle,
  };
};

export const fetchVehicleTypes =
  async (): Promise<any[]> => {
    const data = await getApiData(
      "/api/vehicle-types"
    );

    return Array.isArray(data) ? data : [];
  };

export const fetchVehicleTypeById = async (
  vehicleTypeId: string
) => {
  const types = await fetchVehicleTypes();

  return (
    types.find(
      (type) =>
        String(type?._id || type?.id) ===
        String(vehicleTypeId)
    ) || null
  );
};

export const fetchPackages =
  async (): Promise<any[]> => {
    try {
      const data = await getApiData("/packages");

      return Array.isArray(data)
        ? data
        : Array.isArray(data?.packages)
          ? data.packages
          : [];
    } catch (error) {
      /*
       * Vehicle listing can still work even when
       * the packages API is unavailable.
       */
      console.warn(
        "Unable to load packages:",
        error
      );

      return [];
    }
  };

export const fetchAllVehicles =
  async (): Promise<RoadshowVehicle[]> => {
    const [
      vehicleResponse,
      vehicleTypes,
      packages,
    ] = await Promise.all([
      getApiData("/api/getNewVehicles"),
      fetchVehicleTypes().catch(() => []),
      fetchPackages().catch(() => []),
    ]);

    return flattenVehicles(vehicleResponse)
      .map((vehicle) =>
        normalizeVehicle(
          vehicle,
          vehicleTypes,
          packages
        )
      )
      .filter((vehicle) => vehicle.id);
  };

/*
 * You do not need a separate backend get-by-id API.
 * Fetch all vehicles and find the matching _id.
 */
export const fetchVehicleById = async (
  vehicleId: string
): Promise<RoadshowVehicle> => {
  const vehicles = await fetchAllVehicles();

  const selectedVehicle = vehicles.find(
    (vehicle) =>
      String(vehicle.id) === String(vehicleId)
  );

  if (!selectedVehicle) {
    throw new Error(
      "The selected vehicle could not be found."
    );
  }

  return selectedVehicle;
};