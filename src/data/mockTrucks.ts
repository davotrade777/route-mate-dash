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

const driverPhones = [
  '+34 612 345 678',
  '+34 623 456 789',
  '+34 634 567 890',
  '+34 645 678 901',
  '+34 656 789 012',
  '+34 667 890 123',
  '+34 678 901 234',
  '+34 689 012 345',
];

const truckModels: { brand: string; model: string; maxWeight: number; dimensions: string }[] = [
  { brand: 'Mercedes-Benz', model: 'Actros 1845', maxWeight: 8000, dimensions: '2.6m x 1.5m x 12.5m' },
  { brand: 'Volvo', model: 'FH16', maxWeight: 10000, dimensions: '2.5m x 1.6m x 13.6m' },
  { brand: 'Scania', model: 'R500', maxWeight: 12000, dimensions: '2.6m x 1.7m x 13.6m' },
  { brand: 'MAN', model: 'TGX 18.500', maxWeight: 9000, dimensions: '2.5m x 1.5m x 12.0m' },
  { brand: 'DAF', model: 'XF 480', maxWeight: 7500, dimensions: '2.4m x 1.4m x 11.5m' },
  { brand: 'Iveco', model: 'S-Way', maxWeight: 6000, dimensions: '2.3m x 1.3m x 10.0m' },
  { brand: 'Renault', model: 'T High', maxWeight: 8500, dimensions: '2.5m x 1.5m x 12.8m' },
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
    dimensions: truckModel.dimensions,
    currentLocation: locations[Math.floor(Math.random() * locations.length)],
    availableDate: baseDate,
    allowedMaterials: materialCombinations[i % materialCombinations.length],
    status: i === 7 ? 'maintenance' : 'available',
    driver: drivers[i % drivers.length],
    driverPhone: driverPhones[i % driverPhones.length],
    fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
  };
});
