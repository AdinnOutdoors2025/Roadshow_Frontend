// context/VehicleContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API_BASE from "../../baseurl";

interface VehicleType {
  _id: string;
  name: string;
}

interface VehicleContextType {
  vehicleTypes: VehicleType[];
  fetchVehicleTypes: () => Promise<void>;
  loading: boolean;
  setVehicleTypes: React.Dispatch<React.SetStateAction<VehicleType[]>>;
}


const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider = ({ children }: { children: ReactNode }) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
 

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}api/vehicle-types`);
      if (!res.ok) throw new Error("Failed to fetch vehicle types");
      const data = await res.json();
      setVehicleTypes(data.data);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  return (
    <VehicleContext.Provider value={{ 
      vehicleTypes, 
      fetchVehicleTypes, 
      loading, 
      setVehicleTypes 
    }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within VehicleProvider');
  }
  return context;
};