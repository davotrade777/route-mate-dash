import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sparkles, MapPin, Calendar, Package, Check, AlertTriangle, ChevronRight, Zap } from 'lucide-react';
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
  hasSelection 
}: AutoGroupingSuggestionsProps) {
  const suggestedGroups = useMemo(() => {
    return findCompatibleGroups(orders, 2, 3).slice(0, 3); // Max 3 suggestions
  }, [orders]);

  if (suggestedGroups.length === 0 || hasSelection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-info/20">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Agrupación automática
          </h3>
          <p className="text-sm text-muted-foreground">
            Encontramos <span className="font-medium text-primary">{suggestedGroups.length} {suggestedGroups.length === 1 ? 'grupo' : 'grupos'}</span> de pedidos que puedes agrupar por su compatibilidad
          </p>
        </div>
      </div>

      {/* Suggestion cards */}
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
  const dateLabel = group.dateRange.start.getTime() === group.dateRange.end.getTime()
    ? format(group.dateRange.start, "d MMM", { locale: es })
    : `${format(group.dateRange.start, "d MMM", { locale: es })} - ${format(group.dateRange.end, "d MMM", { locale: es })}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { delay: index * 0.1 }
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-4',
        'hover:shadow-lg hover:border-primary/30 transition-all duration-300',
        group.compatibilityScore >= 90 
          ? 'border-match-excellent/30 bg-gradient-to-br from-match-excellent/5 to-transparent'
          : 'border-match-good/30 bg-gradient-to-br from-match-good/5 to-transparent'
      )}
    >
      {/* Compatibility score badge */}
      <div className={cn(
        'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold',
        group.compatibilityScore >= 90 
          ? 'bg-match-excellent/20 text-match-excellent'
          : 'bg-match-good/20 text-match-good'
      )}>
        {group.compatibilityScore}% match
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Order count */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {group.orders.slice(0, 3).map((order, i) => (
              <div 
                key={order.id}
                className="w-6 h-6 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center"
                style={{ zIndex: 3 - i }}
              >
                <Package className="w-3 h-3 text-primary" />
              </div>
            ))}
            {group.orders.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                +{group.orders.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm font-medium">
            {group.orders.length} pedidos
          </span>
        </div>

        {/* Criteria */}
        <div className="space-y-1.5">
          <CriteriaBadge 
            icon={MapPin} 
            label={group.destination}
            active={group.criteria.sameDestination}
          />
          <CriteriaBadge 
            icon={Calendar} 
            label={dateLabel}
            active={group.criteria.closeDates}
          />
          <CriteriaBadge 
            icon={Package} 
            label={group.hasWarnings ? "Materiales (con precaución)" : "Materiales compatibles"}
            active={group.criteria.compatibleMaterials}
            warning={group.hasWarnings}
          />
        </div>

        {/* Weight summary */}
        <div className="text-xs text-muted-foreground">
          Peso total: <span className="font-medium text-foreground">{group.totalWeight.toLocaleString()} kg</span>
        </div>

        {/* CTA */}
        <Button 
          onClick={onSelect}
          size="sm" 
          className="w-full group"
          variant={group.compatibilityScore >= 90 ? "default" : "secondary"}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-12 transition-transform" />
          Seleccionar grupo
          <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}

interface CriteriaBadgeProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  warning?: boolean;
}

function CriteriaBadge({ icon: Icon, label, active, warning }: CriteriaBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center',
        active && !warning && 'bg-match-excellent/20',
        warning && 'bg-warning/20',
        !active && !warning && 'bg-muted'
      )}>
        {warning ? (
          <AlertTriangle className="w-3 h-3 text-warning" />
        ) : active ? (
          <Check className="w-3 h-3 text-match-excellent" />
        ) : (
          <Icon className="w-3 h-3 text-muted-foreground" />
        )}
      </div>
      <span className={cn(
        'truncate',
        active && !warning && 'text-foreground',
        warning && 'text-warning',
        !active && 'text-muted-foreground'
      )}>
        {label}
      </span>
    </div>
  );
}
