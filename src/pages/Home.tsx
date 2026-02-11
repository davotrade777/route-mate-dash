import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Truck, Route, FileText, ArrowRight,
  BarChart3, Clock, CheckCircle2, AlertTriangle,
  Bell, TrendingUp, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const kpis = [
  { icon: Package, label: 'Pedidos pendientes', value: '15', trend: '+3 hoy', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Truck, label: 'Camiones disponibles', value: '9', trend: '2 en ruta', color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success))]/10' },
  { icon: CheckCircle2, label: 'Fletes completados', value: '4', trend: 'hoy', color: 'text-[hsl(var(--info))]', bg: 'bg-[hsl(var(--info))]/10' },
  { icon: TrendingUp, label: 'Eficiencia promedio', value: '87%', trend: '+2% vs ayer', color: 'text-[hsl(var(--warning))]', bg: 'bg-[hsl(var(--warning))]/10' },
];

const notifications = [
  { id: 1, type: 'warning' as const, title: 'Flete FLT-003 rechazado', description: 'El transportista Carlos García rechazó el flete. Requiere reasignación.', time: 'Hace 15 min', actionLabel: 'Reasignar', actionRoute: '/assigned-freights' },
  { id: 2, type: 'info' as const, title: 'Flete FLT-005 aceptado', description: 'María López aceptó el flete hacia Valencia Industrial.', time: 'Hace 1h', actionLabel: 'Ver detalle', actionRoute: '/assigned-freights' },
  { id: 3, type: 'alert' as const, title: 'Alerta de peso excedido', description: 'El grupo PED-1003 + PED-1007 supera la capacidad del camión asignado.', time: 'Hace 2h', actionLabel: 'Corregir', actionRoute: '/orders' },
];

const shortcuts = [
  { icon: Package, label: 'Nuevo flete', description: 'Agrupa pedidos y comienza', route: '/orders' },
  { icon: FileText, label: 'Fletes asignados', description: 'Ver estado de fletes', route: '/assigned-freights' },
  { icon: Bell, label: 'Notificaciones', description: '3 pendientes', route: '/notifications' },
];

const notifIcon = {
  warning: AlertTriangle,
  info: CheckCircle2,
  alert: AlertTriangle,
};

const notifColor = {
  warning: 'text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10',
  info: 'text-[hsl(var(--info))] bg-[hsl(var(--info))]/10',
  alert: 'text-destructive bg-destructive/10',
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen de operaciones y accesos rápidos
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{kpi.trend}</span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  Notificaciones recientes
                  <Badge variant="destructive" className="text-[10px] h-5 px-1.5">3</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notif, i) => {
                const Icon = notifIcon[notif.type];
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-lg ${notifColor[notif.type]} shrink-0 mt-0.5`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs h-7"
                      onClick={() => navigate(notif.actionRoute)}
                    >
                      {notif.actionLabel}
                    </Button>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Quick shortcuts */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                Accesos rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shortcuts.map((shortcut, i) => (
                <motion.div
                  key={shortcut.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 hover:border-primary/30 transition-all text-left group"
                    onClick={() => navigate(shortcut.route)}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <shortcut.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{shortcut.label}</p>
                      <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* CTA */}
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => navigate('/orders')}
            >
              <Package className="h-4 w-4" />
              Comenzar nuevo flete
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
