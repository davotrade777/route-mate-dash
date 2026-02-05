import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, CompatibilityResult } from '@/types/order';
import { mockOrders } from '@/data/mockOrders';
import { calculateCompatibility } from '@/utils/compatibilityCalculator';
import { OrdersTable } from './OrdersTable';
import { SelectionSummary } from './SelectionSummary';
import { AutoGroupingSuggestions } from './AutoGroupingSuggestions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Truck, ArrowUpDown, Package, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function OrderManagement() {
  const navigate = useNavigate();
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [primarySelection, setPrimarySelection] = useState<string | null>(null);
  const [sortByCompatibility, setSortByCompatibility] = useState(false);

  // Calculate compatibility for all orders when a primary selection exists
  const compatibilityMap = useMemo(() => {
    const map = new Map<string, CompatibilityResult>();
    
    if (!primarySelection) return map;

    const primaryOrder = orders.find(o => o.id === primarySelection);
    if (!primaryOrder) return map;

    orders.forEach(order => {
      if (order.id !== primarySelection) {
        const result = calculateCompatibility(primaryOrder, order);
        map.set(order.id, result);
      }
    });

    return map;
  }, [orders, primarySelection]);

  const handleToggleOrder = useCallback((orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
        // If we're removing the primary selection, set new primary or clear
        if (orderId === primarySelection) {
          const remaining = Array.from(newSet);
          setPrimarySelection(remaining.length > 0 ? remaining[0] : null);
        }
      } else {
        newSet.add(orderId);
        // First selection becomes primary
        if (newSet.size === 1) {
          setPrimarySelection(orderId);
        }
      }
      
      return newSet;
    });
  }, [primarySelection]);

  const handleRemoveOrder = useCallback((orderId: string) => {
    handleToggleOrder(orderId);
  }, [handleToggleOrder]);

  const handleClearSelection = useCallback(() => {
    setSelectedOrders(new Set());
    setPrimarySelection(null);
  }, []);

  const handleConfirmGrouping = useCallback(() => {
    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    toast.success(`Agrupación confirmada con ${selectedOrdersList.length} pedidos`, {
      description: 'Redirigiendo a asignación de camión...',
      icon: <Truck className="h-4 w-4" />,
    });
    
    // Navigate to truck assignment with the grouped orders
    navigate('/truck-assignment', { 
      state: { groupedOrders: selectedOrdersList } 
    });
  }, [orders, selectedOrders, navigate]);

  const handleSelectGroup = useCallback((orderIds: string[]) => {
    const newSet = new Set(orderIds);
    setSelectedOrders(newSet);
    setPrimarySelection(orderIds[0] || null);
    toast.success(`Grupo seleccionado con ${orderIds.length} pedidos`, {
      icon: <Sparkles className="h-4 w-4" />,
    });
  }, []);

  const handleSortToggle = (checked: boolean) => {
    setSortByCompatibility(checked);
    if (checked && primarySelection) {
      toast.info('Ordenando por compatibilidad', {
        description: 'Los pedidos más compatibles aparecen primero',
        icon: <Sparkles className="h-4 w-4" />,
      });
    }
  };

  const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
  const primaryOrder = orders.find(o => o.id === primarySelection) || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Gestión de Pedidos</h1>
                <p className="text-sm text-muted-foreground">
                  Agrupa y optimiza las entregas
                </p>
              </div>
            </div>
            
            {/* Sort toggle */}
            <motion.div 
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all duration-300',
                sortByCompatibility 
                  ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' 
                  : 'bg-muted/50 border-transparent'
              )}
              animate={{
                scale: sortByCompatibility ? 1.02 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <AnimatePresence mode="wait">
                {sortByCompatibility ? (
                  <motion.div
                    key="sparkles"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="arrows"
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Label 
                htmlFor="sort-switch" 
                className={cn(
                  'text-sm cursor-pointer select-none transition-colors',
                  sortByCompatibility ? 'text-primary font-medium' : ''
                )}
              >
                Ordenar por compatibilidad
              </Label>
              <Switch
                id="sort-switch"
                checked={sortByCompatibility}
                onCheckedChange={handleSortToggle}
                disabled={!primarySelection}
              />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        {/* Auto grouping suggestions */}
        <AnimatePresence>
          <AutoGroupingSuggestions 
            orders={orders}
            onSelectGroup={handleSelectGroup}
            hasSelection={selectedOrders.size > 0}
          />
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Orders table */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Pedidos pendientes</h2>
                <span className="text-sm text-muted-foreground">
                  ({orders.length} pedidos)
                </span>
              </div>
              <AnimatePresence>
                {primarySelection && (
                  <motion.p 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-sm text-muted-foreground"
                  >
                    Selecciona pedidos compatibles para agrupar
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <OrdersTable
              orders={orders}
              selectedOrders={selectedOrders}
              compatibilityMap={compatibilityMap}
              onToggleOrder={handleToggleOrder}
              primarySelection={primarySelection}
              sortByCompatibility={sortByCompatibility}
            />
          </div>

          {/* Selection summary */}
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Resumen de agrupación
              </h2>
              <SelectionSummary
                selectedOrders={selectedOrdersList}
                primaryOrder={primaryOrder}
                compatibilityMap={compatibilityMap}
                onRemoveOrder={handleRemoveOrder}
                onClearSelection={handleClearSelection}
                onConfirmGrouping={handleConfirmGrouping}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
