import { Truck } from '@/types/truck';
import { MaterialType } from '@/types/order';

const locations = [
  'Madrid Centro',
  'Barcelona Puerto',
  'Valencia Industrial',
  'Madrid Norte',
  'Sevilla Logística',
  'Bilbao Puerto',
];

const drivers = [
  'Carlos García',
  'María López',
  'Juan Martínez',
  'Ana Rodríguez',
  'Pedro Sánchez',
  'Laura Fernández',
  'Miguel Torres',
  'Carmen Ruiz',
];

const truckModels: { brand: string; model: string; maxWeight: number }[] = [
  { brand: 'Mercedes-Benz', model: 'Actros 1845', maxWeight: 8000 },
  { brand: 'Volvo', model: 'FH16', maxWeight: 10000 },
  { brand: 'Scania', model: 'R500', maxWeight: 12000 },
  { brand: 'MAN', model: 'TGX 18.500', maxWeight: 9000 },
  { brand: 'DAF', model: 'XF 480', maxWeight: 7500 },
  { brand: 'Iveco', model: 'S-Way', maxWeight: 6000 },
  { brand: 'Renault', model: 'T High', maxWeight: 8500 },
];

const materialCombinations: MaterialType[][] = [
  ['fragil', 'electronico'],
  ['robusto', 'liquido', 'quimico'],
  ['perecedero'],
  ['robusto', 'fragil', 'electronico'],
  ['quimico', 'liquido'],
  ['robusto', 'electronico', 'fragil', 'liquido'],
  ['perecedero', 'fragil'],
];

const fuelTypes: ('diesel' | 'electric' | 'hybrid')[] = ['diesel', 'electric', 'hybrid'];

export const mockTrucks: Truck[] = Array.from({ length: 10 }, (_, i) => {
  const truckModel = truckModels[i % truckModels.length];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 7) - 2);
  
  return {
    id: `CAM-${String(100 + i).padStart(3, '0')}`,
    plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    brand: truckModel.brand,
    model: truckModel.model,
    maxWeight: truckModel.maxWeight,
    currentLocation: locations[Math.floor(Math.random() * locations.length)],
    availableDate: baseDate,
    allowedMaterials: materialCombinations[i % materialCombinations.length],
    status: i === 7 ? 'maintenance' : 'available',
    driver: drivers[i % drivers.length],
    fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
  };
});
