import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, Truck, MapPin, Clock, CheckCircle2, XCircle, Send, RotateCcw, ChevronRight, AlertTriangle, Sparkles, Weight, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { mockTrucks } from '@/data/mockTrucks';
import { mockOrders } from '@/data/mockOrders';
import { sortTrucksByCompatibility } from '@/utils/truckCompatibilityCalculator';
import { cn } from '@/lib/utils';

type FreightStatus = 'sent' | 'accepted' | 'rejected';

interface AssignedFreight {
  id: string;
  truck: string;
  driver: string;
  destination: string;
  orders: number;
  totalWeight: number;
  status: FreightStatus;
  sentAt: string;
  respondedAt?: string;
  orderIds: string[]; // linked order IDs for compatibility calc
  rejectedDrivers: string[]; // drivers who already rejected
}

const mockFreights: AssignedFreight[] = [
  { id: 'FLT-001', truck: 'Mercedes-Benz Actros 1845', driver: 'Carlos García', destination: 'Madrid Centro', orders: 3, totalWeight: 4500, status: 'accepted', sentAt: 'Hace 3h', respondedAt: 'Hace 2h', orderIds: ['PED-1001', 'PED-1002', 'PED-1003'], rejectedDrivers: [] },
  { id: 'FLT-002', truck: 'Volvo FH16', driver: 'María López', destination: 'Valencia Industrial', orders: 2, totalWeight: 3200, status: 'accepted', sentAt: 'Hace 5h', respondedAt: 'Hace 4h', orderIds: ['PED-1004', 'PED-1005'], rejectedDrivers: [] },
  { id: 'FLT-003', truck: 'Scania R500', driver: 'Juan Martínez', destination: 'Barcelona Puerto', orders: 4, totalWeight: 7800, status: 'rejected', sentAt: 'Hace 1h', respondedAt: 'Hace 30 min', orderIds: ['PED-1006', 'PED-1007', 'PED-1008', 'PED-1009'], rejectedDrivers: ['Juan Martínez'] },
  { id: 'FLT-004', truck: 'MAN TGX 18.500', driver: 'Ana Rodríguez', destination: 'Sevilla Logística', orders: 2, totalWeight: 2100, status: 'sent', sentAt: 'Hace 20 min', orderIds: ['PED-1010', 'PED-1011'], rejectedDrivers: [] },
  { id: 'FLT-005', truck: 'DAF XF 480', driver: 'Pedro Sánchez', destination: 'Bilbao Puerto', orders: 3, totalWeight: 5600, status: 'sent', sentAt: 'Hace 10 min', orderIds: ['PED-1012', 'PED-1013', 'PED-1014'], rejectedDrivers: [] },
  { id: 'FLT-006', truck: 'Iveco S-Way 490', driver: 'Roberto Díaz', destination: 'Zona Remota Industrial', orders: 5, totalWeight: 50000, status: 'rejected', sentAt: 'Hace 2h', respondedAt: 'Hace 1h', orderIds: ['PED-1015', 'PED-1016', 'PED-1017', 'PED-1018', 'PED-1019'], rejectedDrivers: ['Carlos García', 'María López', 'Juan Martínez', 'Ana Rodríguez', 'Pedro Sánchez', 'Laura Fernández', 'Miguel Torres', 'Carmen Ruiz', 'Roberto Díaz'] },
];

const statusConfig: Record<FreightStatus, { label: string; icon: typeof CheckCircle2; color: string; badgeClass: string }> = {
  sent: { label: 'Esperando respuesta', icon: Send, color: 'text-[hsl(var(--info))]', badgeClass: 'bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] border-[hsl(var(--info))]/30' },
  accepted: { label: 'Aceptado', icon: CheckCircle2, color: 'text-[hsl(var(--success))]', badgeClass: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30' },
  rejected: { label: 'Rechazado', icon: XCircle, color: 'text-destructive', badgeClass: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const MIN_COMPATIBLE_SCORE = 70;

export default function AssignedFreightsPage() {
  const [freights, setFreights] = useState(mockFreights);
  const [filter, setFilter] = useState<FreightStatus | 'all'>('all');
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedFreight, setSelectedFreight] = useState<AssignedFreight | null>(null);
  const [selectedNewTruck, setSelectedNewTruck] = useState<string | null>(null);

  const filtered = filter === 'all' ? freights : freights.filter(f => f.status === filter);

  const counts = {
    all: freights.length,
    sent: freights.filter(f => f.status === 'sent').length,
    accepted: freights.filter(f => f.status === 'accepted').length,
    rejected: freights.filter(f => f.status === 'rejected').length,
  };

  // Get compatible trucks for the selected freight
  const compatibleTrucks = useMemo(() => {
    if (!selectedFreight) return [];

    // Get related orders from mockOrders
    const relatedOrders = mockOrders.slice(0, selectedFreight.orders);
    const targetDate = new Date();

    const ranked = sortTrucksByCompatibility(mockTrucks, relatedOrders, targetDate);

    // Filter out trucks whose drivers already rejected this freight
    return ranked.filter(
      t => !selectedFreight.rejectedDrivers.includes(t.truck.driver) && t.truck.status !== 'maintenance'
    );
  }, [selectedFreight]);

  const recommendedTrucks = compatibleTrucks.filter(t => t.compatibility.overallScore >= MIN_COMPATIBLE_SCORE);
  const hasCompatibleOptions = recommendedTrucks.length > 0;

  const handleOpenReassign = (freight: AssignedFreight) => {
    setSelectedFreight(freight);
    setSelectedNewTruck(null);
    setReassignDialogOpen(true);
  };

  const handleConfirmReassign = () => {
    if (!selectedFreight || !selectedNewTruck) return;

    const newTruck = mockTrucks.find(t => t.id === selectedNewTruck);
    if (!newTruck) return;

    setFreights(prev =>
      prev.map(f =>
        f.id === selectedFreight.id
          ? {
              ...f,
              status: 'sent' as FreightStatus,
              driver: newTruck.driver,
              truck: `${newTruck.brand} ${newTruck.model}`,
              respondedAt: undefined,
              sentAt: 'Ahora',
              rejectedDrivers: [...f.rejectedDrivers, f.driver],
            }
          : f
      )
    );

    toast.success(`Flete reasignado a ${newTruck.driver}`, {
      description: `${newTruck.brand} ${newTruck.model} — esperando respuesta`,
    });

    setReassignDialogOpen(false);
    setSelectedFreight(null);
    setSelectedNewTruck(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[hsl(var(--success))]';
    if (score >= 60) return 'text-[hsl(var(--warning))]';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '[&>div]:bg-[hsl(var(--success))]';
    if (score >= 60) return '[&>div]:bg-[hsl(var(--warning))]';
    return '[&>div]:bg-destructive';
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          Fletes Asignados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Estado de todos los fletes enviados a transportistas</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'sent', 'accepted', 'rejected'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="gap-1.5"
          >
            {f === 'all' ? 'Todos' : statusConfig[f].label}
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
              {counts[f]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Freight cards */}
      <div className="space-y-3">
        {filtered.map((freight, i) => {
          const config = statusConfig[freight.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={freight.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${freight.status === 'accepted' ? 'bg-[hsl(var(--success))]/10' : freight.status === 'rejected' ? 'bg-destructive/10' : 'bg-[hsl(var(--info))]/10'}`}>
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{freight.id}</span>
                          <Badge className={`text-[10px] border ${config.badgeClass}`}>
                            {config.label}
                          </Badge>
                          {freight.rejectedDrivers.length > 0 && freight.status === 'rejected' && (
                            <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                              {freight.rejectedDrivers.length + 1} intentos
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-3 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Truck className="h-3.5 w-3.5" />
                            <span className="truncate">{freight.driver}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{freight.destination}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>{freight.orders} pedidos · {(freight.totalWeight / 1000).toFixed(1)}t</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{freight.sentAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {freight.status === 'rejected' && (
                        <Button size="sm" className="gap-1.5" onClick={() => handleOpenReassign(freight)}>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reasignar
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Reassignment Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Reasignar {selectedFreight?.id}
            </DialogTitle>
            <DialogDescription>
              {selectedFreight?.destination} · {selectedFreight?.orders} pedidos · {((selectedFreight?.totalWeight || 0) / 1000).toFixed(1)}t
            </DialogDescription>
          </DialogHeader>

          {/* Rejected drivers info */}
          {selectedFreight && selectedFreight.rejectedDrivers.length > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs font-medium text-destructive flex items-center gap-1.5 mb-1">
                <XCircle className="h-3.5 w-3.5" />
                Transportistas que rechazaron
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedFreight.rejectedDrivers.map(d => (
                  <span key={d} className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {hasCompatibleOptions ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--success))]" />
                  <p className="text-sm font-medium">
                    {recommendedTrucks.length} transportista{recommendedTrucks.length !== 1 ? 's' : ''} compatible{recommendedTrucks.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {compatibleTrucks.map(({ truck, compatibility }) => {
                  const isRecommended = compatibility.overallScore >= MIN_COMPATIBLE_SCORE;
                  const isSelected = selectedNewTruck === truck.id;

                  return (
                    <motion.div
                      key={truck.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={() => setSelectedNewTruck(isSelected ? null : truck.id)}
                        className={cn(
                          'w-full text-left rounded-lg border p-3 transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : isRecommended
                            ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                            : 'border-border/50 opacity-60 hover:opacity-80'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{truck.driver}</span>
                            {isRecommended && (
                              <Badge className="text-[10px] bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 border">
                                Recomendado
                              </Badge>
                            )}
                          </div>
                          <span className={cn('text-sm font-bold', getScoreColor(compatibility.overallScore))}>
                            {compatibility.overallScore}%
                          </span>
                        </div>

                        <Progress
                          value={compatibility.overallScore}
                          className={cn('h-1.5 mb-2', getProgressColor(compatibility.overallScore))}
                        />

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {truck.brand} {truck.model}
                          </span>
                          <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {(truck.maxWeight / 1000).toFixed(0)}t cap.
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {truck.currentLocation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {truck.allowedMaterials.length} materiales
                          </span>
                        </div>

                        {compatibility.warnings.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {compatibility.warnings.map((w, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
                                {w}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </>
            ) : (
              /* No compatible trucks — suggest modifying the order */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Sin transportistas compatibles</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                    Ningún transportista disponible cumple los requisitos de este flete. Considera modificar el pedido para encontrar opciones.
                  </p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-4 text-left space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[hsl(var(--warning))]" />
                    Sugerencias para encontrar transportista
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1.5 ml-5 list-disc">
                    <li>Reducir el peso total dividiendo en múltiples envíos</li>
                    <li>Cambiar el tipo de materiales a uno más común</li>
                    <li>Ampliar la fecha de entrega para más disponibilidad</li>
                    <li>Agrupar con destinos donde hay camiones cercanos</li>
                  </ul>
                </div>
                <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
                  Modificar pedido
                </Button>
              </motion.div>
            )}
          </div>

          {/* Footer with confirm */}
          {hasCompatibleOptions && (
            <div className="pt-3 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                La decisión final es del planificador
              </p>
              <Button
                disabled={!selectedNewTruck}
                onClick={handleConfirmReassign}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmar reasignación
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
