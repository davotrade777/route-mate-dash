import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Box, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Order } from '@/types/order';
import { OrderGroup, findCompatibleGroups } from '@/utils/groupingEngine';

interface AutoGroupingSuggestionsProps {
  orders: Order[];
  onSelectGroup: (orderIds: string[]) => void;
  hasSelection: boolean;
}

export function AutoGroupingSuggestions({
  orders,
  onSelectGroup,
  hasSelection,
}: AutoGroupingSuggestionsProps) {
  const suggestedGroups = useMemo(() => {
    return findCompatibleGroups(orders, 2, 3).slice(0, 3);
  }, [orders]);

  if (suggestedGroups.length === 0 || hasSelection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Agrupación automática</h3>
        <span className="text-sm text-muted-foreground">
          — {suggestedGroups.length} {suggestedGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {suggestedGroups.map((group, index) => (
            <SuggestionCard
              key={group.id}
              group={group}
              index={index}
              onSelect={() => onSelectGroup(group.orders.map(o => o.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface SuggestionCardProps {
  group: OrderGroup;
  index: number;
  onSelect: () => void;
}

function SuggestionCard({ group, index, onSelect }: SuggestionCardProps) {
  const dateLabel =
    group.dateRange.start.getTime() === group.dateRange.end.getTime()
      ? format(group.dateRange.start, 'd MMM', { locale: es })
      : `${format(group.dateRange.start, 'd MMM', { locale: es })} - ${format(group.dateRange.end, 'd MMM', { locale: es })}`;

  const totalVolume = group.orders.reduce((sum, o) => sum + (o.volume || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
      exit={{ opacity: 0 }}
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {group.orders.length} Pedidos
        </span>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full border',
            group.compatibilityScore >= 90
              ? 'border-success/40 text-success'
              : 'border-warning/40 text-warning'
          )}
        >
          {group.compatibilityScore}% Compatibilidad
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{group.destination}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Box className="h-3.5 w-3.5" />
          <span>{totalVolume.toFixed(1)} m³</span>
        </div>
      </div>

      {/* CTA */}
      <Button variant="outline" size="sm" className="w-full" onClick={onSelect}>
        Seleccionar grupo
      </Button>
    </motion.div>
  );
}
