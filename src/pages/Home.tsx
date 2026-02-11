import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, Route, FileText, ArrowRight, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const steps = [
  {
    icon: Package,
    title: 'Gestión de Pedidos',
    description: 'Agrupa pedidos compatibles por destino, materiales y fechas de entrega.',
    route: '/',
    color: 'hsl(var(--primary))',
    bgColor: 'bg-primary/10',
    stats: { label: 'Pedidos pendientes', value: '15' },
  },
  {
    icon: Truck,
    title: 'Asignación de Camión',
    description: 'Selecciona el camión más compatible según peso, materiales y disponibilidad.',
    route: '/truck-assignment',
    color: 'hsl(var(--success))',
    bgColor: 'bg-[hsl(var(--success))]/10',
    stats: { label: 'Camiones disponibles', value: '9' },
  },
  {
    icon: Route,
    title: 'Optimización de Ruta',
    description: 'Reordena las paradas por distancia o tiempo con drag & drop inteligente.',
    route: '/route-optimization',
    color: 'hsl(var(--info))',
    bgColor: 'bg-[hsl(var(--info))]/10',
    stats: { label: 'Criterios', value: '3' },
  },
  {
    icon: FileText,
    title: 'Resumen del Flete',
    description: 'Revisa alertas, confirma y envía el flete al transportista.',
    route: '/freight-summary',
    color: 'hsl(var(--warning))',
    bgColor: 'bg-[hsl(var(--warning))]/10',
    stats: { label: 'Fletes enviados', value: '0' },
  },
];

const quickStats = [
  { icon: BarChart3, label: 'Eficiencia promedio', value: '87%' },
  { icon: Clock, label: 'Tiempo promedio de flete', value: '2.3h' },
  { icon: CheckCircle2, label: 'Fletes completados hoy', value: '4' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b bg-card">
        <div className="container py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                Panel de control
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-3">
              RouteMate
            </h1>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Gestiona tus fletes de principio a fin: agrupa pedidos, asigna camiones, optimiza rutas y confirma entregas.
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className="flex gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-sm">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{stat.label}:</span>
                <span className="font-semibold">{stat.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* Workflow steps */}
      <main className="container py-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-5">
          Flujo de trabajo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.35 }}
            >
              <Card
                className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 h-full"
                onClick={() => navigate(step.route === '/' ? '/orders' : step.route)}
              >
                <CardContent className="p-5 flex gap-4">
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className={`p-2.5 rounded-lg ${step.bgColor}`}>
                      <step.icon className="h-5 w-5" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-base">{step.title}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{step.stats.value}</span>
                      <span>{step.stats.label}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate('/orders')}
          >
            <Package className="h-4 w-4" />
            Comenzar nuevo flete
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
