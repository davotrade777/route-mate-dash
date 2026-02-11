import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Truck, MapPin, Clock, CheckCircle2, XCircle, Send, RotateCcw, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type FreightStatus = 'sent' | 'accepted' | 'rejected';

interface AssignedFreight {
  id: string;
  truck: string;
  driver: string;
  destination: string;
  orders: number;
  totalWeight: number;
  status: FreightStatus;
  sentAt: string;
  respondedAt?: string;
}

const mockFreights: AssignedFreight[] = [
  { id: 'FLT-001', truck: 'Mercedes-Benz Actros 1845', driver: 'Carlos García', destination: 'Madrid Centro', orders: 3, totalWeight: 4500, status: 'accepted', sentAt: 'Hace 3h', respondedAt: 'Hace 2h' },
  { id: 'FLT-002', truck: 'Volvo FH16', driver: 'María López', destination: 'Valencia Industrial', orders: 2, totalWeight: 3200, status: 'accepted', sentAt: 'Hace 5h', respondedAt: 'Hace 4h' },
  { id: 'FLT-003', truck: 'Scania R500', driver: 'Juan Martínez', destination: 'Barcelona Puerto', orders: 4, totalWeight: 7800, status: 'rejected', sentAt: 'Hace 1h', respondedAt: 'Hace 30 min' },
  { id: 'FLT-004', truck: 'MAN TGX 18.500', driver: 'Ana Rodríguez', destination: 'Sevilla Logística', orders: 2, totalWeight: 2100, status: 'sent', sentAt: 'Hace 20 min' },
  { id: 'FLT-005', truck: 'DAF XF 480', driver: 'Pedro Sánchez', destination: 'Bilbao Puerto', orders: 3, totalWeight: 5600, status: 'sent', sentAt: 'Hace 10 min' },
];

const statusConfig: Record<FreightStatus, { label: string; icon: typeof CheckCircle2; color: string; badgeClass: string }> = {
  sent: { label: 'Esperando respuesta', icon: Send, color: 'text-[hsl(var(--info))]', badgeClass: 'bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] border-[hsl(var(--info))]/30' },
  accepted: { label: 'Aceptado', icon: CheckCircle2, color: 'text-[hsl(var(--success))]', badgeClass: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30' },
  rejected: { label: 'Rechazado', icon: XCircle, color: 'text-destructive', badgeClass: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function AssignedFreightsPage() {
  const [freights, setFreights] = useState(mockFreights);
  const [filter, setFilter] = useState<FreightStatus | 'all'>('all');

  const filtered = filter === 'all' ? freights : freights.filter(f => f.status === filter);

  const counts = {
    all: freights.length,
    sent: freights.filter(f => f.status === 'sent').length,
    accepted: freights.filter(f => f.status === 'accepted').length,
    rejected: freights.filter(f => f.status === 'rejected').length,
  };

  const handleReassign = (freightId: string) => {
    setFreights(prev =>
      prev.map(f =>
        f.id === freightId
          ? { ...f, status: 'sent' as FreightStatus, driver: 'Laura Fernández', truck: 'Renault T High', respondedAt: undefined, sentAt: 'Ahora' }
          : f
      )
    );
    toast.success('Flete reasignado al siguiente transportista disponible');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          Fletes Asignados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Estado de todos los fletes enviados a transportistas</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'sent', 'accepted', 'rejected'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="gap-1.5"
          >
            {f === 'all' ? 'Todos' : statusConfig[f].label}
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
              {counts[f]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Freight cards */}
      <div className="space-y-3">
        {filtered.map((freight, i) => {
          const config = statusConfig[freight.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={freight.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${freight.status === 'accepted' ? 'bg-[hsl(var(--success))]/10' : freight.status === 'rejected' ? 'bg-destructive/10' : 'bg-[hsl(var(--info))]/10'}`}>
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{freight.id}</span>
                          <Badge className={`text-[10px] border ${config.badgeClass}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 mt-3 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Truck className="h-3.5 w-3.5" />
                            <span className="truncate">{freight.driver}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{freight.destination}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>{freight.orders} pedidos · {(freight.totalWeight / 1000).toFixed(1)}t</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{freight.sentAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {freight.status === 'rejected' && (
                        <Button size="sm" className="gap-1.5" onClick={() => handleReassign(freight.id)}>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reasignar
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
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
