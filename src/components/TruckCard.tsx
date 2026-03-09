import { motion } from 'framer-motion';
import { AlertTriangle, Phone, User } from 'lucide-react';
import { Truck, TruckCompatibilityResult } from '@/types/truck';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TruckCardProps {
  truck: Truck;
  compatibility: TruckCompatibilityResult;
  isSelected: boolean;
  onSelect: (truckId: string) => void;
  totalWeight: number;
}

function TruckScoreCircle({ score }: { score: number }) {
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

  const circumference = 2 * Math.PI * 20;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
        <motion.circle
          cx="24" cy="24" r="20" fill="none"
          stroke={getColor()}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${(score / 100) * circumference} ${circumference}` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('text-sm font-bold', getTextClass())}>
          {score}%
        </span>
      </div>
    </div>
  );
}

export function TruckCard({ truck, compatibility, isSelected, onSelect, totalWeight }: TruckCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-colors',
        isSelected
          ? 'border-primary ring-1 ring-primary/20'
          : 'border-border',
        truck.status === 'maintenance' && 'opacity-50'
      )}
    >
      <div className="space-y-4">
        {/* Header: ID + model + score circle */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">{truck.id}</h3>
            <p className="text-sm text-muted-foreground">{truck.brand} {truck.model}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {truck.driver}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {truck.driverPhone}
              </span>
            </div>
          </div>
          <TruckScoreCircle score={compatibility.overallScore} />
        </div>

        {/* Separator */}
        <div className="border-t" />

        {/* 2x2 metadata grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Capacidad</p>
            <p className="text-sm font-semibold text-foreground">{truck.maxWeight.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Dimensiones</p>
            <p className="text-sm font-semibold text-foreground">{truck.dimensions}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Peso</p>
            <p className={cn(
              'text-sm font-semibold',
              !compatibility.weightCompatible ? 'text-destructive' : 'text-foreground'
            )}>
              {totalWeight.toLocaleString()} / {truck.maxWeight.toLocaleString()} kg
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Ubicación</p>
            <p className="text-sm font-semibold text-foreground">{truck.currentLocation}</p>
          </div>
        </div>

        {/* Warnings */}
        {compatibility.warnings.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {compatibility.warnings.slice(0, 2).map((warning, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal gap-1 text-match-warning border-match-warning/30">
                <AlertTriangle className="h-3 w-3" />
                {warning}
              </Badge>
            ))}
          </div>
        )}

        {/* Maintenance badge */}
        {truck.status === 'maintenance' && (
          <Badge variant="destructive" className="text-xs">En mantenimiento</Badge>
        )}

        {/* Select button */}
        <Button
          onClick={() => onSelect(truck.id)}
          variant={isSelected ? 'default' : 'outline'}
          className="w-full"
          disabled={truck.status === 'maintenance'}
        >
          {isSelected ? 'Camión seleccionado' : 'Seleccionar'}
        </Button>
      </div>
    </div>
  );
}
