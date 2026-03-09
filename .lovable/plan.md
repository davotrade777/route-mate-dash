

## Restaurar indicadores de compatibilidad en las tarjetas de pedido

El rediseño eliminó los indicadores de compatibilidad de las tarjetas. Hay que pasarle el `compatibilityMap` a cada `OrderCard` y mostrar el badge/indicador cuando hay un pedido principal seleccionado.

### Cambios

**1. `OrdersTable.tsx`**
- Pasar `compatibilityMap` como prop a cada `OrderCard`
- Pasar `primarySelection` para saber si hay uno seleccionado
- En `OrderCard`, cuando el pedido NO es el principal y existe un resultado de compatibilidad en el mapa, mostrar el `CompatibilityBadge` en la primera fila (junto al cliente, antes del chevron)
- Usar el componente `CompatibilityBadge` existente con `size="sm"` para mantener el diseño limpio y plano
- Opcionalmente mostrar los `CriteriaIcon` (destino, fecha, materiales) debajo de la metadata cuando hay compatibilidad calculada

**Resultado visual**: Al seleccionar un pedido como principal, el resto de tarjetas muestra un badge tipo "85% Buena" o "45% Baja" alineado en la fila del header, manteniendo el diseño plano actual.

