import { useLocation, useNavigate } from 'react-router-dom';
import { RouteOptimization } from '@/components/RouteOptimization';
import { Order } from '@/types/order';
import { Truck } from '@/types/truck';
import { toast } from 'sonner';

export default function RouteOptimizationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const groupedOrders = (location.state?.groupedOrders as Order[]) || [];
  const truck = location.state?.truck as Truck | undefined;

  if (groupedOrders.length === 0 || !truck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No hay datos de ruta disponibles</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Volver a gestión de pedidos
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/truck-assignment', { state: { groupedOrders } });
  };

  const handleConfirm = (orderedOrders: Order[]) => {
    toast.success('Ruta confirmada y asignada', {
      description: `${orderedOrders.length} entregas programadas para ${truck.id}`,
    });
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <RouteOptimization
      groupedOrders={groupedOrders}
      truck={truck}
      onBack={handleBack}
      onConfirm={handleConfirm}
    />
  );
}
