import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Weight, User, Package, Check, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Order, CompatibilityResult } from '@/types/order';
import { MaterialTag } from './MaterialTag';
import { CompatibilityIndicator, CompatibilityBar } from './CompatibilityBadge';
import { CompatibilityWarning } from './CompatibilityWarning';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                ID Pedido
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Fecha Entrega
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Destino
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                Peso
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Cliente
              </div>
            </TableHead>
            <TableHead className="font-semibold">Materiales</TableHead>
            {primarySelection && (
              <TableHead className="font-semibold text-center w-32">
                <div className="flex items-center justify-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  Compatibilidad
                </div>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {sortedOrders.map((order, index) => {
              const isSelected = selectedOrders.has(order.id);
              const isPrimary = order.id === primarySelection;
              const compatibility = compatibilityMap.get(order.id);
              const hasWarnings = compatibility && compatibility.warnings.length > 0;

              return (
                <motion.tr
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
                  className={cn(
                    'cursor-pointer border-b transition-colors',
                    isSelected && 'bg-table-selected',
                    isPrimary && 'bg-primary/10 border-l-4 border-l-primary',
                    !isSelected && 'hover:bg-table-hover'
                  )}
                  onClick={() => onToggleOrder(order.id)}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleOrder(order.id)}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(isPrimary && 'border-primary')}
                    />
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'font-mono font-medium',
                      isPrimary && 'text-primary'
                    )}>
                      {order.id}
                    </span>
                    {isPrimary && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded"
                      >
                        Principal
                      </motion.span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {format(order.deliveryDate, "d MMM yyyy", { locale: es })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{order.destination}</span>
                      {compatibility?.destinationMatch && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="w-5 h-5 rounded-full bg-match-excellent/20 flex items-center justify-center">
                                <Check className="h-3 w-3 text-match-excellent" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Mismo destino</TooltipContent>
                          </Tooltip>
                        </motion.div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{order.weight.toLocaleString()} kg</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{order.client}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
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
                  </TableCell>
                  {primarySelection && (
                    <TableCell className="text-center">
                      {isPrimary ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : compatibility ? (
                        <div className="flex flex-col items-center gap-1">
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
                                  className="text-xs text-warning cursor-help flex items-center gap-1"
                                >
                                  ⚠️ Ver alertas
                                </motion.span>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs p-0">
                                <CompatibilityWarning warnings={compatibility.warnings} className="border-0" />
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
