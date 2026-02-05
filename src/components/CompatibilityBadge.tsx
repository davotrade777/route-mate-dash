import { cn } from '@/lib/utils';
import { getScoreColor, getScoreLabel } from '@/utils/compatibilityCalculator';

interface CompatibilityBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function CompatibilityBadge({ score, showLabel = true, size = 'md' }: CompatibilityBadgeProps) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium animate-fade-in',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
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
