import { cn } from '@/lib/utils';
import { Order, CompatibilityResult } from '@/types/order';
import { Package, Truck, Route, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectionSummary } from './SelectionSummary';

interface FreightDetailsSidebarProps {
  selectedOrders: Order[];
  primaryOrder: Order | null;
  compatibilityMap: Map<string, CompatibilityResult>;
  onRemoveOrder: (orderId: string) => void;
  onClearSelection: () => void;
  onConfirmGrouping: () => void;
}

const steps = [
  { number: 1, label: 'Pedidos', icon: Package },
  { number: 2, label: 'Transporte', icon: Truck },
  { number: 3, label: 'Ruta', icon: Route },
  { number: 4, label: 'Resumen', icon: ClipboardList },
];

export function FreightDetailsSidebar({
  selectedOrders,
  primaryOrder,
  compatibilityMap,
  onRemoveOrder,
  onClearSelection,
  onConfirmGrouping,
}: FreightDetailsSidebarProps) {
  const activeStep = 1;

  return (
    <div className="w-[340px] flex-shrink-0 border-l bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4">
        <h2 className="text-lg font-bold text-foreground">Detalles del flete</h2>
      </div>

      {/* Stepper */}
      <div className="px-6 pb-4">
        <div className="flex flex-col gap-0">
          {steps.map((step, index) => {
            const isActive = step.number === activeStep;
            const isCompleted = step.number < activeStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number} className="flex gap-3">
                {/* Step indicator + line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isActive && 'bg-primary text-primary-foreground',
                      isCompleted && 'bg-primary text-primary-foreground',
                      !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.number}
                  </div>
                  {!isLast && (
                    <div className={cn(
                      'w-px h-6',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )} />
                  )}
                </div>

                {/* Label */}
                <div className="pt-1">
                  <span className={cn(
                    'text-sm',
                    isActive && 'font-semibold text-foreground',
                    !isActive && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <SelectionSummary
          selectedOrders={selectedOrders}
          primaryOrder={primaryOrder}
          compatibilityMap={compatibilityMap}
          onRemoveOrder={onRemoveOrder}
          onClearSelection={onClearSelection}
          onConfirmGrouping={onConfirmGrouping}
        />
      </div>

      {/* Bottom button */}
      <div className="p-6 pt-4 border-t">
        <Button
          className="w-full"
          size="lg"
          onClick={onConfirmGrouping}
          disabled={selectedOrders.length < 2}
        >
          Confirmar agrupación
        </Button>
      </div>
    </div>
  );
}
