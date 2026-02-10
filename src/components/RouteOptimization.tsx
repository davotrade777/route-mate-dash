import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft, Route, MapPin, Clock, Ruler, AlertTriangle, CheckCircle2,
  GripVertical, Sparkles, Package, Truck, Calendar, Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order } from '@/types/order';
import { Truck as TruckType } from '@/types/truck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MaterialTypeTag } from './MaterialTag';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  buildRouteStops, sortByDistance, sortByTime, sortRecommended,
  analyzeRoute, getRouteMetrics, formatDuration,
  type SortCriteria, type RouteStop, type RouteWarning,
} from '@/utils/routeOptimizer';

interface RouteOptimizationProps {
  groupedOrders: Order[];
  truck: TruckType;
  onBack: () => void;
  onConfirm: (orderedOrders: Order[], routeDistance: number, routeTime: number, routeWarnings: RouteWarning[]) => void;
}

const CRITERIA_OPTIONS: { id: SortCriteria; label: string; icon: typeof Ruler; description: string }[] = [
  { id: 'recommended', label: 'Recomendada', icon: Sparkles, description: 'Balance óptimo distancia/urgencia' },
  { id: 'distance', label: 'Menor distancia', icon: Ruler, description: 'Minimizar kilómetros totales' },
  { id: 'time', label: 'Más urgente', icon: Clock, description: 'Priorizar entregas urgentes' },
  { id: 'custom', label: 'Personalizado', icon: GripVertical, description: 'Arrastra para reordenar' },
];

export function RouteOptimization({ groupedOrders, truck, onBack, onConfirm }: RouteOptimizationProps) {
  const [activeCriteria, setActiveCriteria] = useState<SortCriteria>('recommended');
  const [customOrder, setCustomOrder] = useState<Order[]>(groupedOrders);
  const [hasManuallyReordered, setHasManuallyReordered] = useState(false);

  // Computed sorted orders for each criteria
  const sortedByDistance = useMemo(() => sortByDistance(groupedOrders, truck.currentLocation), [groupedOrders, truck]);
  const sortedByTime = useMemo(() => sortByTime(groupedOrders), [groupedOrders]);
  const sortedRecommended = useMemo(() => sortRecommended(groupedOrders, truck.currentLocation), [groupedOrders, truck]);

  const activeOrders = useMemo(() => {
    switch (activeCriteria) {
      case 'distance': return sortedByDistance;
      case 'time': return sortedByTime;
      case 'recommended': return sortedRecommended;
      case 'custom': return customOrder;
    }
  }, [activeCriteria, sortedByDistance, sortedByTime, sortedRecommended, customOrder]);

  // Build route stops for current order
  const currentStops = useMemo(() => buildRouteStops(activeOrders, truck.currentLocation), [activeOrders, truck]);
  const optimalDistStops = useMemo(() => buildRouteStops(sortedByDistance, truck.currentLocation), [sortedByDistance, truck]);
  const optimalTimeStops = useMemo(() => buildRouteStops(sortedByTime, truck.currentLocation), [sortedByTime, truck]);

  const metrics = useMemo(() => getRouteMetrics(currentStops), [currentStops]);
  const distMetrics = useMemo(() => getRouteMetrics(optimalDistStops), [optimalDistStops]);

  // Analyze for warnings
  const warnings = useMemo(
    () => analyzeRoute(currentStops, optimalDistStops, optimalTimeStops),
    [currentStops, optimalDistStops, optimalTimeStops]
  );

  // Update custom order when switching to a preset
  useEffect(() => {
    if (activeCriteria !== 'custom') {
      setCustomOrder(activeOrders);
      setHasManuallyReordered(false);
    }
  }, [activeCriteria]);

  const handleCriteriaChange = (criteria: SortCriteria) => {
    setActiveCriteria(criteria);
    if (criteria !== 'custom') {
      toast.info(`Ruta reordenada: ${CRITERIA_OPTIONS.find(c => c.id === criteria)?.label}`, {
        icon: <Route className="h-4 w-4" />,
      });
    }
  };

  const handleReorder = (newOrder: Order[]) => {
    setCustomOrder(newOrder);
    setHasManuallyReordered(true);
    if (activeCriteria !== 'custom') {
      setActiveCriteria('custom');
    }
  };

  const handleConfirm = () => {
    toast.success('Ruta confirmada', {
      description: `${activeOrders.length} paradas · ${Math.round(metrics.totalDistance)} km · ${formatDuration(metrics.totalTime)}`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });
    onConfirm(activeOrders, metrics.totalDistance, metrics.totalTime, warnings);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-lg bg-primary/10">
                <Route className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Optimización de Ruta</h1>
                <p className="text-sm text-muted-foreground">
                  {truck.id} · {truck.driver} · {activeOrders.length} paradas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Quick sort criteria */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            Criterio de ordenamiento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CRITERIA_OPTIONS.map((opt) => {
              const isActive = activeCriteria === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  onClick={() => handleCriteriaChange(opt.id)}
                  className={cn(
                    'relative p-4 rounded-xl border text-left transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                      : 'bg-card border-border hover:border-primary/20 hover:bg-muted/50'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <opt.icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', isActive ? 'text-primary' : '')}>
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                  {isActive && (
                    <motion.div
                      layoutId="criteria-indicator"
                      className="absolute inset-0 rounded-xl border-2 border-primary/50"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Route stops - drag and drop */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Orden de entregas</h2>
              </div>
              {activeCriteria === 'custom' && (
                <Badge variant="outline" className="text-xs">
                  <GripVertical className="h-3 w-3 mr-1" />
                  Arrastra para reordenar
                </Badge>
              )}
            </div>

            {/* Origin point */}
            <div className="flex items-center gap-3 mb-2 pl-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Origen: {truck.currentLocation}</p>
                <p className="text-xs text-muted-foreground">Ubicación actual del camión</p>
              </div>
            </div>

            {/* Route line + stops */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[31px] top-0 bottom-0 w-0.5 bg-border" />

              <Reorder.Group
                axis="y"
                values={activeCriteria === 'custom' ? customOrder : activeOrders}
                onReorder={handleReorder}
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {currentStops.map((stop, index) => (
                    <Reorder.Item
                      key={stop.order.id}
                      value={stop.order}
                      dragListener={activeCriteria === 'custom'}
                      className={cn(
                        'relative',
                        activeCriteria === 'custom' ? 'cursor-grab active:cursor-grabbing' : ''
                      )}
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <RouteStopCard
                          stop={stop}
                          index={index}
                          isDraggable={activeCriteria === 'custom'}
                          isLast={index === currentStops.length - 1}
                        />
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </div>
          </div>

          {/* Sidebar: metrics + warnings */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Route summary */}
              <h2 className="font-semibold flex items-center gap-2">
                <Route className="h-5 w-5 text-muted-foreground" />
                Resumen de ruta
              </h2>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                      icon={Ruler}
                      label="Distancia total"
                      value={`${Math.round(metrics.totalDistance)} km`}
                      comparison={metrics.totalDistance > distMetrics.totalDistance
                        ? `+${Math.round(metrics.totalDistance - distMetrics.totalDistance)} km vs óptima`
                        : undefined}
                      isOptimal={metrics.totalDistance <= distMetrics.totalDistance * 1.05}
                    />
                    <MetricCard
                      icon={Clock}
                      label="Tiempo estimado"
                      value={formatDuration(metrics.totalTime)}
                      isOptimal={true}
                    />
                    <MetricCard
                      icon={MapPin}
                      label="Paradas"
                      value={`${metrics.stopCount}`}
                      isOptimal={true}
                    />
                    <MetricCard
                      icon={Package}
                      label="Pedidos"
                      value={`${groupedOrders.length}`}
                      isOptimal={true}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Warnings */}
              <AnimatePresence>
                {warnings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Alertas de ruta ({warnings.length})
                    </h3>
                    {warnings.map((w, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <WarningCard warning={w} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {warnings.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-match-compatible/10 border border-match-compatible/30"
                >
                  <CheckCircle2 className="h-4 w-4 text-match-compatible" />
                  <p className="text-sm text-match-compatible font-medium">Ruta óptima — sin alertas</p>
                </motion.div>
              )}

              {/* Confirm */}
              <Button size="lg" className="w-full" onClick={handleConfirm}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar ruta
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                La decisión final siempre es del planificador
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

function RouteStopCard({ stop, index, isDraggable, isLast }: {
  stop: RouteStop; index: number; isDraggable: boolean; isLast: boolean;
}) {
  const allMaterials = stop.order.materials.map(m => m.type);

  return (
    <div className="flex items-start gap-3 pl-4">
      {/* Stop number */}
      <div className={cn(
        'relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
        isLast ? 'bg-destructive/10 text-destructive border-2 border-destructive/30'
          : 'bg-primary/10 text-primary border-2 border-primary/30'
      )}>
        {index + 1}
      </div>

      {/* Card */}
      <Card className={cn(
        'flex-1 transition-all duration-200',
        isDraggable ? 'hover:shadow-md hover:border-primary/30' : ''
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                {isDraggable && <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />}
                <span className="font-mono text-xs text-muted-foreground">{stop.order.id}</span>
                <span className="text-sm font-medium truncate">{stop.order.client}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{stop.order.destination}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  {stop.estimatedDistance} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(stop.estimatedTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(stop.order.deliveryDate, 'd MMM', { locale: es })}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {allMaterials.map(type => (
                  <MaterialTypeTag key={type} type={type as any} />
                ))}
              </div>
            </div>

            {/* Cumulative badge */}
            <div className="text-right shrink-0 space-y-1">
              <p className="text-xs text-muted-foreground">Acumulado</p>
              <p className="text-sm font-semibold">{Math.round(stop.cumulativeDistance)} km</p>
              <p className="text-xs text-muted-foreground">{formatDuration(stop.cumulativeTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, comparison, isOptimal }: {
  icon: typeof Ruler; label: string; value: string; comparison?: string; isOptimal: boolean;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={cn('text-lg font-bold', isOptimal ? 'text-foreground' : 'text-destructive')}>
        {value}
      </p>
      {comparison && (
        <p className="text-xs text-destructive">{comparison}</p>
      )}
    </div>
  );
}

function WarningCard({ warning }: { warning: RouteWarning }) {
  const severityStyles = {
    info: 'bg-muted/50 border-border text-muted-foreground',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
  };

  const icons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertTriangle,
  };

  const Icon = icons[warning.severity];

  return (
    <div className={cn('flex items-start gap-2 p-3 rounded-lg border text-sm', severityStyles[warning.severity])}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <p>{warning.message}</p>
    </div>
  );
}
