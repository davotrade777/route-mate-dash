import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, MapPin, Calendar, Weight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Order } from '@/types/order';
import { Truck as TruckType } from '@/types/truck';
import { mockTrucks } from '@/data/mockTrucks';
import { sortTrucksByCompatibility } from '@/utils/truckCompatibilityCalculator';
import { TruckCard } from './TruckCard';
import { MaterialTypeTag } from './MaterialTag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TruckAssignmentProps {
  groupedOrders: Order[];
  onBack: () => void;
  onConfirm: (truckId: string) => void;
}

export function TruckAssignment({ groupedOrders, onBack, onConfirm }: TruckAssignmentProps) {
  const navigate = useNavigate();
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  // Calculate grouped order stats
  const totalWeight = useMemo(() => 
    groupedOrders.reduce((sum, order) => sum + order.weight, 0),
    [groupedOrders]
  );

  const destinations = useMemo(() => 
    [...new Set(groupedOrders.map(o => o.destination))],
    [groupedOrders]
  );

  const earliestDate = useMemo(() => 
    groupedOrders.reduce((earliest, order) => 
      order.deliveryDate < earliest ? order.deliveryDate : earliest,
      groupedOrders[0]?.deliveryDate || new Date()
    ),
    [groupedOrders]
  );

  const allMaterialTypes = useMemo(() => {
    const types = new Set<string>();
    groupedOrders.forEach(order => {
      order.materials.forEach(m => types.add(m.type));
    });
    return Array.from(types);
  }, [groupedOrders]);

  // Sort trucks by compatibility
  const sortedTrucks = useMemo(() => 
    sortTrucksByCompatibility(mockTrucks, groupedOrders, earliestDate),
    [groupedOrders, earliestDate]
  );

  const filteredTrucks = useMemo(() => 
    showOnlyRecommended 
      ? sortedTrucks.filter(t => t.compatibility.isRecommended)
      : sortedTrucks,
    [sortedTrucks, showOnlyRecommended]
  );

  const recommendedCount = sortedTrucks.filter(t => t.compatibility.isRecommended).length;

  const handleSelectTruck = (truckId: string) => {
    setSelectedTruck(prev => prev === truckId ? null : truckId);
  };

  const handleConfirmAssignment = () => {
    if (!selectedTruck) {
      toast.error('Selecciona un camión para continuar');
      return;
    }

    const truck = mockTrucks.find(t => t.id === selectedTruck);
    const compatibility = sortedTrucks.find(t => t.truck.id === selectedTruck)?.compatibility;

    if (compatibility && !compatibility.isRecommended) {
      toast.warning(`Camión ${selectedTruck} asignado`, {
        description: 'Has seleccionado un camión con advertencias. La decisión es tuya.',
        icon: <AlertTriangle className="h-4 w-4" />,
      });
    } else {
      toast.success(`Camión ${selectedTruck} asignado correctamente`, {
        description: `Conductor: ${truck?.driver}`,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    }

    onConfirm(selectedTruck);
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
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Asignación de Camión</h1>
                <p className="text-sm text-muted-foreground">
                  Selecciona el camión para {groupedOrders.length} pedidos agrupados
                </p>
              </div>
            </div>

            {/* Filter toggle */}
            <motion.div 
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all duration-300',
                showOnlyRecommended 
                  ? 'bg-match-compatible/10 border-match-compatible/30 shadow-lg shadow-match-compatible/10' 
                  : 'bg-muted/50 border-transparent'
              )}
              animate={{ scale: showOnlyRecommended ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <AnimatePresence mode="wait">
                {showOnlyRecommended ? (
                  <motion.div
                    key="sparkles"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                  >
                    <Sparkles className="h-4 w-4 text-match-compatible" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="truck"
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -180, opacity: 0 }}
                  >
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Label 
                htmlFor="recommended-switch" 
                className={cn(
                  'text-sm cursor-pointer select-none transition-colors',
                  showOnlyRecommended ? 'text-match-compatible font-medium' : ''
                )}
              >
                Solo recomendados ({recommendedCount})
              </Label>
              <Switch
                id="recommended-switch"
                checked={showOnlyRecommended}
                onCheckedChange={setShowOnlyRecommended}
              />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Trucks grid */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Camiones disponibles</h2>
                <span className="text-sm text-muted-foreground">
                  ({filteredTrucks.length} camiones)
                </span>
              </div>
              {recommendedCount > 0 && (
                <p className="text-sm text-match-compatible flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {recommendedCount} camiones recomendados
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTrucks.map(({ truck, compatibility }) => (
                  <TruckCard
                    key={truck.id}
                    truck={truck}
                    compatibility={compatibility}
                    isSelected={selectedTruck === truck.id}
                    onSelect={handleSelectTruck}
                    totalWeight={totalWeight}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredTrucks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay camiones que cumplan todos los criterios.</p>
                <Button 
                  variant="link" 
                  onClick={() => setShowOnlyRecommended(false)}
                  className="mt-2"
                >
                  Ver todos los camiones
                </Button>
              </motion.div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Resumen de pedidos agrupados
              </h2>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {groupedOrders.length} pedidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order IDs */}
                  <div className="flex flex-wrap gap-1.5">
                    {groupedOrders.map(order => (
                      <span 
                        key={order.id}
                        className="px-2 py-0.5 bg-muted rounded text-xs font-mono"
                      >
                        {order.id}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Weight className="h-4 w-4" />
                        Peso total
                      </div>
                      <span className="font-semibold">{totalWeight.toLocaleString()} kg</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Destinos
                      </div>
                      <span className="font-semibold">{destinations.length}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Fecha límite
                      </div>
                      <span className="font-semibold">
                        {format(earliestDate, 'd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>

                  {/* Destinations list */}
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Destinos:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {destinations.map(dest => (
                        <span 
                          key={dest}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                        >
                          <MapPin className="h-3 w-3" />
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Materiales a transportar:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allMaterialTypes.map(type => (
                        <MaterialTypeTag key={type} type={type as any} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confirm button */}
              <Button
                size="lg"
                className="w-full"
                disabled={!selectedTruck}
                onClick={handleConfirmAssignment}
              >
                {selectedTruck ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar asignación
                  </>
                ) : (
                  'Selecciona un camión'
                )}
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
