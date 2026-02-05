import { useState, useMemo, useCallback } from 'react';
import { Order, CompatibilityResult } from '@/types/order';
import { mockOrders } from '@/data/mockOrders';
import { calculateCompatibility } from '@/utils/compatibilityCalculator';
import { OrdersTable } from './OrdersTable';
import { SelectionSummary } from './SelectionSummary';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Truck, ArrowUpDown, Package } from 'lucide-react';
import { toast } from 'sonner';

export function OrderManagement() {
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
      description: `IDs: ${selectedOrdersList.map(o => o.id).join(', ')}`,
    });
    handleClearSelection();
  }, [orders, selectedOrders, handleClearSelection]);

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
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Label 
                htmlFor="sort-switch" 
                className="text-sm cursor-pointer select-none"
              >
                Ordenar por compatibilidad
              </Label>
              <Switch
                id="sort-switch"
                checked={sortByCompatibility}
                onCheckedChange={setSortByCompatibility}
                disabled={!primarySelection}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
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
              {primarySelection && (
                <p className="text-sm text-muted-foreground animate-fade-in">
                  Selecciona pedidos compatibles para agrupar
                </p>
              )}
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
