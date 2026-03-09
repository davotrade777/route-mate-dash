import { motion, AnimatePresence } from 'framer-motion';
import { Order, CompatibilityResult } from '@/types/order';
import { CompatibilityWarning } from './CompatibilityWarning';
import { MaterialTypeTag } from './MaterialTag';
import { Package, MapPin, Calendar, Weight, X } from 'lucide-react';
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
}: SelectionSummaryProps) {
  if (selectedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          Selecciona un pedido para empezar a agrupar
        </p>
      </div>
    );
  }

  const totalWeight = selectedOrders.reduce((sum, o) => sum + o.weight, 0);
  const totalVolume = selectedOrders.reduce((sum, o) => sum + (o.volume || 0), 0);

  const selectedOrderIds = new Set(selectedOrders.map(o => o.id));
  const allWarnings = Array.from(compatibilityMap.entries())
    .filter(([orderId]) => selectedOrderIds.has(orderId))
    .flatMap(([, c]) => c.warnings)
    .filter((w, i, arr) => arr.indexOf(w) === i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {selectedOrders.length} pedidos seleccionados
        </span>
        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClearSelection}>
          Limpiar
        </Button>
      </div>

      {/* Selected orders */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {selectedOrders.map((order) => {
            const isPrimary = order.id === primaryOrder?.id;
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex items-center justify-between p-3 rounded-lg border bg-card text-sm ${
                  isPrimary ? 'border-primary/30' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-foreground">{order.id}</span>
                    {isPrimary && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{order.destination}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  onClick={() => onRemoveOrder(order.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Warnings */}
      {allWarnings.length > 0 && <CompatibilityWarning warnings={allWarnings} />}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Peso total</p>
          <p className="font-semibold text-foreground">{totalWeight.toLocaleString()} kg</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Volumen total</p>
          <p className="font-semibold text-foreground">{totalVolume.toFixed(1)} m³</p>
        </div>
      </div>
    </div>
  );
}
