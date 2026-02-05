import { Order, CompatibilityResult, MATERIAL_COMPATIBILITY, MaterialType, MATERIAL_LABELS } from '@/types/order';

const getDateProximity = (date1: Date, date2: Date): number => {
  const diffDays = Math.abs(
    (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return 100;
  if (diffDays <= 1) return 90;
  if (diffDays <= 2) return 75;
  if (diffDays <= 3) return 60;
  if (diffDays <= 5) return 40;
  if (diffDays <= 7) return 20;
  return 0;
};

const getDestinationMatch = (dest1: string, dest2: string): boolean => {
  const city1 = dest1.split(' ')[0].toLowerCase();
  const city2 = dest2.split(' ')[0].toLowerCase();
  return city1 === city2;
};

const getMaterialCompatibility = (
  materials1: { type: MaterialType }[],
  materials2: { type: MaterialType }[]
): { compatibility: 'compatible' | 'warning' | 'incompatible'; warnings: string[] } => {
  const warnings: string[] = [];
  let hasIncompatible = false;
  let hasWarning = false;

  const types1 = [...new Set(materials1.map(m => m.type))];
  const types2 = [...new Set(materials2.map(m => m.type))];

  for (const type1 of types1) {
    for (const type2 of types2) {
      const compatible1 = MATERIAL_COMPATIBILITY[type1];
      const compatible2 = MATERIAL_COMPATIBILITY[type2];

      if (!compatible1.includes(type2) || !compatible2.includes(type1)) {
        const label1 = MATERIAL_LABELS[type1];
        const label2 = MATERIAL_LABELS[type2];
        
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
          hasIncompatible = true;
          warnings.push(`⚠️ Riesgo alto: ${label1} + ${label2}`);
        } else {
          hasWarning = true;
          warnings.push(`Precaución: ${label1} con ${label2}`);
        }
      }
    }
  }

  if (hasIncompatible) return { compatibility: 'incompatible', warnings };
  if (hasWarning) return { compatibility: 'warning', warnings };
  return { compatibility: 'compatible', warnings: [] };
};

export const calculateCompatibility = (
  selectedOrder: Order,
  targetOrder: Order
): CompatibilityResult => {
  const destinationMatch = getDestinationMatch(
    selectedOrder.destination,
    targetOrder.destination
  );
  
  const dateProximity = getDateProximity(
    selectedOrder.deliveryDate,
    targetOrder.deliveryDate
  );

  const { compatibility, warnings } = getMaterialCompatibility(
    selectedOrder.materials,
    targetOrder.materials
  );

  // Calculate overall score
  let score = 0;
  
  // Destination match: 40 points
  if (destinationMatch) score += 40;
  
  // Date proximity: up to 35 points
  score += (dateProximity / 100) * 35;
  
  // Material compatibility: up to 25 points
  if (compatibility === 'compatible') score += 25;
  else if (compatibility === 'warning') score += 12;
  // incompatible gets 0 points but doesn't block

  return {
    orderId: targetOrder.id,
    score: Math.round(score),
    destinationMatch,
    dateProximity,
    materialCompatibility: compatibility,
    warnings,
  };
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'match-excellent';
  if (score >= 60) return 'match-good';
  if (score >= 40) return 'match-moderate';
  if (score >= 20) return 'match-poor';
  return 'match-incompatible';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Moderado';
  if (score >= 20) return 'Bajo';
  return 'Incompatible';
};
