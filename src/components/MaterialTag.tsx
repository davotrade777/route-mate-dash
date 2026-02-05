import { cn } from '@/lib/utils';
import { MaterialType, MATERIAL_LABELS } from '@/types/order';
import { Package, Droplets, Zap, AlertTriangle, Apple, Wrench } from 'lucide-react';

interface MaterialTagProps {
  type: MaterialType;
  name: string;
  quantity?: number;
  unit?: string;
  hasWarning?: boolean;
}

const MATERIAL_ICONS: Record<MaterialType, React.ElementType> = {
  fragil: Package,
  quimico: AlertTriangle,
  perecedero: Apple,
  robusto: Wrench,
  liquido: Droplets,
  electronico: Zap,
};

const MATERIAL_COLORS: Record<MaterialType, string> = {
  fragil: 'bg-amber-100 text-amber-800 border-amber-200',
  quimico: 'bg-purple-100 text-purple-800 border-purple-200',
  perecedero: 'bg-green-100 text-green-800 border-green-200',
  robusto: 'bg-slate-100 text-slate-800 border-slate-200',
  liquido: 'bg-blue-100 text-blue-800 border-blue-200',
  electronico: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export function MaterialTag({ type, name, quantity, unit, hasWarning }: MaterialTagProps) {
  const Icon = MATERIAL_ICONS[type];
  const colorClass = MATERIAL_COLORS[type];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium border',
        colorClass,
        hasWarning && 'ring-2 ring-warning/50'
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="truncate max-w-[120px]">{name}</span>
      {quantity && unit && (
        <span className="opacity-70">({quantity} {unit})</span>
      )}
    </div>
  );
}

export function MaterialTypeTag({ type }: { type: MaterialType }) {
  const Icon = MATERIAL_ICONS[type];
  const colorClass = MATERIAL_COLORS[type];
  const label = MATERIAL_LABELS[type];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium border',
        colorClass
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
