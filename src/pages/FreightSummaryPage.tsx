import { useLocation, useNavigate } from 'react-router-dom';
import { FreightSummary } from '@/components/FreightSummary';
import { Order } from '@/types/order';
import { Truck } from '@/types/truck';
import { RouteWarning } from '@/utils/routeOptimizer';

export default function FreightSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const orders = (location.state?.orders as Order[]) || [];
  const truck = location.state?.truck as Truck | undefined;
  const orderedStops = (location.state?.orderedStops as Order[]) || [];
  const routeDistance = (location.state?.routeDistance as number) || 0;
  const routeTime = (location.state?.routeTime as number) || 0;
  const routeWarnings = (location.state?.routeWarnings as RouteWarning[]) || [];

  if (orders.length === 0 || !truck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No hay datos de flete disponibles</p>
          <button onClick={() => navigate('/')} className="text-primary hover:underline">
            Volver a gestión de pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <FreightSummary
      orders={orders}
      truck={truck}
      orderedStops={orderedStops}
      routeDistance={routeDistance}
      routeTime={routeTime}
      routeWarnings={routeWarnings}
      onBack={() => navigate('/route-optimization', { state: { groupedOrders: orders, truck } })}
      onGoHome={() => navigate('/')}
      onReassignTruck={() => navigate('/truck-assignment', { state: { groupedOrders: orders } })}
      onFixRoute={() => navigate('/route-optimization', { state: { groupedOrders: orders, truck } })}
    />
  );
}
