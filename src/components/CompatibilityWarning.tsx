import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompatibilityWarningProps {
  warnings: string[];
  className?: string;
}

export function CompatibilityWarning({ warnings, className }: CompatibilityWarningProps) {
  if (warnings.length === 0) return null;

  const hasHighRisk = warnings.some(w => w.includes('Riesgo alto'));

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg p-3 text-sm animate-slide-up',
        hasHighRisk 
          ? 'bg-match-incompatible/10 border border-match-incompatible/20' 
          : 'bg-warning/10 border border-warning/20',
        className
      )}
    >
      <AlertTriangle 
        className={cn(
          'h-4 w-4 mt-0.5 flex-shrink-0',
          hasHighRisk ? 'text-match-incompatible' : 'text-warning'
        )} 
      />
      <div className="space-y-1">
        <p className={cn(
          'font-medium',
          hasHighRisk ? 'text-match-incompatible' : 'text-warning'
        )}>
          {hasHighRisk ? 'Alerta de compatibilidad' : 'Precaución'}
        </p>
        <ul className="space-y-0.5 text-muted-foreground">
          {warnings.map((warning, i) => (
            <li key={i}>{warning}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-2 italic">
          La decisión final es tuya. Puedes continuar con la agrupación.
        </p>
      </div>
    </div>
  );
}
