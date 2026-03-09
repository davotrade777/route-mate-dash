import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Order, CompatibilityResult } from '@/types/order';
import { mockOrders } from '@/data/mockOrders';
import { calculateCompatibility } from '@/utils/compatibilityCalculator';
import { OrdersTable } from './OrdersTable';
import { AutoGroupingSuggestions } from './AutoGroupingSuggestions';
import { FreightDetailsSidebar } from './FreightDetailsSidebar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Truck, Package, Sparkles, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function OrderManagement() {
  const navigate = useNavigate();
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [primarySelection, setPrimarySelection] = useState<string | null>(null);
  const [sortByCompatibility, setSortByCompatibility] = useState(false);

  const compatibilityMap = useMemo(() => {
    const map = new Map<string, CompatibilityResult>();
    if (!primarySelection) return map;
    const primaryOrder = orders.find(o => o.id === primarySelection);
    if (!primaryOrder) return map;
    orders.forEach(order => {
      if (order.id !== primarySelection) {
        map.set(order.id, calculateCompatibility(primaryOrder, order));
      }
    });
    return map;
  }, [orders, primarySelection]);

  const handleToggleOrder = useCallback((orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
        if (orderId === primarySelection) {
          const remaining = Array.from(newSet);
          setPrimarySelection(remaining.length > 0 ? remaining[0] : null);
        }
      } else {
        newSet.add(orderId);
        if (newSet.size === 1) setPrimarySelection(orderId);
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
    navigate('/truck-assignment', { state: { groupedOrders: selectedOrdersList } });
  }, [orders, selectedOrders, navigate]);

  const handleSelectGroup = useCallback((orderIds: string[]) => {
    setSelectedOrders(new Set(orderIds));
    setPrimarySelection(orderIds[0] || null);
    toast.success(`Grupo seleccionado con ${orderIds.length} pedidos`, {
      icon: <Sparkles className="h-4 w-4" />,
    });
  }, []);

  const handleSortToggle = (checked: boolean) => {
    setSortByCompatibility(checked);
  };

  const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
  const primaryOrder = orders.find(o => o.id === primarySelection) || null;

  return (
    <div className="flex h-[calc(100vh-0px)] bg-background">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Title */}
          <h1 className="text-2xl font-extrabold text-foreground mb-6">Pedidos</h1>

          {/* Auto grouping suggestions */}
          <AnimatePresence>
            <AutoGroupingSuggestions
              orders={orders}
              onSelectGroup={handleSelectGroup}
              hasSelection={selectedOrders.size > 0}
            />
          </AnimatePresence>

          {/* Controls row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Pedidos</h2>
              <span className="text-sm text-muted-foreground">({orders.length})</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="sort-switch"
                  checked={sortByCompatibility}
                  onCheckedChange={handleSortToggle}
                  disabled={!primarySelection}
                />
                <Label htmlFor="sort-switch" className="text-sm text-muted-foreground cursor-pointer">
                  Ordenar por compatibilidad
                </Label>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Orders list */}
          <OrdersTable
            orders={orders}
            selectedOrders={selectedOrders}
            compatibilityMap={compatibilityMap}
            onToggleOrder={handleToggleOrder}
            primarySelection={primarySelection}
            sortByCompatibility={sortByCompatibility}
          />
        </div>
      </div>

      {/* Right sidebar */}
      <FreightDetailsSidebar
        selectedOrders={selectedOrdersList}
        primaryOrder={primaryOrder}
        compatibilityMap={compatibilityMap}
        onRemoveOrder={handleRemoveOrder}
        onClearSelection={handleClearSelection}
        onConfirmGrouping={handleConfirmGrouping}
      />
    </div>
  );
}
