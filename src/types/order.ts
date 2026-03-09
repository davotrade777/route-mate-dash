export type MaterialType = 'fragil' | 'quimico' | 'perecedero' | 'robusto' | 'liquido' | 'electronico';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  deliveryDate: Date;
  destination: string;
  destinationCoords?: { lat: number; lng: number };
  weight: number;
  volume: number;
  client: string;
  materials: Material[];
  status: 'pending' | 'scheduled' | 'in-transit' | 'delivered';
}

export interface CompatibilityResult {
  orderId: string;
  score: number;
  destinationMatch: boolean;
  dateProximity: number;
  materialCompatibility: 'compatible' | 'warning' | 'incompatible';
  warnings: string[];
}

export const MATERIAL_COMPATIBILITY: Record<MaterialType, MaterialType[]> = {
  fragil: ['fragil', 'electronico'],
  quimico: ['quimico', 'robusto'],
  perecedero: ['perecedero'],
  robusto: ['robusto', 'quimico', 'liquido'],
  liquido: ['liquido', 'robusto'],
  electronico: ['electronico', 'fragil'],
};

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  fragil: 'Frágil',
  quimico: 'Químico',
  perecedero: 'Perecedero',
  robusto: 'Robusto',
  liquido: 'Líquido',
  electronico: 'Electrónico',
};
