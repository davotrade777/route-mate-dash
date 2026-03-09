import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Truck } from 'lucide-react';
import { Order } from '@/types/order';
import { mockTrucks } from '@/data/mockTrucks';
import { sortTrucksByCompatibility } from '@/utils/truckCompatibilityCalculator';
import { TruckCard } from './TruckCard';
import { TransportSidebar } from './TransportSidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TruckAssignmentProps {
  groupedOrders: Order[];
  onBack: () => void;
  onConfirm: (truckId: string) => void;
}

export function TruckAssignment({ groupedOrders, onBack, onConfirm }: TruckAssignmentProps) {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  const totalWeight = useMemo(() =>
    groupedOrders.reduce((sum, order) => sum + order.weight, 0),
    [groupedOrders]
  );

  const earliestDate = useMemo(() =>
    groupedOrders.reduce((earliest, order) =>
      order.deliveryDate < earliest ? order.deliveryDate : earliest,
      groupedOrders[0]?.deliveryDate || new Date()
    ),
    [groupedOrders]
  );

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

  const selectedTruckData = selectedTruck
    ? mockTrucks.find(t => t.id === selectedTruck) || null
    : null;

  const selectedCompatibility = selectedTruck
    ? sortedTrucks.find(t => t.truck.id === selectedTruck)?.compatibility || null
    : null;

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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Simple header */}
        <div className="p-6 pb-0">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2 mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-extrabold text-foreground">Selecciona un camión</h1>
        </div>

        {/* Subheader with filter */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Camiones disponibles</h2>
            <span className="text-sm text-muted-foreground">
              ({filteredTrucks.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="filter-switch" className="text-sm text-muted-foreground cursor-pointer">
              Mostrar solo compatibles ({recommendedCount})
            </Label>
            <Switch
              id="filter-switch"
              checked={showOnlyRecommended}
              onCheckedChange={setShowOnlyRecommended}
            />
          </div>
        </div>

        {/* Trucks grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay camiones que cumplan todos los criterios.</p>
              <Button
                variant="link"
                onClick={() => setShowOnlyRecommended(false)}
                className="mt-2"
              >
                Ver todos los camiones
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar pinned to edge */}
      <TransportSidebar
        selectedTruck={selectedTruckData}
        compatibility={selectedCompatibility}
        totalWeight={totalWeight}
        onConfirm={handleConfirmAssignment}
      />
    </div>
  );
}
