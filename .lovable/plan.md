

## Rediseno de Gestion de Pedidos segun referencia

### Analisis critico de la referencia vs estado actual

**Layout general:**
- Referencia: contenido principal a la izquierda con padding, barra lateral derecha pegada al borde derecho sin padding, separada por `border-l`, ocupa toda la altura
- Actual: grid `xl:grid-cols-3` dentro de un `container` centrado — la barra lateral NO llega al borde

**Header:**
- Referencia: solo "Pedidos" en bold negro grande (font-extrabold ~2xl), sin icono, sin subtitulo, sin fondo
- Actual: header sticky con icono Truck, titulo "Gestion de Pedidos", subtitulo, fondo card

**Controles (sort/filtros):**
- Referencia: en linea con "Pedidos (15)" — toggle "Ordenar por compatibilidad" + boton "Filtros" con icono SlidersHorizontal, alineados a la derecha
- Actual: toggle en el header con animaciones excesivas, sin boton filtros

**Tarjetas de agrupacion automatica:**
- Referencia: cards planas con borde sutil, sin gradientes ni sombras. Header: "2 Pedidas" + badge outline verde "95% Compatibilidad". Metadata: icono + texto simple (Quito, fecha, volumen m³). Boton "Seleccionar grupo" en outline negro
- Actual: cards con gradientes, circulos overlapping, badges de colores llenos, boton primary

**Tarjetas de pedidos:**
- Referencia: card plana con borde sutil. Primera linea: checkbox + ID bold mono + cliente en gris. Segunda linea: tres columnas con label pequeno gris arriba ("Lugar de entrega", "Peso", "Volumen") y valor debajo. Chevron derecha para expandir
- Actual: card con mas decoracion, sin labels de columna, sin campo volumen

**Barra lateral derecha ("Detalles del flete"):**
- Referencia: titulo "Detalles del flete" en bold. Stepper vertical con 4 pasos numerados (1-Pedidos activo en rojo, 2-Transporte, 3-Ruta, 4-Resumen en gris). Contenido del paso activo: empty state con icono + texto. Boton "Confirmar agrupacion" fijo abajo en gris deshabilitado
- Actual: SelectionSummary generico sin stepper

---

### Cambios a implementar

**1. Agregar `volume` al tipo Order y mock data**
- Agregar `volume: number` (m³) al tipo `Order` en `src/types/order.ts`
- Generar valores entre 1.5-8.0 en `mockOrders.ts`

**2. Reestructurar layout en `OrderManagement.tsx`**
- Eliminar header sticky con icono/subtitulo
- Cambiar a layout flex: contenido principal `flex-1` con padding, barra lateral `w-[340px] border-l` sin padding derecho, full height
- Titulo "Pedidos" solo en `text-2xl font-extrabold`
- Mover controles (sort toggle + boton Filtros) en linea con subtitulo "Pedidos (N)"

**3. Nuevo componente `FreightDetailsSidebar.tsx`**
- Panel fijo a la derecha con `border-l`, padding interno, fondo blanco
- Titulo "Detalles del flete" bold
- Stepper vertical: 4 pasos con numeros en circulos (paso 1 activo en primary/rojo, resto gris)
- Contenido del paso 1: muestra SelectionSummary o empty state (icono Package + "Selecciona un pedido para empezar a agrupar")
- Boton "Confirmar agrupacion" fijo en la parte inferior, deshabilitado cuando no hay seleccion

**4. Redisenar `AutoGroupingSuggestions.tsx`**
- Eliminar gradientes, circulos overlapping, badges llenos
- Card plana: "N Pedidas" texto + badge outline verde "X% Compatibilidad"
- Metadata con iconos simples: ubicacion, fecha, volumen
- Boton "Seleccionar grupo" en `variant="outline"` con borde negro

**5. Redisenar `OrdersTable.tsx` (OrderCard)**
- Primera linea: checkbox + ID mono bold + cliente gris
- Segunda linea: tres columnas con label pequeno gris ("Lugar de entrega", "Peso", "Volumen") y valor debajo
- Chevron a la derecha para expandir materiales
- Eliminar bordes coloreados, rings, badges de compatibilidad por defecto
- Cards mas planas, sin sombras

**6. Adaptar `SelectionSummary.tsx`**
- Simplificar para integrarse dentro del stepper del sidebar
- Mantener logica pero ajustar estilos al panel lateral

