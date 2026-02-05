import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Weight, User, Package, Check, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Order, CompatibilityResult } from '@/types/order';
import { MaterialTag } from './MaterialTag';
import { CompatibilityIndicator } from './CompatibilityBadge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OrdersTableProps {
  orders: Order[];
  selectedOrders: Set<string>;
  compatibilityMap: Map<string, CompatibilityResult>;
  onToggleOrder: (orderId: string) => void;
  primarySelection: string | null;
  sortByCompatibility: boolean;
}

export function OrdersTable({
  orders,
  selectedOrders,
  compatibilityMap,
  onToggleOrder,
  primarySelection,
  sortByCompatibility,
}: OrdersTableProps) {
  const sortedOrders = useMemo(() => {
    if (!sortByCompatibility || !primarySelection) return orders;

    return [...orders].sort((a, b) => {
      if (a.id === primarySelection) return -1;
      if (b.id === primarySelection) return 1;

      const compA = compatibilityMap.get(a.id);
      const compB = compatibilityMap.get(b.id);

      if (!compA && !compB) return 0;
      if (!compA) return 1;
      if (!compB) return -1;

      return compB.score - compA.score;
    });
  }, [orders, sortByCompatibility, primarySelection, compatibilityMap]);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {sortedOrders.map((order, index) => {
          const isSelected = selectedOrders.has(order.id);
          const isPrimary = order.id === primarySelection;
          const compatibility = compatibilityMap.get(order.id);
          const hasWarnings = compatibility && compatibility.warnings.length > 0;

          return (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: sortByCompatibility ? index * 0.03 : 0
                }
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onToggleOrder(order.id)}
              className={cn(
                'group relative rounded-xl border bg-card p-4 cursor-pointer transition-all duration-200',
                isSelected && 'bg-table-selected border-primary/30 shadow-md',
                isPrimary && 'ring-2 ring-primary border-primary shadow-lg',
                !isSelected && 'hover:bg-table-hover hover:border-border/80 hover:shadow-sm'
              )}
            >
              {/* Primary badge */}
              {isPrimary && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full"
                >
                  Pedido principal
                </motion.div>
              )}

              <div className="flex gap-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleOrder(order.id)}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      'h-5 w-5',
                      isPrimary && 'border-primary data-[state=checked]:bg-primary'
                    )}
                  />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn(
                        'font-mono text-base font-semibold',
                        isPrimary ? 'text-primary' : 'text-foreground'
                      )}>
                        {order.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[180px]">{order.client}</span>
                      </div>
                    </div>
                    <span className={cn(
                      'flex-shrink-0 font-semibold tabular-nums',
                      isPrimary ? 'text-primary' : 'text-foreground'
                    )}>
                      {order.weight.toLocaleString()} kg
                    </span>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-full',
                        compatibility?.destinationMatch 
                          ? 'bg-match-excellent/20' 
                          : 'bg-muted'
                      )}>
                        <MapPin className={cn(
                          'h-3.5 w-3.5',
                          compatibility?.destinationMatch 
                            ? 'text-match-excellent' 
                            : 'text-muted-foreground'
                        )} />
                      </div>
                      <span className="font-medium">{order.destination}</span>
                      {compatibility?.destinationMatch && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Check className="h-3.5 w-3.5 text-match-excellent" />
                          </TooltipTrigger>
                          <TooltipContent>Mismo destino que el pedido principal</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(order.deliveryDate, "EEEE d MMM", { locale: es })}</span>
                    </div>
                  </div>

                  {/* Materials row */}
                  <div className="flex flex-wrap gap-1.5">
                    {order.materials.map((material) => (
                      <MaterialTag
                        key={material.id}
                        type={material.type}
                        name={material.name}
                        hasWarning={
                          hasWarnings &&
                          compatibility?.warnings.some(w =>
                            w.toLowerCase().includes(material.type)
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Compatibility indicator */}
                {primarySelection && !isPrimary && compatibility && (
                  <div className="flex-shrink-0 flex flex-col items-center justify-center pl-2 border-l border-border/50">
                    <CompatibilityIndicator
                      score={compatibility.score}
                      destinationMatch={compatibility.destinationMatch}
                      dateProximity={compatibility.dateProximity}
                      materialCompatibility={compatibility.materialCompatibility}
                    />
                    {hasWarnings && (
                      <Tooltip>
                        <TooltipTrigger>
                          <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-warning cursor-help mt-1"
                          >
                            ⚠️ Alertas
                          </motion.span>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="space-y-1 text-sm">
                            {compatibility.warnings.map((w, i) => (
                              <p key={i}>{w}</p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
