

import API_BASE from "../../../baseurl";


export interface AvailabilityCheckResult {
  available: boolean;
  availableCount: number;
  requiredQuantity: number;
  currentlyAvailable: number;
  soonToBeFree: number;
}

export async function checkVehicleAvailability(params: {
  vehicleType: string;
  quantity: number;
  fromDate: string;
  toDate: string;
}): Promise<AvailabilityCheckResult> {
  const res = await fetch(`${API_BASE}api/checkAvailability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Availability check failed");
  }
  return data.data;
}