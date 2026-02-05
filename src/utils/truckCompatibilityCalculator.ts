import { Truck, TruckCompatibilityResult } from '@/types/truck';
import { Order, MaterialType, MATERIAL_LABELS } from '@/types/order';

export function calculateTruckCompatibility(
  truck: Truck,
  orders: Order[],
  targetDate: Date
): TruckCompatibilityResult {
  const warnings: string[] = [];
  const materialWarnings: string[] = [];
  
  // Calculate total weight
  const totalWeight = orders.reduce((sum, order) => sum + order.weight, 0);
  const weightPercentage = (totalWeight / truck.maxWeight) * 100;
  const weightCompatible = totalWeight <= truck.maxWeight;
  
  if (!weightCompatible) {
    const excess = totalWeight - truck.maxWeight;
    warnings.push(`Excede capacidad en ${excess.toLocaleString()} kg`);
  } else if (weightPercentage > 90) {
    warnings.push(`Carga al ${Math.round(weightPercentage)}% de capacidad`);
  }
  
  // Check material compatibility
  const requiredMaterials = new Set<MaterialType>();
  orders.forEach(order => {
    order.materials.forEach(m => requiredMaterials.add(m.type));
  });
  
  const unsupportedMaterials: MaterialType[] = [];
  requiredMaterials.forEach(material => {
    if (!truck.allowedMaterials.includes(material)) {
      unsupportedMaterials.push(material);
    }
  });
  
  const materialCompatible = unsupportedMaterials.length === 0;
  
  if (!materialCompatible) {
    unsupportedMaterials.forEach(m => {
      materialWarnings.push(`No transporta ${MATERIAL_LABELS[m]}`);
    });
    warnings.push(...materialWarnings);
  }
  
  // Check location match
  const destinations = new Set(orders.map(o => o.destination.split(' ')[0]));
  const truckCity = truck.currentLocation.split(' ')[0];
  const locationMatch = destinations.has(truckCity) || destinations.size === 1;
  
  if (!locationMatch) {
    warnings.push(`Camión en ${truck.currentLocation}, destinos distintos`);
  }
  
  // Check date availability
  const truckDate = new Date(truck.availableDate);
  truckDate.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const dateAvailable = truckDate <= target;
  
  if (!dateAvailable) {
    const daysUntil = Math.ceil((truckDate.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    warnings.push(`Disponible en ${daysUntil} día${daysUntil > 1 ? 's' : ''}`);
  }
  
  // Check maintenance status
  if (truck.status === 'maintenance') {
    warnings.push('En mantenimiento');
  }
  
  // Calculate overall score
  let score = 100;
  
  if (!weightCompatible) score -= 40;
  else if (weightPercentage > 90) score -= 10;
  else if (weightPercentage > 80) score -= 5;
  
  if (!materialCompatible) score -= 30;
  if (!locationMatch) score -= 15;
  if (!dateAvailable) score -= 20;
  if (truck.status === 'maintenance') score -= 50;
  
  // Bonus for optimal capacity usage (60-80%)
  if (weightCompatible && weightPercentage >= 60 && weightPercentage <= 80) {
    score += 5;
  }
  
  score = Math.max(0, Math.min(100, score));
  
  const isRecommended = score >= 70 && weightCompatible && materialCompatible && truck.status !== 'maintenance';
  
  return {
    truckId: truck.id,
    overallScore: score,
    weightCompatible,
    weightPercentage,
    materialCompatible,
    materialWarnings,
    locationMatch,
    dateAvailable,
    warnings,
    isRecommended,
  };
}

export function sortTrucksByCompatibility(
  trucks: Truck[],
  orders: Order[],
  targetDate: Date
): { truck: Truck; compatibility: TruckCompatibilityResult }[] {
  return trucks
    .map(truck => ({
      truck,
      compatibility: calculateTruckCompatibility(truck, orders, targetDate),
    }))
    .sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);
}
