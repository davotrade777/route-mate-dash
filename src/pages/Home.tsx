import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, FileCheck, Bell, ArrowRight,
  CheckCircle2, AlertTriangle, Truck, Pencil,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const shortcuts = [
  {
    icon: Pencil,
    label: 'Crear nuevo flete',
    sub: '+10 pedidos nuevos',
    subColor: 'text-primary',
    route: '/orders',
  },
  {
    icon: FileCheck,
    label: 'Fletes asignados',
    sub: '3 asignados',
    subColor: 'text-muted-foreground',
    route: '/assigned-freights',
  },
  {
    icon: Bell,
    label: 'Notificaciones',
    sub: '+10 sin leer',
    subColor: 'text-primary',
    route: '/notifications',
  },
];

const notifications = [
  {
    id: 1,
    type: 'alert' as const,
    id_label: 'FLE 1099000',
    title: 'El conductor ha rechazado el flete',
    description: 'El conductor asignado ha rechazado el flete.',
    actionLabel: 'Reasignar',
    actionRoute: '/assigned-freights',
    actionVariant: 'default' as const,
  },
  {
    id: 2,
    type: 'info' as const,
    id_label: 'FLE 1099001',
    title: 'El flete se encuentra en camino',
    description: 'El conductor asignado ha confirmado la salida.',
    actionLabel: 'Ver detalles',
    actionRoute: '/assigned-freights',
    actionVariant: 'outline' as const,
  },
  {
    id: 3,
    type: 'success' as const,
    id_label: 'FLE 1099002',
    title: 'El flete ha finalizado',
    description: 'La entrega fue completada exitosamente.',
    actionLabel: 'Ver detalles',
    actionRoute: '/assigned-freights',
    actionVariant: 'outline' as const,
  },
];

const kpis = [
  { label: 'Pedidos pendientes', value: '15', sub: '+3 hoy' },
  { label: 'Camiones disponibles', value: '9', sub: '2 en ruta' },
  { label: 'Fletes completados', value: '4', sub: 'hoy' },
  { label: 'Eficiencia promedio', value: '87%', sub: '+2% vs ayer' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black tracking-tight">
          Hola, organiza tus pedidos
        </h1>
      </motion.div>

      {/* KPIs — minimal flat row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-0 border rounded-lg overflow-hidden"
      >
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={cn(
              'bg-card p-6',
              i < kpis.length - 1 && 'border-r'
            )}
          >
            <p className="text-5xl font-black tracking-tight">{kpi.value}</p>
            <p className="text-sm font-medium mt-2">{kpi.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Main 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: shortcuts + CTA */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Acciones rápidas</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border rounded-lg overflow-hidden">
              {shortcuts.map((s, i) => (
                <motion.button
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  onClick={() => navigate(s.route)}
                  className={cn(
                    'bg-card text-left p-5 hover:bg-accent transition-colors group',
                    i < shortcuts.length - 1 && 'border-r'
                  )}
                >
                  <s.icon className="h-5 w-5 mb-3 text-foreground" strokeWidth={1.5} />
                  <p className="text-sm font-bold leading-tight">{s.label}</p>
                  <p className={cn('text-xs mt-0.5', s.subColor)}>{s.sub}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              className="gap-2 font-bold text-sm rounded-md"
              onClick={() => navigate('/orders')}
            >
              <Package className="h-4 w-4" />
              Comenzar nuevo flete
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Right: notifications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">
              Notificaciones{' '}
              <span className="text-muted-foreground font-normal">(10)</span>
            </p>
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('/notifications')}
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className={cn(
                  'rounded-lg border p-4',
                  n.type === 'alert' && 'border-primary/30 bg-primary/5'
                )}
              >
                <p className={cn(
                  'text-xs font-semibold mb-1',
                  n.type === 'alert' ? 'text-primary' : 'text-success'
                )}>
                  {n.id_label}
                </p>
                <p className="text-sm font-bold leading-snug">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant={n.actionVariant}
                    className={cn(
                      'text-xs h-8 rounded-md font-semibold',
                      n.actionVariant === 'default' && 'bg-primary hover:bg-primary/90'
                    )}
                    onClick={() => navigate(n.actionRoute)}
                  >
                    {n.actionLabel}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
