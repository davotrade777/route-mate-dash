import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Send, CheckCircle2, XCircle, AlertTriangle,
  Package, Truck as TruckIcon, Route, MapPin, Clock, Ruler, Calendar,
  Weight, Shield, RefreshCw, FileText, Info, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order, MATERIAL_LABELS, MaterialType } from '@/types/order';
import { Truck } from '@/types/truck';
import { FreightStatus, FreightAlert } from '@/types/freight';
import { RouteWarning } from '@/utils/routeOptimizer';
import { calculateTruckCompatibility, sortTrucksByCompatibility } from '@/utils/truckCompatibilityCalculator';
import { mockTrucks } from '@/data/mockTrucks';
import { formatDuration } from '@/utils/routeOptimizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MaterialTypeTag } from './MaterialTag';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FreightSummaryProps {
  orders: Order[];
  truck: Truck;
  orderedStops: Order[];
  routeDistance: number;
  routeTime: number;
  routeWarnings: RouteWarning[];
  onBack: () => void;
  onGoHome: () => void;
  onReassignTruck: (newTruck: Truck) => void;
  onFixRoute: () => void;
}

const STATUS_CONFIG: Record<FreightStatus, { label: string; color: string; icon: typeof Send; bgClass: string }> = {
  review: { label: 'En revisión', color: 'text-muted-foreground', icon: FileText, bgClass: 'bg-muted/50 border-border' },
  sent: { label: 'Enviado · Esperando respuesta', color: 'text-info', icon: Loader2, bgClass: 'bg-info/10 border-info/30' },
  accepted: { label: 'Aceptado por transportista', color: 'text-success', icon: CheckCircle2, bgClass: 'bg-success/10 border-success/30' },
  rejected: { label: 'Rechazado por transportista', color: 'text-destructive', icon: XCircle, bgClass: 'bg-destructive/10 border-destructive/30' },
};

export function FreightSummary({
  orders, truck, orderedStops, routeDistance, routeTime, routeWarnings,
  onBack, onGoHome, onReassignTruck, onFixRoute,
}: FreightSummaryProps) {
  const [status, setStatus] = useState<FreightStatus>('review');
  const [currentTruck, setCurrentTruck] = useState<Truck>(truck);

  const totalWeight = useMemo(() => orders.reduce((s, o) => s + o.weight, 0), [orders]);
  const destinations = useMemo(() => [...new Set(orders.map(o => o.destination))], [orders]);
  const allMaterials = useMemo(() => {
    const types = new Set<MaterialType>();
    orders.forEach(o => o.materials.forEach(m => types.add(m.type)));
    return Array.from(types);
  }, [orders]);

  const earliestDate = useMemo(() =>
    orders.reduce((e, o) => (o.deliveryDate < e ? o.deliveryDate : e), orders[0]?.deliveryDate || new Date()),
    [orders]
  );

  // Generate freight alerts
  const alerts = useMemo<FreightAlert[]>(() => {
    const result: FreightAlert[] = [];
    const compat = calculateTruckCompatibility(currentTruck, orders, earliestDate);

    if (!compat.weightCompatible) {
      result.push({
        id: 'weight', type: 'weight', severity: 'error',
        title: 'Exceso de peso',
        message: `El peso total (${totalWeight.toLocaleString()} kg) excede la capacidad del camión (${currentTruck.maxWeight.toLocaleString()} kg).`,
        actionLabel: 'Cambiar camión', actionStep: 'truck-assignment',
      });
    }

    if (!compat.materialCompatible) {
      const unsupported = allMaterials.filter(m => !currentTruck.allowedMaterials.includes(m));
      result.push({
        id: 'material', type: 'material', severity: 'error',
        title: 'Material no soportado',
        message: `El camión no transporta: ${unsupported.map(m => MATERIAL_LABELS[m]).join(', ')}.`,
        actionLabel: 'Cambiar camión', actionStep: 'truck-assignment',
      });
    }

    if (!compat.dateAvailable) {
      result.push({
        id: 'date', type: 'date', severity: 'warning',
        title: 'Disponibilidad del camión',
        message: `El camión no está disponible antes de la fecha límite de entrega.`,
        actionLabel: 'Cambiar camión', actionStep: 'truck-assignment',
      });
    }

    routeWarnings.forEach((w, i) => {
      result.push({
        id: `route-${i}`, type: 'route', severity: w.severity,
        title: w.type === 'suboptimal' ? 'Ruta subóptima'
          : w.type === 'date-risk' ? 'Riesgo de fecha'
          : 'Desvío largo',
        message: w.message,
        actionLabel: 'Ajustar ruta', actionStep: 'route-optimization',
      });
    });

    return result;
  }, [currentTruck, orders, routeWarnings, totalWeight, allMaterials, earliestDate]);

  const truckAlerts = alerts.filter(a => a.type === 'weight' || a.type === 'material' || a.type === 'date');
  const routeAlerts = alerts.filter(a => a.type === 'route');
  const errorAlerts = alerts.filter(a => a.severity === 'error');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  // Next recommended truck for reassignment
  const nextRecommendedTruck = useMemo(() => {
    const sorted = sortTrucksByCompatibility(mockTrucks, orders, earliestDate);
    const next = sorted.find(t => t.truck.id !== currentTruck.id && t.compatibility.isRecommended);
    return next ? next.truck : sorted.find(t => t.truck.id !== currentTruck.id)?.truck;
  }, [orders, earliestDate, currentTruck]);

  const handleSend = () => {
    setStatus('sent');
    toast.success('Flete enviado al transportista', {
      description: `${currentTruck.driver} · ${currentTruck.id}`,
      icon: <Send className="h-4 w-4" />,
    });

    // Simulate response after delay
    setTimeout(() => {
      const accepted = Math.random() > 0.4;
      if (accepted) {
        setStatus('accepted');
        toast.success('¡Flete aceptado!', {
          description: `${currentTruck.driver} ha confirmado el flete.`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      } else {
        setStatus('rejected');
        toast.error('Flete rechazado', {
          description: `${currentTruck.driver} no puede realizar el flete. Puedes reasignar rápidamente.`,
          icon: <XCircle className="h-4 w-4" />,
        });
      }
    }, 4000);
  };

  const handleQuickReassign = () => {
    if (!nextRecommendedTruck) {
      toast.error('No hay camiones alternativos disponibles');
      return;
    }
    setCurrentTruck(nextRecommendedTruck);
    setStatus('review');
    toast.info(`Camión reasignado a ${nextRecommendedTruck.id}`, {
      description: `Conductor: ${nextRecommendedTruck.driver}`,
      icon: <RefreshCw className="h-4 w-4" />,
    });
  };

  const handleAlertAction = (alert: FreightAlert) => {
    if (alert.actionStep === 'truck-assignment') {
      onReassignTruck(currentTruck);
    } else if (alert.actionStep === 'route-optimization') {
      onFixRoute();
    }
  };

  const statusCfg = STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;

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
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Resumen del Flete</h1>
                <p className="text-sm text-muted-foreground">
                  {orders.length} pedidos · {currentTruck.id} · {currentTruck.driver}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <motion.div
              key={status}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border', statusCfg.bgClass)}
            >
              <StatusIcon className={cn('h-4 w-4', statusCfg.color, status === 'sent' && 'animate-spin')} />
              <span className={cn('text-sm font-medium', statusCfg.color)}>{statusCfg.label}</span>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Alerts are now embedded in their respective cards below */}

        {/* Rejected state - reassign prompt */}
        <AnimatePresence>
          {status === 'rejected' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-destructive">Flete rechazado por {currentTruck.driver}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Puedes reasignar rápidamente al siguiente camión recomendado o volver a seleccionar manualmente.
                        </p>
                      </div>
                      {nextRecommendedTruck && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                          <TruckIcon className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Siguiente recomendado: {nextRecommendedTruck.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {nextRecommendedTruck.driver} · {nextRecommendedTruck.brand} {nextRecommendedTruck.model} · {nextRecommendedTruck.maxWeight.toLocaleString()} kg
                            </p>
                          </div>
                          <Button size="sm" onClick={handleQuickReassign}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reasignar
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onReassignTruck(currentTruck)}>
                          Seleccionar otro camión
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main content - key info */}
          <div className="xl:col-span-2 space-y-4">
            {/* Truck info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TruckIcon className="h-4 w-4" />
                  Transporte asignado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoBlock label="Camión" value={currentTruck.id} sub={currentTruck.plate} />
                  <InfoBlock label="Conductor" value={currentTruck.driver} />
                  <InfoBlock label="Vehículo" value={`${currentTruck.brand} ${currentTruck.model}`} />
                  <InfoBlock label="Capacidad" value={`${currentTruck.maxWeight.toLocaleString()} kg`}
                    sub={`${Math.round((totalWeight / currentTruck.maxWeight) * 100)}% utilizado`}
                    highlight={totalWeight > currentTruck.maxWeight}
                  />
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Materiales permitidos:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentTruck.allowedMaterials.map(m => (
                        <MaterialTypeTag key={m} type={m} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Truck alerts inline */}
                {truckAlerts.length > 0 && status === 'review' && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {truckAlerts.map((alert) => (
                      <AlertCard key={alert.id} alert={alert} onAction={() => handleAlertAction(alert)} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Ruta de entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Ruler className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{Math.round(routeDistance)} km</p>
                    <p className="text-xs text-muted-foreground">Distancia total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{formatDuration(routeTime)}</p>
                    <p className="text-xs text-muted-foreground">Tiempo estimado</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{orderedStops.length}</p>
                    <p className="text-xs text-muted-foreground">Paradas</p>
                  </div>
                </div>

                {/* Ordered stops list */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-primary/5 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <TruckIcon className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-primary">{currentTruck.currentLocation}</span>
                    <span className="text-muted-foreground text-xs">— Origen</span>
                  </div>
                  {orderedStops.map((order, i) => (
                    <div key={order.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-sm">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        i === orderedStops.length - 1
                          ? 'bg-destructive/10 text-destructive border border-destructive/30'
                          : 'bg-muted text-muted-foreground border border-border'
                      )}>
                        {i + 1}
                      </div>
                      <span className="font-medium">{order.destination}</span>
                      <span className="text-muted-foreground text-xs">— {order.client}</span>
                      <span className="text-xs text-muted-foreground ml-auto font-mono">{order.id}</span>
                    </div>
                  ))}
                </div>
                {/* Route alerts inline */}
                {routeAlerts.length > 0 && status === 'review' && (
                  <div className="mt-4 pt-3 border-t space-y-2">
                    {routeAlerts.map((alert) => (
                      <AlertCard key={alert.id} alert={alert} onAction={() => handleAlertAction(alert)} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders detail */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Pedidos incluidos ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {orders.map(order => (
                    <div key={order.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{order.id}</span>
                            <span className="text-sm font-medium">{order.client}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {order.destination}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {format(order.deliveryDate, 'd MMM', { locale: es })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Weight className="h-3 w-3" /> {order.weight.toLocaleString()} kg
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {order.materials.map(m => (
                              <MaterialTypeTag key={m.id} type={m.type} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - summary + actions */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Resumen rápido
              </h2>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <SummaryRow icon={Package} label="Pedidos" value={`${orders.length}`} />
                  <SummaryRow icon={Weight} label="Peso total" value={`${totalWeight.toLocaleString()} kg`}
                    alert={totalWeight > currentTruck.maxWeight}
                  />
                  <SummaryRow icon={MapPin} label="Destinos" value={`${destinations.length}`} />
                  <SummaryRow icon={Ruler} label="Distancia" value={`${Math.round(routeDistance)} km`} />
                  <SummaryRow icon={Clock} label="Tiempo est." value={formatDuration(routeTime)} />
                  <SummaryRow icon={TruckIcon} label="Camión" value={currentTruck.id} />
                  <SummaryRow icon={Calendar} label="Fecha límite" value={format(earliestDate, 'd MMM yyyy', { locale: es })} />

                  {/* Alert counter */}
                  <div className="pt-2 border-t space-y-1">
                    {errorAlerts.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{errorAlerts.length} error{errorAlerts.length > 1 ? 'es' : ''}</span>
                      </div>
                    )}
                    {warningAlerts.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{warningAlerts.length} advertencia{warningAlerts.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {alerts.length === 0 && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Sin alertas</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              {status === 'review' && (
                <Button size="lg" className="w-full" onClick={handleSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Guardar y enviar flete
                </Button>
              )}

              {status === 'sent' && (
                <Button size="lg" className="w-full" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Esperando respuesta...
                </Button>
              )}

              {status === 'accepted' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-success">Flete confirmado</p>
                      <p className="text-xs text-muted-foreground">{currentTruck.driver} aceptó el flete</p>
                    </div>
                  </div>
                  <Button size="lg" className="w-full" variant="outline" onClick={onGoHome}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Volver a gestión de pedidos
                  </Button>
                </div>
              )}

              {status === 'rejected' && (
                <div className="space-y-2">
                  <Button size="lg" className="w-full" onClick={handleQuickReassign}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reasignar al siguiente recomendado
                  </Button>
                  <Button size="lg" className="w-full" variant="outline" onClick={() => onReassignTruck(currentTruck)}>
                    Seleccionar otro camión
                  </Button>
                </div>
              )}

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

function InfoBlock({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-semibold', highlight && 'text-destructive')}>{value}</p>
      {sub && <p className={cn('text-xs', highlight ? 'text-destructive' : 'text-muted-foreground')}>{sub}</p>}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, alert }: {
  icon: typeof Package; label: string; value: string; alert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <span className={cn('font-semibold', alert && 'text-destructive')}>{value}</span>
    </div>
  );
}

function AlertCard({ alert, onAction }: { alert: FreightAlert; onAction: () => void }) {
  const styles = {
    error: 'bg-destructive/5 border-destructive/30',
    warning: 'bg-warning/5 border-warning/30',
    info: 'bg-muted/50 border-border',
  };
  const iconColors = {
    error: 'text-destructive',
    warning: 'text-warning',
    info: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('flex items-start gap-3 p-3 rounded-lg border', styles[alert.severity])}
    >
      <AlertTriangle className={cn('h-4 w-4 shrink-0 mt-0.5', iconColors[alert.severity])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{alert.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
      </div>
      {alert.actionLabel && (
        <Button size="sm" variant="outline" className="shrink-0 text-xs h-7" onClick={onAction}>
          {alert.actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
