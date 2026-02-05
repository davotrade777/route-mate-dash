import { Order, Material } from '@/types/order';

const generateMaterials = (): Material[] => {
  const materials: Material[][] = [
    [
      { id: 'm1', name: 'Cristalería', type: 'fragil', quantity: 50, unit: 'cajas' },
      { id: 'm2', name: 'Vajilla porcelana', type: 'fragil', quantity: 30, unit: 'cajas' },
    ],
    [
      { id: 'm3', name: 'Solventes industriales', type: 'quimico', quantity: 200, unit: 'litros' },
    ],
    [
      { id: 'm4', name: 'Frutas frescas', type: 'perecedero', quantity: 500, unit: 'kg' },
      { id: 'm5', name: 'Vegetales', type: 'perecedero', quantity: 300, unit: 'kg' },
    ],
    [
      { id: 'm6', name: 'Maquinaria pesada', type: 'robusto', quantity: 2, unit: 'unidades' },
      { id: 'm7', name: 'Estructuras metálicas', type: 'robusto', quantity: 15, unit: 'piezas' },
    ],
    [
      { id: 'm8', name: 'Aceite industrial', type: 'liquido', quantity: 1000, unit: 'litros' },
    ],
    [
      { id: 'm9', name: 'Servidores', type: 'electronico', quantity: 10, unit: 'unidades' },
      { id: 'm10', name: 'Pantallas LED', type: 'electronico', quantity: 25, unit: 'unidades' },
    ],
    [
      { id: 'm11', name: 'Cemento', type: 'robusto', quantity: 100, unit: 'sacos' },
    ],
    [
      { id: 'm12', name: 'Lácteos', type: 'perecedero', quantity: 200, unit: 'kg' },
    ],
  ];
  return materials[Math.floor(Math.random() * materials.length)];
};

const destinations = [
  'Madrid Centro',
  'Barcelona Puerto',
  'Valencia Industrial',
  'Madrid Norte',
  'Barcelona Zona Franca',
  'Sevilla Logística',
  'Bilbao Puerto',
  'Madrid Sur',
];

const clients = [
  'Industrias Martínez S.L.',
  'Grupo Alimenticio del Norte',
  'TechLogic Solutions',
  'Construcciones Hernández',
  'Distribuidora Valencia',
  'Química Industrial BCN',
  'Electrónica Avanzada',
  'Agrícola del Sur',
];

export const mockOrders: Order[] = Array.from({ length: 15 }, (_, i) => {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 14));
  
  return {
    id: `PED-${String(1001 + i).padStart(4, '0')}`,
    deliveryDate: baseDate,
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    weight: Math.floor(Math.random() * 5000) + 500,
    client: clients[Math.floor(Math.random() * clients.length)],
    materials: generateMaterials(),
    status: 'pending',
  };
});
