import { motion } from 'framer-motion';
import { Truck as TruckIcon, MapPin, Calendar, Weight, Fuel, User, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Truck, TruckCompatibilityResult } from '@/types/truck';
import { MaterialTypeTag } from './MaterialTag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TruckCardProps {
  truck: Truck;
  compatibility: TruckCompatibilityResult;
  isSelected: boolean;
  onSelect: (truckId: string) => void;
  totalWeight: number;
}

export function TruckCard({ truck, compatibility, isSelected, onSelect, totalWeight }: TruckCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-match-compatible';
    if (score >= 60) return 'text-match-warning';
    return 'text-match-incompatible';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-match-compatible/10 border-match-compatible/30';
    if (score >= 60) return 'bg-match-warning/10 border-match-warning/30';
    return 'bg-match-incompatible/10 border-match-incompatible/30';
  };

  const getCapacityColor = (percentage: number, isCompatible: boolean) => {
    if (!isCompatible) return 'bg-match-incompatible';
    if (percentage > 90) return 'bg-match-warning';
    if (percentage > 80) return 'bg-amber-500';
    return 'bg-match-compatible';
  };

  const getFuelIcon = (type: string) => {
    switch (type) {
      case 'electric': return '⚡';
      case 'hybrid': return '🔋';
      default: return '⛽';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        'relative rounded-xl border-2 bg-card p-4 transition-all duration-200',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20'
          : compatibility.isRecommended
          ? 'border-match-compatible/30 hover:border-match-compatible/50'
          : 'border-border hover:border-muted-foreground/30',
        truck.status === 'maintenance' && 'opacity-60'
      )}
    >
      {/* Recommended badge */}
      {compatibility.isRecommended && (
        <Badge className="absolute -top-2 -right-2 bg-match-compatible text-white shadow-md">
          Recomendado
        </Badge>
      )}

      {/* Maintenance badge */}
      {truck.status === 'maintenance' && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 shadow-md">
          En mantenimiento
        </Badge>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              compatibility.isRecommended ? 'bg-match-compatible/10' : 'bg-muted'
            )}>
              <TruckIcon className={cn(
                'h-5 w-5',
                compatibility.isRecommended ? 'text-match-compatible' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <h3 className="font-semibold">{truck.id}</h3>
              <p className="text-sm text-muted-foreground">{truck.brand} {truck.model}</p>
            </div>
          </div>

          {/* Score indicator */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border',
            getScoreBg(compatibility.overallScore)
          )}>
            {compatibility.overallScore >= 80 ? (
              <CheckCircle2 className="h-4 w-4 text-match-compatible" />
            ) : compatibility.overallScore >= 60 ? (
              <AlertTriangle className="h-4 w-4 text-match-warning" />
            ) : (
              <XCircle className="h-4 w-4 text-match-incompatible" />
            )}
            <span className={cn('font-bold', getScoreColor(compatibility.overallScore))}>
              {compatibility.overallScore}%
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className={cn(
              'h-4 w-4',
              compatibility.locationMatch ? 'text-match-compatible' : 'text-muted-foreground'
            )} />
            <span className="truncate">{truck.currentLocation}</span>
            {compatibility.locationMatch && (
              <CheckCircle2 className="h-3 w-3 text-match-compatible flex-shrink-0" />
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className={cn(
              'h-4 w-4',
              compatibility.dateAvailable ? 'text-match-compatible' : 'text-match-warning'
            )} />
            <span>{format(truck.availableDate, 'd MMM', { locale: es })}</span>
            {compatibility.dateAvailable ? (
              <CheckCircle2 className="h-3 w-3 text-match-compatible flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-match-warning flex-shrink-0" />
            )}
          </div>

          {/* Driver */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{truck.driver}</span>
          </div>

          {/* Fuel type */}
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{truck.fuelType} {getFuelIcon(truck.fuelType)}</span>
          </div>
        </div>

        {/* Weight capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Weight className={cn(
                'h-4 w-4',
                compatibility.weightCompatible ? 'text-match-compatible' : 'text-match-incompatible'
              )} />
              <span>Capacidad</span>
            </div>
            <span className={cn(
              'font-medium',
              !compatibility.weightCompatible && 'text-match-incompatible'
            )}>
              {totalWeight.toLocaleString()} / {truck.maxWeight.toLocaleString()} kg
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(compatibility.weightPercentage, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                'h-full rounded-full',
                getCapacityColor(compatibility.weightPercentage, compatibility.weightCompatible)
              )}
            />
          </div>
        </div>

        {/* Allowed materials */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Materiales permitidos
            {compatibility.materialCompatible ? (
              <CheckCircle2 className="h-3 w-3 text-match-compatible" />
            ) : (
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-3 w-3 text-match-incompatible" />
                </TooltipTrigger>
                <TooltipContent>
                  <ul className="text-xs">
                    {compatibility.materialWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {truck.allowedMaterials.map(type => (
              <MaterialTypeTag key={type} type={type} />
            ))}
          </div>
        </div>

        {/* Warnings */}
        {compatibility.warnings.length > 0 && (
          <div className="bg-match-warning/10 border border-match-warning/20 rounded-lg p-2.5">
            <ul className="text-xs text-match-warning space-y-0.5">
              {compatibility.warnings.slice(0, 3).map((warning, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action button */}
        <Button
          onClick={() => onSelect(truck.id)}
          variant={isSelected ? 'default' : 'outline'}
          className={cn(
            'w-full',
            isSelected && 'bg-primary'
          )}
          disabled={truck.status === 'maintenance'}
        >
          {isSelected ? 'Camión seleccionado' : 'Seleccionar camión'}
        </Button>

        {/* User control note */}
        {!compatibility.isRecommended && truck.status !== 'maintenance' && (
          <p className="text-xs text-center text-muted-foreground italic">
            Puedes seleccionar este camión bajo tu criterio
          </p>
        )}
      </div>
    </motion.div>
  );
}
