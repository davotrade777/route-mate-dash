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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ x: 4 }}
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
      {/* Badges */}
      {compatibility.isRecommended && (
        <Badge className="absolute -top-2 left-4 bg-match-compatible text-white shadow-md">
          Recomendado
        </Badge>
      )}
      {truck.status === 'maintenance' && (
        <Badge variant="destructive" className="absolute -top-2 left-4 shadow-md">
          En mantenimiento
        </Badge>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Left: Truck info */}
        <div className="flex items-center gap-4 lg:min-w-[200px]">
          <div className={cn(
            'p-3 rounded-lg flex-shrink-0',
            compatibility.isRecommended ? 'bg-match-compatible/10' : 'bg-muted'
          )}>
            <TruckIcon className={cn(
              'h-6 w-6',
              compatibility.isRecommended ? 'text-match-compatible' : 'text-muted-foreground'
            )} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg">{truck.id}</h3>
            <p className="text-sm text-muted-foreground truncate">{truck.brand} {truck.model}</p>
          </div>
        </div>

        {/* Center: Key info in a row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:flex-1 text-sm">
          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className={cn(
              'h-4 w-4 flex-shrink-0',
              compatibility.locationMatch ? 'text-match-compatible' : 'text-muted-foreground'
            )} />
            <span className="truncate max-w-[120px]">{truck.currentLocation}</span>
            {compatibility.locationMatch && (
              <CheckCircle2 className="h-3 w-3 text-match-compatible flex-shrink-0" />
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5">
            <Calendar className={cn(
              'h-4 w-4 flex-shrink-0',
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
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate max-w-[100px]">{truck.driver}</span>
          </div>

          {/* Fuel */}
          <div className="flex items-center gap-1.5">
            <Fuel className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{getFuelIcon(truck.fuelType)}</span>
          </div>

          {/* Weight capacity inline */}
          <div className="flex items-center gap-2">
            <Weight className={cn(
              'h-4 w-4 flex-shrink-0',
              compatibility.weightCompatible ? 'text-match-compatible' : 'text-match-incompatible'
            )} />
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
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
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                !compatibility.weightCompatible && 'text-match-incompatible'
              )}>
                {totalWeight.toLocaleString()}/{truck.maxWeight.toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="flex items-center gap-2 lg:min-w-[180px]">
          <div className="flex flex-wrap gap-1">
            {truck.allowedMaterials.slice(0, 3).map(type => (
              <MaterialTypeTag key={type} type={type} />
            ))}
            {truck.allowedMaterials.length > 3 && (
              <span className="text-xs text-muted-foreground">+{truck.allowedMaterials.length - 3}</span>
            )}
          </div>
          {!compatibility.materialCompatible && (
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangle className="h-4 w-4 text-match-incompatible flex-shrink-0" />
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
        </div>

        {/* Warnings (collapsed) */}
        {compatibility.warnings.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 bg-match-warning/10 border border-match-warning/20 rounded-lg cursor-help">
                <AlertTriangle className="h-4 w-4 text-match-warning" />
                <span className="text-xs text-match-warning font-medium">{compatibility.warnings.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <ul className="text-xs space-y-1">
                {compatibility.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    {warning}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Right: Score + Action */}
        <div className="flex items-center gap-3 lg:ml-auto">
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

          {/* Action button */}
          <Button
            onClick={() => onSelect(truck.id)}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'min-w-[140px]',
              isSelected && 'bg-primary'
            )}
            disabled={truck.status === 'maintenance'}
          >
            {isSelected ? 'Seleccionado ✓' : 'Seleccionar'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
