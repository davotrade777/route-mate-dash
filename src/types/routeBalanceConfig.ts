export interface RouteClassificationParams {
  /** Umbral de distancia (km) para clasificar ruta larga */
  longRouteDistanceThreshold: number;
  /** Umbral de tiempo estimado (horas) para clasificar ruta larga */
  longRouteTimeThreshold: number;
  /** Criterio de clasificación: distancia, tiempo o combinación */
  classificationCriteria: 'distance' | 'time' | 'combined';
}

export interface BalanceRule {
  /** Porcentaje máximo de rutas largas permitido (0-100) */
  maxLongRoutePercentage: number;
  /** Porcentaje mínimo de rutas cortas requerido (0-100) */
  minShortRoutePercentage: number;
  /** Máximo de rutas largas consecutivas antes de alerta */
  maxConsecutiveLongRoutes: number;
}

export interface AnalysisWindow {
  /** Tipo de ventana de análisis */
  windowType: 'trips' | 'time';
  /** Últimos N viajes (si windowType = 'trips') */
  lastNTrips: number;
  /** Período en días (si windowType = 'time') */
  timePeriodDays: number;
}

export interface AlertConfig {
  /** Mostrar alerta preventiva antes de aprobar flete */
  showPreventiveAlert: boolean;
  /** Bloquear asignación automáticamente al exceder límites */
  autoBlockOnExceed: boolean;
  /** Requerir justificación obligatoria para excepciones */
  requireJustification: boolean;
}

export interface AuditRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  reason: string;
  freightId: string;
  ruleViolated: string;
}

export interface RouteBalanceConfig {
  classification: RouteClassificationParams;
  balanceRule: BalanceRule;
  analysisWindow: AnalysisWindow;
  alerts: AlertConfig;
}

export const defaultRouteBalanceConfig: RouteBalanceConfig = {
  classification: {
    longRouteDistanceThreshold: 300,
    longRouteTimeThreshold: 5,
    classificationCriteria: 'combined',
  },
  balanceRule: {
    maxLongRoutePercentage: 60,
    minShortRoutePercentage: 40,
    maxConsecutiveLongRoutes: 3,
  },
  analysisWindow: {
    windowType: 'trips',
    lastNTrips: 20,
    timePeriodDays: 30,
  },
  alerts: {
    showPreventiveAlert: true,
    autoBlockOnExceed: true,
    requireJustification: true,
  },
};
