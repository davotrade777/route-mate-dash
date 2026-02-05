import { MaterialType } from './order';

export interface Truck {
  id: string;
  plate: string;
  model: string;
  brand: string;
  maxWeight: number; // kg
  currentLocation: string;
  availableDate: Date;
  allowedMaterials: MaterialType[];
  status: 'available' | 'in-use' | 'maintenance';
  driver: string;
  fuelType: 'diesel' | 'electric' | 'hybrid';
}

export interface TruckCompatibilityResult {
  truckId: string;
  overallScore: number; // 0-100
  weightCompatible: boolean;
  weightPercentage: number; // percentage of capacity used
  materialCompatible: boolean;
  materialWarnings: string[];
  locationMatch: boolean;
  dateAvailable: boolean;
  warnings: string[];
  isRecommended: boolean;
}
