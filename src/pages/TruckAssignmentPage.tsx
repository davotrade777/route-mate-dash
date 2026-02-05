import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TruckAssignment } from '@/components/TruckAssignment';
import { Order } from '@/types/order';
import { toast } from 'sonner';

export default function TruckAssignmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const groupedOrders = (location.state?.groupedOrders as Order[]) || [];

  // If no orders, redirect back
  if (groupedOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No hay pedidos agrupados</p>
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
    navigate('/');
  };

  const handleConfirm = (truckId: string) => {
    // In a real app, this would save to the backend
    toast.success('Asignación completada', {
      description: `Los ${groupedOrders.length} pedidos han sido asignados al camión ${truckId}`,
    });
    
    // Navigate back after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <TruckAssignment
      groupedOrders={groupedOrders}
      onBack={handleBack}
      onConfirm={handleConfirm}
    />
  );
}
