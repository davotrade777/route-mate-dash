import { Order } from './order';
import { Truck } from './truck';
import { RouteWarning } from '@/utils/routeOptimizer';

export type FreightStatus = 
  | 'review'        // Planificador revisando
  | 'sent'          // Enviado al transportista
  | 'accepted'      // Aceptado por transportista
  | 'rejected';     // Rechazado por transportista

export interface FreightAlert {
  id: string;
  type: 'weight' | 'material' | 'route' | 'date' | 'general';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
  actionStep?: 'truck-assignment' | 'route-optimization';
}

export interface FreightSummaryData {
  orders: Order[];
  truck: Truck;
  orderedStops: Order[];
  routeDistance: number;
  routeTime: number;
  routeWarnings: RouteWarning[];
  status: FreightStatus;
}
