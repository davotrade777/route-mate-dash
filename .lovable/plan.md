

## Forzar pantalla "Sin transportistas compatibles"

### Objetivo
Agregar un flete rechazado de prueba cuyos requisitos no puedan ser cubiertos por ningun camion disponible, para que al hacer clic en "Reasignar" se muestre la pantalla de error/sugerencias.

### Cambios

**1. Agregar un flete de prueba extremo en `AssignedFreightsPage.tsx`**

Agregar un nuevo flete al array `mockFreights` con las siguientes caracteristicas:
- Status: `rejected`
- Peso total muy alto (ej. 50,000 kg) que supere la capacidad de todos los camiones
- Lista de `rejectedDrivers` que incluya a TODOS los conductores disponibles en `mockTrucks`

Esto garantiza que al filtrar los camiones compatibles, ningun resultado pase el filtro (ya sea por peso o porque todos los conductores ya rechazaron).

**2. Datos del flete de prueba**

```
{
  id: 'FLT-006',
  truck: 'Iveco S-Way 490',
  driver: 'Roberto Díaz',
  destination: 'Zona Remota Industrial',
  orders: 5,
  totalWeight: 50000,
  status: 'rejected',
  sentAt: 'Hace 2h',
  respondedAt: 'Hace 1h',
  orderIds: ['PED-1015', 'PED-1016', 'PED-1017', 'PED-1018', 'PED-1019'],
  rejectedDrivers: [nombres de TODOS los drivers en mockTrucks + 'Roberto Díaz']
}
```

Al incluir todos los conductores existentes en `rejectedDrivers`, el filtro en linea 74 eliminara todos los camiones, activando la pantalla vacia con las sugerencias de modificacion del pedido.

### Resultado
Al navegar a "Fletes Asignados", veras el flete FLT-006 con badge "Rechazado". Al hacer clic en "Reasignar", aparecera la pantalla con el icono de alerta y las sugerencias para modificar el pedido.

