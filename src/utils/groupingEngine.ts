import { Order, MATERIAL_COMPATIBILITY, MaterialType } from '@/types/order';

export interface OrderGroup {
  id: string;
  orders: Order[];
  destination: string;
  dateRange: { start: Date; end: Date };
  totalWeight: number;
  compatibilityScore: number;
  hasWarnings: boolean;
  criteria: {
    sameDestination: boolean;
    closeDates: boolean;
    compatibleMaterials: boolean;
  };
}

const areMaterialsCompatible = (orders: Order[]): { compatible: boolean; hasWarnings: boolean } => {
  const allTypes = new Set<MaterialType>();
  orders.forEach(order => {
    order.materials.forEach(m => allTypes.add(m.type));
  });

  const typesArray = Array.from(allTypes);
  let hasWarnings = false;

  for (let i = 0; i < typesArray.length; i++) {
    for (let j = i + 1; j < typesArray.length; j++) {
      const type1 = typesArray[i];
      const type2 = typesArray[j];
      const compatible1 = MATERIAL_COMPATIBILITY[type1];
      const compatible2 = MATERIAL_COMPATIBILITY[type2];

      if (!compatible1.includes(type2) || !compatible2.includes(type1)) {
        // Check for critical combinations
        const criticalPairs: [MaterialType, MaterialType][] = [
          ['fragil', 'robusto'],
          ['perecedero', 'quimico'],
          ['electronico', 'liquido'],
        ];
        
        const isCritical = criticalPairs.some(
          ([a, b]) => (type1 === a && type2 === b) || (type1 === b && type2 === a)
        );

        if (isCritical) {
          return { compatible: false, hasWarnings: true };
        }
        hasWarnings = true;
      }
    }
  }

  return { compatible: true, hasWarnings };
};

const getDaysDifference = (date1: Date, date2: Date): number => {
  return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
};

export const findCompatibleGroups = (orders: Order[], minGroupSize = 2, maxDaysDiff = 3): OrderGroup[] => {
  const groups: OrderGroup[] = [];
  const processedOrders = new Set<string>();

  // Group by destination first
  const byDestination = new Map<string, Order[]>();
  orders.forEach(order => {
    const city = order.destination.split(' ')[0];
    if (!byDestination.has(city)) {
      byDestination.set(city, []);
    }
    byDestination.get(city)!.push(order);
  });

  // For each destination group, find compatible subgroups by date
  byDestination.forEach((destOrders, destination) => {
    if (destOrders.length < minGroupSize) return;

    // Sort by date
    const sortedOrders = [...destOrders].sort(
      (a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime()
    );

    // Find clusters of orders with close dates
    let currentCluster: Order[] = [sortedOrders[0]];

    for (let i = 1; i < sortedOrders.length; i++) {
      const daysDiff = getDaysDifference(
        sortedOrders[i].deliveryDate,
        currentCluster[currentCluster.length - 1].deliveryDate
      );

      if (daysDiff <= maxDaysDiff) {
        currentCluster.push(sortedOrders[i]);
      } else {
        // Process current cluster
        if (currentCluster.length >= minGroupSize) {
          const { compatible, hasWarnings } = areMaterialsCompatible(currentCluster);
          if (compatible) {
            const dates = currentCluster.map(o => o.deliveryDate);
            const group: OrderGroup = {
              id: `group-${destination}-${groups.length}`,
              orders: currentCluster,
              destination,
              dateRange: {
                start: new Date(Math.min(...dates.map(d => d.getTime()))),
                end: new Date(Math.max(...dates.map(d => d.getTime()))),
              },
              totalWeight: currentCluster.reduce((sum, o) => sum + o.weight, 0),
              compatibilityScore: hasWarnings ? 75 : 95,
              hasWarnings,
              criteria: {
                sameDestination: true,
                closeDates: true,
                compatibleMaterials: !hasWarnings,
              },
            };
            groups.push(group);
            currentCluster.forEach(o => processedOrders.add(o.id));
          }
        }
        currentCluster = [sortedOrders[i]];
      }
    }

    // Don't forget the last cluster
    if (currentCluster.length >= minGroupSize) {
      const alreadyProcessed = currentCluster.every(o => processedOrders.has(o.id));
      if (!alreadyProcessed) {
        const { compatible, hasWarnings } = areMaterialsCompatible(currentCluster);
        if (compatible) {
          const dates = currentCluster.map(o => o.deliveryDate);
          const group: OrderGroup = {
            id: `group-${destination}-${groups.length}`,
            orders: currentCluster,
            destination,
            dateRange: {
              start: new Date(Math.min(...dates.map(d => d.getTime()))),
              end: new Date(Math.max(...dates.map(d => d.getTime()))),
            },
            totalWeight: currentCluster.reduce((sum, o) => sum + o.weight, 0),
            compatibilityScore: hasWarnings ? 75 : 95,
            hasWarnings,
            criteria: {
              sameDestination: true,
              closeDates: true,
              compatibleMaterials: !hasWarnings,
            },
          };
          groups.push(group);
        }
      }
    }
  });

  // Sort by compatibility score
  return groups.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
