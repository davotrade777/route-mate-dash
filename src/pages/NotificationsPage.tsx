import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle2, Info, Check, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'warning', title: 'Flete FLT-003 rechazado', description: 'El transportista Juan Martínez rechazó el flete hacia Barcelona Puerto. Requiere reasignación inmediata.', time: 'Hace 15 min', read: false, actionLabel: 'Reasignar', actionRoute: '/assigned-freights' },
  { id: '2', type: 'success', title: 'Flete FLT-005 aceptado', description: 'María López aceptó el flete hacia Valencia Industrial. La entrega está programada.', time: 'Hace 1h', read: false, actionLabel: 'Ver detalle', actionRoute: '/assigned-freights' },
  { id: '3', type: 'warning', title: 'Alerta de peso excedido', description: 'El grupo PED-1003 + PED-1007 supera la capacidad del camión asignado en un 12%.', time: 'Hace 2h', read: false, actionLabel: 'Corregir', actionRoute: '/orders' },
  { id: '4', type: 'info', title: 'Camión CAM-105 en mantenimiento', description: 'El camión Iveco S-Way no estará disponible hasta el próximo lunes.', time: 'Hace 3h', read: true },
  { id: '5', type: 'success', title: 'Flete FLT-001 entregado', description: 'Carlos García completó la entrega en Madrid Centro exitosamente.', time: 'Hace 5h', read: true },
];

const typeConfig = {
  warning: { icon: AlertTriangle, color: 'text-[hsl(var(--warning))]', bg: 'bg-[hsl(var(--warning))]/10' },
  info: { icon: Info, color: 'text-[hsl(var(--info))]', bg: 'bg-[hsl(var(--info))]/10' },
  success: { icon: CheckCircle2, color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success))]/10' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notificaciones
            {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount} nuevas</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Alertas y actualizaciones del sistema</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Marcar todas como leídas
          </Button>
        )}
      </motion.div>

      <div className="space-y-2">
        {notifications.map((notif, i) => {
          const config = typeConfig[notif.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={`transition-colors ${!notif.read ? 'border-primary/30 bg-primary/[0.02]' : ''}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${config.bg} shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'}`}>{notif.title}</p>
                      {!notif.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">{notif.time}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {notif.actionLabel && notif.actionRoute && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => { markAsRead(notif.id); navigate(notif.actionRoute!); }}
                      >
                        {notif.actionLabel}
                      </Button>
                    )}
                    {!notif.read && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(notif.id)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
