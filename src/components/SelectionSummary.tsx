import { motion, AnimatePresence } from 'framer-motion';
import { Order, CompatibilityResult } from '@/types/order';
import { CompatibilityBadge } from './CompatibilityBadge';
import { CompatibilityWarning } from './CompatibilityWarning';
import { MaterialTypeTag } from './MaterialTag';
import { Package, Weight, MapPin, Calendar, X, CheckCircle2 } from 'lucide-react';
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-dashed bg-muted/30 p-8 text-center"
      >
        <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">
          Selecciona un pedido para comenzar a agrupar
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Los pedidos compatibles se resaltarán automáticamente
        </p>
      </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
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
        <AnimatePresence mode="popLayout">
          {selectedOrders.map((order, index) => {
            const isPrimary = order.id === primaryOrder?.id;
            const compatibility = compatibilityMap.get(order.id);

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className={`flex items-center justify-between p-3 rounded-xl border bg-card ${
                  isPrimary ? 'border-primary bg-primary/5 shadow-sm' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{order.id}</span>
                      {isPrimary && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded"
                        >
                          Principal
                        </motion.span>
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
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onRemoveOrder(order.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Warnings */}
      <AnimatePresence>
        {allWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CompatibilityWarning warnings={allWarnings} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary stats */}
      <motion.div 
        layout
        className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50 border"
      >
        <div>
          <p className="text-sm text-muted-foreground">Peso total</p>
          <motion.p 
            key={totalWeight}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold"
          >
            {totalWeight.toLocaleString()} kg
          </motion.p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Tipos de material</p>
          <div className="flex flex-wrap gap-1">
            {allMaterialTypes.map(type => (
              <MaterialTypeTag key={type} type={type} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Confirm button */}
      <motion.div layout>
        <Button 
          className="w-full group" 
          size="lg"
          onClick={onConfirmGrouping}
          disabled={selectedOrders.length < 2}
        >
          <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Confirmar agrupación
        </Button>
      </motion.div>
    </motion.div>
  );
}
