import { cn } from '@/lib/utils';
import { Package, Truck as TruckIcon, Route, ClipboardList, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Truck, TruckCompatibilityResult } from '@/types/truck';
import { motion } from 'framer-motion';

interface TransportSidebarProps {
  selectedTruck: Truck | null;
  compatibility: TruckCompatibilityResult | null;
  totalWeight: number;
  onConfirm: () => void;
}

const steps = [
  { number: 1, label: 'Pedidos', icon: Package },
  { number: 2, label: 'Transporte', icon: TruckIcon },
  { number: 3, label: 'Ruta', icon: Route },
  { number: 4, label: 'Resumen', icon: ClipboardList },
];

function ScoreCircleLarge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'hsl(var(--match-excellent))';
    if (score >= 60) return 'hsl(var(--match-good))';
    return 'hsl(var(--match-poor))';
  };
  const getTextClass = () => {
    if (score >= 80) return 'text-match-excellent';
    if (score >= 60) return 'text-match-good';
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
        <span className={cn('text-xs font-bold', getTextClass())}>{score}%</span>
      </div>
    </div>
  );
}

function CapacityBar({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const percentage = Math.min((used / total) * 100, 100);
  const remaining = total - used;
  const isOver = used > total;

  const getBarColor = () => {
    if (isOver) return 'bg-destructive';
    if (percentage > 85) return 'bg-match-warning';
    return 'bg-match-excellent';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used.toLocaleString()} / {total.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn('h-full rounded-full', getBarColor())}
        />
      </div>
      <p className={cn(
        'text-xs',
        isOver ? 'text-destructive' : 'text-muted-foreground'
      )}>
        {isOver
          ? `Excede por ${Math.abs(remaining).toLocaleString()} ${unit}`
          : `(+${remaining.toLocaleString()} ${unit} disponible)`
        }
      </p>
    </div>
  );
}

export function TransportSidebar({ selectedTruck, compatibility, totalWeight, onConfirm }: TransportSidebarProps) {
  const activeStep = 2;

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {selectedTruck && compatibility ? (
          <div className="space-y-5">
            {/* Selected truck card */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{selectedTruck.id}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTruck.brand} {selectedTruck.model}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    {selectedTruck.driver}
                  </p>
                </div>
                <ScoreCircleLarge score={compatibility.overallScore} />
              </div>
            </div>

            {/* Capacity bars */}
            <div className="space-y-4">
              <CapacityBar
                label="Peso"
                used={totalWeight}
                total={selectedTruck.maxWeight}
                unit="kg"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TruckIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              Selecciona un camión para ver los detalles
            </p>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="p-6 pt-4 border-t">
        <Button
          className="w-full"
          size="lg"
          onClick={onConfirm}
          disabled={!selectedTruck}
        >
          Confirmar asignación
        </Button>
      </div>
    </div>
  );
}
