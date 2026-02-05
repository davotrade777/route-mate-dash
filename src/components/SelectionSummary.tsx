import { Order, CompatibilityResult } from '@/types/order';
import { CompatibilityBadge } from './CompatibilityBadge';
import { CompatibilityWarning } from './CompatibilityWarning';
import { MaterialTypeTag } from './MaterialTag';
import { Package, Weight, MapPin, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SelectionSummaryProps {
  selectedOrders: Order[];
  primaryOrder: Order | null;
  compatibilityMap: Map<string, CompatibilityResult>;
  onRemoveOrder: (orderId: string) => void;
  onClearSelection: () => void;
  onConfirmGrouping: () => void;
}

export function SelectionSummary({
  selectedOrders,
  primaryOrder,
  compatibilityMap,
  onRemoveOrder,
  onClearSelection,
  onConfirmGrouping,
}: SelectionSummaryProps) {
  if (selectedOrders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          Selecciona un pedido para comenzar a agrupar
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Los pedidos compatibles se resaltarán automáticamente
        </p>
      </div>
    );
  }

  const totalWeight = selectedOrders.reduce((sum, o) => sum + o.weight, 0);
  const allWarnings = Array.from(compatibilityMap.values())
    .flatMap(c => c.warnings)
    .filter((w, i, arr) => arr.indexOf(w) === i);

  const allMaterialTypes = [...new Set(
    selectedOrders.flatMap(o => o.materials.map(m => m.type))
  )];

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          Agrupación ({selectedOrders.length} pedidos)
        </h3>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Limpiar selección
        </Button>
      </div>

      {/* Selected orders list */}
      <div className="space-y-2">
        {selectedOrders.map((order) => {
          const isPrimary = order.id === primaryOrder?.id;
          const compatibility = compatibilityMap.get(order.id);

          return (
            <div
              key={order.id}
              className={`flex items-center justify-between p-3 rounded-lg border bg-card ${
                isPrimary ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{order.id}</span>
                    {isPrimary && (
                      <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(order.deliveryDate, "d MMM", { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      {order.weight.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isPrimary && compatibility && (
                  <CompatibilityBadge score={compatibility.score} size="sm" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemoveOrder(order.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {allWarnings.length > 0 && (
        <CompatibilityWarning warnings={allWarnings} />
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
        <div>
          <p className="text-sm text-muted-foreground">Peso total</p>
          <p className="text-xl font-bold">{totalWeight.toLocaleString()} kg</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Tipos de material</p>
          <div className="flex flex-wrap gap-1">
            {allMaterialTypes.map(type => (
              <MaterialTypeTag key={type} type={type} />
            ))}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <Button 
        className="w-full" 
        size="lg"
        onClick={onConfirmGrouping}
        disabled={selectedOrders.length < 2}
      >
        <Package className="h-4 w-4 mr-2" />
        Confirmar agrupación
      </Button>
    </div>
  );
}
