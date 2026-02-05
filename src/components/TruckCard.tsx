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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ x: 2 }}
      className={cn(
        'relative rounded-lg border bg-card px-3 py-2 transition-all duration-200',
        isSelected
          ? 'border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20'
          : compatibility.isRecommended
          ? 'border-match-compatible/30 hover:border-match-compatible/50'
          : 'border-border hover:border-muted-foreground/30',
        truck.status === 'maintenance' && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Score indicator - first for visual hierarchy */}
        <div className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold flex-shrink-0',
          getScoreBg(compatibility.overallScore)
        )}>
          {compatibility.overallScore >= 80 ? (
            <CheckCircle2 className="h-3 w-3 text-match-compatible" />
          ) : compatibility.overallScore >= 60 ? (
            <AlertTriangle className="h-3 w-3 text-match-warning" />
          ) : (
            <XCircle className="h-3 w-3 text-match-incompatible" />
          )}
          <span className={getScoreColor(compatibility.overallScore)}>
            {compatibility.overallScore}%
          </span>
        </div>

        {/* Truck ID + Model */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <TruckIcon className={cn(
            'h-4 w-4 flex-shrink-0',
            compatibility.isRecommended ? 'text-match-compatible' : 'text-muted-foreground'
          )} />
          <div className="min-w-0">
            <span className="font-semibold text-sm">{truck.id}</span>
            <span className="text-xs text-muted-foreground ml-1.5 hidden sm:inline">{truck.brand}</span>
          </div>
        </div>

        {/* Recommended badge inline */}
        {compatibility.isRecommended && (
          <Badge className="bg-match-compatible/10 text-match-compatible border-match-compatible/30 text-[10px] px-1.5 py-0">
            ★
          </Badge>
        )}

        {/* Key info row */}
        <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground flex-1">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{truck.currentLocation}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(truck.availableDate, 'd MMM', { locale: es })}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[70px]">{truck.driver}</span>
          </div>
          <span>{getFuelIcon(truck.fuelType)}</span>
        </div>

        {/* Weight bar */}
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(compatibility.weightPercentage, 100)}%` }}
              transition={{ duration: 0.4 }}
              className={cn('h-full rounded-full', getCapacityColor(compatibility.weightPercentage, compatibility.weightCompatible))}
            />
          </div>
          <span className={cn(
            'text-[10px] font-medium whitespace-nowrap',
            !compatibility.weightCompatible && 'text-match-incompatible'
          )}>
            {Math.round(compatibility.weightPercentage)}%
          </span>
        </div>

        {/* Materials compact */}
        <div className="hidden xl:flex items-center gap-1">
          {truck.allowedMaterials.slice(0, 2).map(type => (
            <MaterialTypeTag key={type} type={type} />
          ))}
          {truck.allowedMaterials.length > 2 && (
            <span className="text-[10px] text-muted-foreground">+{truck.allowedMaterials.length - 2}</span>
          )}
        </div>

        {/* Warnings count */}
        {compatibility.warnings.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5 text-match-warning cursor-help">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium">{compatibility.warnings.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <ul className="text-xs space-y-0.5">
                {compatibility.warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Action button */}
        <Button
          onClick={() => onSelect(truck.id)}
          variant={isSelected ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'h-7 px-3 text-xs ml-auto',
            isSelected && 'bg-primary'
          )}
          disabled={truck.status === 'maintenance'}
        >
          {isSelected ? '✓' : 'Asignar'}
        </Button>
      </div>
    </motion.div>
  );
}
