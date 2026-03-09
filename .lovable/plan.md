

## Rediseño de Pantalla de Optimización de Ruta

### Análisis de la referencia vs estado actual

**Layout**: La referencia usa sidebar derecha pegada al borde (`border-l`, full height) con el stepper de 4 pasos (Pedidos ✓, Transporte ✓, Ruta activo, Resumen pendiente). Actualmente el componente usa `container` centrado con sidebar dentro de un `grid xl:grid-cols-3` que NO llega al borde.

**Header**: Referencia muestra "← Volver" simple y "Configura la ruta" en `text-2xl font-extrabold`. Actualmente tiene header sticky con icono Route, `bg-card`, badge decorativo.

**Criterios de ordenamiento**: Referencia muestra 3 opciones en fila horizontal (sin "Personalizado" visible): "Ruta recomendada" (activa, con fondo tenue y borde, icono sparkles en rojo), "Mejor distancia", "Más urgente". Sin animaciones scale. Actualmente hay 4 botones en grid 2x4 con `whileHover`, `whileTap`, `shadow-lg`.

**Stops/Paradas**: Referencia muestra paradas simples sin Cards envolventes. Estructura plana:
- Punto de inicio: círculo negro sólido + "Punto de inicio" en rojo + ubicación en bold
- Cada parada: círculo azul con número + ID y fecha en gris + destino en bold + "Trayecto acumulado" a la derecha con icono distancia y tiempo
- Separador `border-b` entre paradas, sin Card wrapper
- Sin material tags, sin sección de acumulado en card separada

**Sidebar derecha (Paso 3 - Ruta)**: Stepper con pasos 1-2 completados (check verde), paso 3 activo (círculo rojo "3"). Contenido: métricas simples sin Cards — "Distancia total" label gris + "343 km" bold, "Tiempo estimado" + "9h 51 min", "Entregas" + "3 entregas". Badge verde con icono reloj: "Ahorras 1.2 horas de viaje con esta ruta". Botón "Confirmar agrupación" fijo abajo.

**Mapa**: Sección "Previsualización de rutas" con imagen de mapa debajo de las paradas. Esto es visual/decorativo — se puede omitir o poner placeholder.

---

### Cambios a implementar

**1. `RouteOptimization.tsx` — Layout completo**
- Eliminar header sticky con iconos/bg-card. Reemplazar con "← Volver" ghost button + "Configura la ruta" en `text-2xl font-extrabold`
- Layout: `flex h-screen` con contenido principal `flex-1 overflow-y-auto` y sidebar externa
- Eliminar `container` — usar padding directo (`px-8 py-6`)

**2. Criterios de ordenamiento**
- Quitar opción "Personalizado" del array visible (mantener lógica de custom internamente al hacer drag)
- 3 botones en fila horizontal, planos: activo con `bg-primary/5 border border-primary/30`, inactivos con `border border-transparent`
- Sin `whileHover`/`whileTap` scale animations
- Icono + label bold + descripción en gris

**3. Paradas — diseño plano**
- Eliminar Card wrapper de cada parada
- Punto de inicio: círculo negro sólido + "Punto de inicio" en `text-primary text-xs font-medium` + ubicación bold
- Cada parada: círculo `bg-primary` con número blanco + fila con ID (`text-muted-foreground text-xs`) + fecha + destino bold en nueva línea
- "Trayecto acumulado" alineado a la derecha con icono `⊕ X km ⊙ Xh Xmin`
- `border-b` entre paradas, línea vertical conectora a la izquierda
- Sin material tags, sin grip vertical visible

**4. Crear sidebar Paso 3 (Ruta) — reusar patrón de `TransportSidebar`**
- Reusar stepper del sidebar existente con `activeStep = 3` (pasos 1 y 2 completados con check verde)
- Contenido: métricas sin cards — labels grises + valores bold (Distancia total, Tiempo estimado, Entregas)
- Badge verde: "Ahorras X horas de viaje con esta ruta" (calcular diferencia vs peor ruta o mostrar dato fijo)
- Botón "Confirmar agrupación" fijo abajo

**5. `RouteOptimizationPage.tsx`**
- Actualizar para usar el nuevo layout flex con sidebar integrada directamente (no dentro del componente `RouteOptimization`)

