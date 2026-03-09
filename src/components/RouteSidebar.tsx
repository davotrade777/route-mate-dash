import { cn } from '@/lib/utils';
import { Package, Truck as TruckIcon, Route, ClipboardList, Ruler, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/utils/routeOptimizer';

interface RouteSidebarProps {
  totalDistance: number;
  totalTime: number;
  stopCount: number;
  savedHours: number;
  onConfirm: () => void;
}

const steps = [
  { number: 1, label: 'Pedidos', icon: Package },
  { number: 2, label: 'Transporte', icon: TruckIcon },
  { number: 3, label: 'Ruta', icon: Route },
  { number: 4, label: 'Resumen', icon: ClipboardList },
];

export function RouteSidebar({ totalDistance, totalTime, stopCount, savedHours, onConfirm }: RouteSidebarProps) {
  const activeStep = 3;

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
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isCompleted && 'bg-match-excellent text-white',
                      isActive && 'bg-primary text-primary-foreground',
                      !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                  </div>
                  {!isLast && (
                    <div className={cn(
                      'w-px h-6',
                      isCompleted ? 'bg-match-excellent' : 'bg-border'
                    )} />
                  )}
                </div>
                <div className="pt-1">
                  <span className={cn(
                    'text-sm',
                    isActive && 'font-semibold text-foreground',
                    isCompleted && 'text-match-excellent font-medium',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content — flat metrics */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-5">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Distancia total</p>
              <p className="text-xl font-bold text-foreground">{Math.round(totalDistance)} km</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tiempo estimado</p>
              <p className="text-xl font-bold text-foreground">{formatDuration(totalTime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entregas</p>
              <p className="text-xl font-bold text-foreground">{stopCount} entregas</p>
            </div>
          </div>

          {/* Savings badge */}
          {savedHours > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-match-excellent/10 border border-match-excellent/30">
              <Clock className="h-4 w-4 text-match-excellent flex-shrink-0" />
              <p className="text-sm text-match-excellent font-medium">
                Ahorras {savedHours.toFixed(1)} horas de viaje con esta ruta
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom button */}
      <div className="p-6 pt-4 border-t">
        <Button className="w-full" size="lg" onClick={onConfirm}>
          Confirmar agrupación
        </Button>
      </div>
    </div>
  );
}
