
import API_BASE from "../../baseurl";

const ADMIN = `${API_BASE}admin/`;



export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface PackageItem {
  _id: string;
  vehicleType: string;
  vehicleModel: string;
  perDayRentalCost: number;
  dailyKmLimit: number;
  additionalHourCharges: number;
  promoterAvailable: boolean;
  promoterChargePerDay: number;
  driverCharges: number;
  rtoCharges: number;
}

export interface PricingPreview {
  totalDays: number;
  perDayRentalCost: number;
  driverCharges: number;
  promoterChargePerDay: number;
  rtoCharges: number;
  additionalHourCharges: number;
  dailyKmLimit: number;
  rentalCost: number;
  driverCost: number;
  promoterCost: number;
  rtoCost: number;
  extraKmCost: number;      
  additionalNet: number;    
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

export interface AdditionalChargePayload {
  label: string;
  mode: "+" | "-";
  amount: number;
}

export interface VehiclePayload {
  packageId: string;
  bookingFor: string;
  campaignType: string;
  otherCampaignType?: string;
  fromDate: string;
  toDate: string;
  state: string;
  city: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  extraKm?: number;         
  extraDays?: number;       
  needPromoter: boolean;
  promoterType?: string;
  otherPromoterType?: string;
  campaignImages?: string[];
  campaignVideos?: string[];
  additionalCharges?: AdditionalChargePayload[];  
}



export async function createCustomer(data: {
  name: string;
  phone: string;
  address: string;
  email?: string;
}): Promise<{ customer: Customer }> {
  const res = await fetch(`${ADMIN}customers/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create customer");
  return json;
}

export async function searchCustomers(q: string): Promise<{ customers: Customer[] }> {
  const res = await fetch(`${ADMIN}customers/search?q=${encodeURIComponent(q)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Search failed");
  return json;
}

export async function getCustomerOrders(customerId: string) {
  const res = await fetch(`${ADMIN}customers/${customerId}/orders`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
}



export async function getPackagesForOrder(filters?: {
  vehicleType?: string;
  vehicleModel?: string;
}): Promise<{ packages: PackageItem[] }> {
  const params = new URLSearchParams();
  if (filters?.vehicleType)  params.set("vehicleType",  filters.vehicleType);
  if (filters?.vehicleModel) params.set("vehicleModel", filters.vehicleModel);
  const res = await fetch(`${ADMIN}packages?${params.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch packages");
  return json;
}


export const getPackages = getPackagesForOrder;



export async function previewPricing(data: {
  packageId: string;
  fromDate: string;
  toDate: string;
  quantity: number;
  needPromoter: boolean;
  extraKm?: number;
  extraDays?: number;
  additionalFields?: AdditionalChargePayload[];
}): Promise<{ pricing: PricingPreview }> {
  const res = await fetch(`${ADMIN}orders/preview-pricing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Pricing preview failed");
  return json;
}

// ── Order APIs ─────────────────────────────────────────────────────────────────

export async function createAdminOrder(data: {
  customerId: string;
  vehicles: VehiclePayload[];
}): Promise<{ orderId: string; order: any }> {
  const res = await fetch(`${ADMIN}orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Order creation failed");
  return json;
}
