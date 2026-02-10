import { Order } from '@/types/order';

export interface RouteStop {
  order: Order;
  estimatedDistance: number; // km from previous stop
  estimatedTime: number; // minutes from previous stop
  cumulativeDistance: number;
  cumulativeTime: number;
}

export type SortCriteria = 'recommended' | 'distance' | 'time' | 'custom';

// Simulated distance matrix between destinations (km)
const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  'Madrid Centro': { 'Madrid Norte': 12, 'Madrid Sur': 15, 'Barcelona Puerto': 620, 'Barcelona Zona Franca': 625, 'Valencia Industrial': 355, 'Sevilla Logística': 530, 'Bilbao Puerto': 395 },
  'Madrid Norte': { 'Madrid Centro': 12, 'Madrid Sur': 25, 'Barcelona Puerto': 615, 'Barcelona Zona Franca': 618, 'Valencia Industrial': 360, 'Sevilla Logística': 540, 'Bilbao Puerto': 390 },
  'Madrid Sur': { 'Madrid Centro': 15, 'Madrid Norte': 25, 'Barcelona Puerto': 635, 'Barcelona Zona Franca': 638, 'Valencia Industrial': 345, 'Sevilla Logística': 515, 'Bilbao Puerto': 410 },
  'Barcelona Puerto': { 'Madrid Centro': 620, 'Madrid Norte': 615, 'Madrid Sur': 635, 'Barcelona Zona Franca': 8, 'Valencia Industrial': 350, 'Sevilla Logística': 1000, 'Bilbao Puerto': 610 },
  'Barcelona Zona Franca': { 'Madrid Centro': 625, 'Madrid Norte': 618, 'Madrid Sur': 638, 'Barcelona Puerto': 8, 'Valencia Industrial': 355, 'Sevilla Logística': 1005, 'Bilbao Puerto': 615 },
  'Valencia Industrial': { 'Madrid Centro': 355, 'Madrid Norte': 360, 'Madrid Sur': 345, 'Barcelona Puerto': 350, 'Barcelona Zona Franca': 355, 'Sevilla Logística': 660, 'Bilbao Puerto': 600 },
  'Sevilla Logística': { 'Madrid Centro': 530, 'Madrid Norte': 540, 'Madrid Sur': 515, 'Barcelona Puerto': 1000, 'Barcelona Zona Franca': 1005, 'Valencia Industrial': 660, 'Bilbao Puerto': 930 },
  'Bilbao Puerto': { 'Madrid Centro': 395, 'Madrid Norte': 390, 'Madrid Sur': 410, 'Barcelona Puerto': 610, 'Barcelona Zona Franca': 615, 'Valencia Industrial': 600, 'Sevilla Logística': 930 },
};

// Average speed km/h for time estimation
const AVG_SPEED = 70;
const STOP_TIME = 30; // minutes per delivery stop

function getDistance(from: string, to: string): number {
  return DISTANCE_MATRIX[from]?.[to] ?? DISTANCE_MATRIX[to]?.[from] ?? 200;
}

function getTime(distanceKm: number): number {
  return Math.round((distanceKm / AVG_SPEED) * 60) + STOP_TIME;
}

export function buildRouteStops(orders: Order[], origin: string): RouteStop[] {
  let cumDist = 0;
  let cumTime = 0;
  let prevLocation = origin;

  return orders.map((order) => {
    const dist = getDistance(prevLocation, order.destination);
    const time = getTime(dist);
    cumDist += dist;
    cumTime += time;
    prevLocation = order.destination;

    return {
      order,
      estimatedDistance: dist,
      estimatedTime: time,
      cumulativeDistance: cumDist,
      cumulativeTime: cumTime,
    };
  });
}

// Nearest-neighbor heuristic for shortest distance
export function sortByDistance(orders: Order[], origin: string): Order[] {
  const remaining = [...orders];
  const sorted: Order[] = [];
  let current = origin;

  while (remaining.length > 0) {
    let minDist = Infinity;
    let minIdx = 0;
    remaining.forEach((order, idx) => {
      const d = getDistance(current, order.destination);
      if (d < minDist) {
        minDist = d;
        minIdx = idx;
      }
    });
    const next = remaining.splice(minIdx, 1)[0];
    sorted.push(next);
    current = next.destination;
  }
  return sorted;
}

// Sort by earliest delivery date (most urgent first)
export function sortByTime(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime());
}

// Recommended = balance of distance + urgency
export function sortRecommended(orders: Order[], origin: string): Order[] {
  // Use distance-first as recommended since it minimizes total travel
  return sortByDistance(orders, origin);
}

// Calculate total route metrics
export function getRouteMetrics(stops: RouteStop[]) {
  const last = stops[stops.length - 1];
  return {
    totalDistance: last?.cumulativeDistance ?? 0,
    totalTime: last?.cumulativeTime ?? 0,
    stopCount: stops.length,
  };
}

// Compare current order vs optimal and return warnings
export interface RouteWarning {
  type: 'suboptimal' | 'date-risk' | 'long-detour';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export function analyzeRoute(
  currentStops: RouteStop[],
  optimalByDistance: RouteStop[],
  optimalByTime: RouteStop[]
): RouteWarning[] {
  const warnings: RouteWarning[] = [];
  
  const currentMetrics = getRouteMetrics(currentStops);
  const distMetrics = getRouteMetrics(optimalByDistance);
  const timeMetrics = getRouteMetrics(optimalByTime);

  // Check if current route is significantly longer than optimal
  const distDiff = currentMetrics.totalDistance - distMetrics.totalDistance;
  const distPct = distMetrics.totalDistance > 0 ? (distDiff / distMetrics.totalDistance) * 100 : 0;
  
  if (distPct > 15) {
    warnings.push({
      type: 'suboptimal',
      message: `Tu ruta actual recorre ${Math.round(distDiff)} km más que la ruta óptima por distancia (${Math.round(distPct)}% más).`,
      severity: distPct > 30 ? 'error' : 'warning',
    });
  }

  const timeDiff = currentMetrics.totalTime - timeMetrics.totalTime;
  if (timeDiff > 60) {
    warnings.push({
      type: 'suboptimal',
      message: `Podrías ahorrar ${Math.round(timeDiff)} minutos reordenando por tiempo.`,
      severity: timeDiff > 120 ? 'error' : 'warning',
    });
  }

  // Check for date risks - any stop arriving past its delivery date
  const now = new Date();
  currentStops.forEach((stop) => {
    const arrivalMinutes = stop.cumulativeTime;
    const arrivalDate = new Date(now.getTime() + arrivalMinutes * 60000);
    if (arrivalDate > stop.order.deliveryDate) {
      warnings.push({
        type: 'date-risk',
        message: `El pedido ${stop.order.id} podría llegar después de su fecha límite.`,
        severity: 'error',
      });
    }
  });

  // Check for large detours between consecutive stops
  currentStops.forEach((stop, i) => {
    if (i > 0 && stop.estimatedDistance > 500) {
      warnings.push({
        type: 'long-detour',
        message: `Desvío largo de ${stop.estimatedDistance} km entre la parada ${i} y ${i + 1}.`,
        severity: 'warning',
      });
    }
  });

  return warnings;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}min`;
}
