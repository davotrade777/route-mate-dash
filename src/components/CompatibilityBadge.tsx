import { cn } from '@/lib/utils';
import { getScoreColor, getScoreLabel } from '@/utils/compatibilityCalculator';
import { Check, AlertTriangle, X, MapPin, Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompatibilityBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CompatibilityBadge({ score, showLabel = true, size = 'md' }: CompatibilityBadgeProps) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm',
        colorClass === 'match-excellent' && 'bg-match-excellent/15 text-match-excellent',
        colorClass === 'match-good' && 'bg-match-good/15 text-match-good',
        colorClass === 'match-moderate' && 'bg-match-moderate/15 text-match-moderate',
        colorClass === 'match-poor' && 'bg-match-poor/15 text-match-poor',
        colorClass === 'match-incompatible' && 'bg-match-incompatible/15 text-match-incompatible',
      )}
    >
      <span className="font-bold">{score}%</span>
      {showLabel && <span className="opacity-80">{label}</span>}
    </div>
  );
}

interface CompatibilityIndicatorProps {
  score: number;
  destinationMatch: boolean;
  dateProximity: number;
  materialCompatibility: 'compatible' | 'warning' | 'incompatible';
}

export function CompatibilityIndicator({ 
  score, 
  destinationMatch, 
  dateProximity, 
  materialCompatibility 
}: CompatibilityIndicatorProps) {
  const colorClass = getScoreColor(score);
  
  const getColorValue = () => {
    if (score >= 80) return 'hsl(var(--match-excellent))';
    if (score >= 60) return 'hsl(var(--match-good))';
    if (score >= 40) return 'hsl(var(--match-moderate))';
    if (score >= 20) return 'hsl(var(--match-poor))';
    return 'hsl(var(--match-incompatible))';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Circular progress indicator */}
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <motion.circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke={getColorValue()}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 151' }}
            animate={{ 
              strokeDasharray: `${(score / 100) * 151} 151`,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Score in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className={cn(
              'text-sm font-bold',
              colorClass === 'match-excellent' && 'text-match-excellent',
              colorClass === 'match-good' && 'text-match-good',
              colorClass === 'match-moderate' && 'text-match-moderate',
              colorClass === 'match-poor' && 'text-match-poor',
              colorClass === 'match-incompatible' && 'text-match-incompatible',
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>

      {/* Criteria indicators */}
      <div className="flex items-center gap-1">
        <CriteriaIcon 
          icon={MapPin} 
          active={destinationMatch} 
          tooltip="Destino"
        />
        <CriteriaIcon 
          icon={Calendar} 
          active={dateProximity >= 60} 
          partial={dateProximity >= 30 && dateProximity < 60}
          tooltip="Fecha"
        />
        <CriteriaIcon 
          icon={Package} 
          active={materialCompatibility === 'compatible'} 
          warning={materialCompatibility === 'warning'}
          danger={materialCompatibility === 'incompatible'}
          tooltip="Materiales"
        />
      </div>
    </motion.div>
  );
}

interface CriteriaIconProps {
  icon: React.ElementType;
  active: boolean;
  partial?: boolean;
  warning?: boolean;
  danger?: boolean;
  tooltip: string;
}

function CriteriaIcon({ icon: Icon, active, partial, warning, danger, tooltip }: CriteriaIconProps) {
  return (
    <div 
      className={cn(
        'relative w-6 h-6 rounded-full flex items-center justify-center transition-all',
        active && 'bg-match-excellent/20',
        partial && 'bg-match-moderate/20',
        warning && 'bg-warning/20',
        danger && 'bg-match-incompatible/20',
        !active && !partial && !warning && !danger && 'bg-muted'
      )}
      title={tooltip}
    >
      <Icon className={cn(
        'w-3 h-3',
        active && 'text-match-excellent',
        partial && 'text-match-moderate',
        warning && 'text-warning',
        danger && 'text-match-incompatible',
        !active && !partial && !warning && !danger && 'text-muted-foreground'
      )} />
    </div>
  );
}

interface CompatibilityBarProps {
  score: number;
  compact?: boolean;
}

export function CompatibilityBar({ score, compact = false }: CompatibilityBarProps) {
  const getColorValue = () => {
    if (score >= 80) return 'bg-match-excellent';
    if (score >= 60) return 'bg-match-good';
    if (score >= 40) return 'bg-match-moderate';
    if (score >= 20) return 'bg-match-poor';
    return 'bg-match-incompatible';
  };

  return (
    <div className={cn('flex items-center gap-2', compact ? 'w-20' : 'w-32')}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className={cn('h-full rounded-full', getColorValue())}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className={cn(
        'font-medium tabular-nums',
        compact ? 'text-xs w-8' : 'text-sm w-10'
      )}>
        {score}%
      </span>
    </div>
  );
}
