import { useState, useMemo, useEffect } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Ruler, Sparkles,
  GripVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order } from '@/types/order';
import { Truck as TruckType } from '@/types/truck';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RouteSidebar } from './RouteSidebar';
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
  { id: 'recommended', label: 'Ruta recomendada', icon: Sparkles, description: 'Balance óptimo' },
  { id: 'distance', label: 'Mejor distancia', icon: Ruler, description: 'Menos kilómetros' },
  { id: 'time', label: 'Más urgente', icon: Clock, description: 'Priorizar entregas' },
];

export function RouteOptimization({ groupedOrders, truck, onBack, onConfirm }: RouteOptimizationProps) {
  const [activeCriteria, setActiveCriteria] = useState<SortCriteria>('recommended');
  const [customOrder, setCustomOrder] = useState<Order[]>(groupedOrders);
  const [hasManuallyReordered, setHasManuallyReordered] = useState(false);

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

  const currentStops = useMemo(() => buildRouteStops(activeOrders, truck.currentLocation), [activeOrders, truck]);
  const optimalDistStops = useMemo(() => buildRouteStops(sortedByDistance, truck.currentLocation), [sortedByDistance, truck]);
  const optimalTimeStops = useMemo(() => buildRouteStops(sortedByTime, truck.currentLocation), [sortedByTime, truck]);

  const metrics = useMemo(() => getRouteMetrics(currentStops), [currentStops]);
  const distMetrics = useMemo(() => getRouteMetrics(optimalDistStops), [optimalDistStops]);

  const warnings = useMemo(
    () => analyzeRoute(currentStops, optimalDistStops, optimalTimeStops),
    [currentStops, optimalDistStops, optimalTimeStops]
  );

  // Saved hours: difference between worst possible and current
  const worstTime = useMemo(() => {
    const reversed = [...groupedOrders].reverse();
    const worstStops = buildRouteStops(reversed, truck.currentLocation);
    return getRouteMetrics(worstStops).totalTime;
  }, [groupedOrders, truck]);
  const savedHours = Math.max(0, (worstTime - metrics.totalTime) / 60);

  useEffect(() => {
    if (activeCriteria !== 'custom') {
      setCustomOrder(activeOrders);
      setHasManuallyReordered(false);
    }
  }, [activeCriteria]);

  const handleCriteriaChange = (criteria: SortCriteria) => {
    setActiveCriteria(criteria);
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
    });
    onConfirm(activeOrders, metrics.totalDistance, metrics.totalTime, warnings);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Header */}
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-2xl font-extrabold text-foreground mb-6">Configura la ruta</h1>

          {/* Criteria — 3 horizontal buttons */}
          <div className="flex gap-3 mb-8">
            {CRITERIA_OPTIONS.map((opt) => {
              const isActive = activeCriteria === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleCriteriaChange(opt.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-left transition-colors',
                    isActive
                      ? 'bg-primary/5 border-primary/30'
                      : 'border-transparent hover:bg-muted/50'
                  )}
                >
                  <opt.icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <div>
                    <p className={cn('text-sm font-semibold', isActive ? 'text-primary' : 'text-foreground')}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Orden de entregas */}
          <h2 className="text-lg font-semibold text-foreground mb-6">Orden de entregas</h2>

          <div className="relative">
            {/* Vertical line spanning all stops */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

            {/* Origin */}
            <div className="relative flex items-start gap-5 pb-10">
              <div className="relative z-10 w-8 h-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-background" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-medium text-primary">Punto de inicio</p>
                <p className="text-base font-bold text-foreground">{truck.currentLocation}</p>
              </div>
            </div>

            {/* Stops */}
            <Reorder.Group
              axis="y"
              values={activeCriteria === 'custom' ? customOrder : activeOrders}
              onReorder={handleReorder}
              className="space-y-0"
            >
              <AnimatePresence mode="popLayout">
                {currentStops.map((stop, index) => (
                  <Reorder.Item
                    key={stop.order.id}
                    value={stop.order}
                    dragListener={true}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <TimelineStop
                        stop={stop}
                        index={index}
                        isLast={index === currentStops.length - 1}
                      />
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <RouteSidebar
        totalDistance={metrics.totalDistance}
        totalTime={metrics.totalTime}
        stopCount={metrics.stopCount}
        savedHours={savedHours}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

// --- Timeline stop ---

function TimelineStop({ stop, index, isLast, isDraggable }: {
  stop: RouteStop; index: number; isLast: boolean; isDraggable: boolean;
}) {
  return (
    <div className={cn('flex items-start gap-4', !isLast && 'border-b border-border')}>
      {/* Circle + line */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {isDraggable && <GripVertical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
              <span className="text-xs text-muted-foreground font-mono">{stop.order.id}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {format(stop.order.deliveryDate, 'd MMM yyyy', { locale: es })}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">{stop.order.destination}</p>
          </div>

          {/* Cumulative metrics */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-0.5">Trayecto acumulado</p>
            <div className="flex items-center gap-3 justify-end">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                {Math.round(stop.cumulativeDistance)} km
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(stop.cumulativeTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
