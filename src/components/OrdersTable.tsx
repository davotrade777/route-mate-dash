import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Order, CompatibilityResult } from '@/types/order';
import { MaterialTag } from './MaterialTag';
import { Checkbox } from '@/components/ui/checkbox';

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
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {sortedOrders.map((order, index) => (
          <OrderCard
            key={order.id}
            order={order}
            index={index}
            isSelected={selectedOrders.has(order.id)}
            isPrimary={order.id === primarySelection}
            sortByCompatibility={sortByCompatibility}
            onToggleOrder={onToggleOrder}
            compatibility={compatibilityMap.get(order.id)}
            hasPrimary={!!primarySelection}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  index: number;
  isSelected: boolean;
  isPrimary: boolean;
  sortByCompatibility: boolean;
  onToggleOrder: (id: string) => void;
  compatibility?: CompatibilityResult;
  hasPrimary: boolean;
}

function ScoreCircle({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'hsl(var(--match-excellent))';
    if (score >= 60) return 'hsl(var(--match-good))';
    if (score >= 40) return 'hsl(var(--match-moderate))';
    return 'hsl(var(--match-poor))';
  };

  const getTextClass = () => {
    if (score >= 80) return 'text-match-excellent';
    if (score >= 60) return 'text-match-good';
    if (score >= 40) return 'text-match-moderate';
    return 'text-match-poor';
  };

  const circumference = 2 * Math.PI * 18;

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
        <motion.circle
          cx="22" cy="22" r="18" fill="none"
          stroke={getColor()}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${(score / 100) * circumference} ${circumference}` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className={cn('text-xs font-bold', getTextClass())}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {score}%
        </motion.span>
      </div>
    </div>
  );
}

function OrderCard({ order, index, isSelected, isPrimary, sortByCompatibility, onToggleOrder, compatibility, hasPrimary }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: sortByCompatibility ? index * 0.02 : 0 },
      }}
      exit={{ opacity: 0, scale: 0.98 }}
      onClick={() => onToggleOrder(order.id)}
      className={cn(
        'rounded-lg border bg-card p-4 cursor-pointer transition-colors',
        isSelected && 'bg-table-selected border-primary/30',
        isPrimary && 'ring-1 ring-primary border-primary',
        !isSelected && 'hover:bg-table-hover'
      )}
    >
      {/* Row 1: Checkbox + ID + Client + Circle + Chevron */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleOrder(order.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 flex-shrink-0"
        />
        <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
        <span className="text-sm text-muted-foreground truncate">{order.client}</span>
        {isPrimary && (
          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded ml-1">
            Principal
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {!isPrimary && hasPrimary && compatibility && (
            <ScoreCircle score={compatibility.score} />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(prev => !prev);
            }}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Row 2: Labeled columns */}
      <div className="grid grid-cols-3 gap-4 mt-3 ml-7">
        <div>
          <p className="text-xs text-muted-foreground">Lugar de entrega</p>
          <p className="text-sm font-medium text-foreground">{order.destination}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Peso</p>
          <p className="text-sm font-medium text-foreground">{order.weight.toLocaleString()} kg</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Volumen</p>
          <p className="text-sm font-medium text-foreground">{order.volume?.toFixed(1) || '—'} m³</p>
        </div>
      </div>

      {/* Expanded: materials + date */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 ml-7 pt-3 border-t space-y-2">
              <div className="text-xs text-muted-foreground">
                Fecha de entrega: <span className="text-foreground font-medium">{format(order.deliveryDate, "EEEE d MMM", { locale: es })}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {order.materials.map((material) => (
                  <MaterialTag key={material.id} type={material.type} name={material.name} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}