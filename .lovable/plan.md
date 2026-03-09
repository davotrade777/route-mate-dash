

## Rediseno de Pantalla de Asignacion de Camiones

### Analisis critico de la referencia vs estado actual

**Layout:**
- Referencia: sidebar derecha pegada al borde (`border-l`, full height), contenido principal con padding a la izquierda. Header simple "← Volver" sin fondo ni sticky decorado
- Actual: header sticky con icono, bg-card, container centrado. Sidebar dentro de un `grid xl:grid-cols-3` con `container` — NO llega al borde

**Header:**
- Referencia: solo "← Volver" como link/boton plano arriba a la izquierda, luego "Selecciona un camión" en `text-2xl font-extrabold`, sin iconos ni subtitulos
- Actual: header complejo con icono Truck, badge, subtitulo, toggle animado con sparkles

**Toggle filtro:**
- Referencia: "Mostrar solo compatibles" con Switch simple, alineado a la derecha en la misma linea que "Camiones disponibles"
- Actual: toggle con animaciones, sparkles, bordes coloreados, escala

**Truck Cards:**
- Referencia: card plana sin sombras ni bordes coloreados. Header: ID bold grande + modelo/marca + conductor/telefono debajo. Indicador circular SVG (90%) a la derecha. Separador horizontal. Grid 2x2 con labels grises arriba: "Capacidad" / "Dimensiones" / "Peso" / "Volumen", valores bold debajo. Warning en badge outline con icono triangulo (ej "Robusto con electrónico"). Boton "Seleccionar" en outline negro centrado abajo
- Actual: cards con border-2, rounded-xl, badges "Recomendado" flotantes, iconos coloreados por estado, barra de progreso, seccion de materiales con tags, warnings en box coloreado

**Sidebar derecha (Detalles del flete):**
- Referencia: stepper con paso 1 completado (check verde), paso 2 activo (circulo rojo "2"), pasos 3-4 en gris. Contenido del paso 2: muestra el camion seleccionado con ID + score, modelo, conductor, barras de progreso para Peso y Volumen con colores y texto "(+X kg disponible)". Boton "Confirmar agrupación" fijo abajo en carmesí
- Actual: sidebar es un Card dentro del grid, no llega al borde, sin stepper, muestra resumen de pedidos

**Truck type — falta `dimensions` y `phone`:**
- Referencia muestra "Dimensiones: 2.6m x 1.5m x 12.5m" y telefono del conductor
- Actual: Truck type no tiene `dimensions` ni `driverPhone`

---

### Cambios a implementar

**1. Agregar campos al tipo Truck y mock data**
- Agregar `dimensions: string` (ej "2.6m x 1.5m x 12.5m") y `driverPhone: string` al tipo `Truck`
- Actualizar `mockTrucks.ts` con valores generados

**2. Reestructurar `TruckAssignment.tsx`**
- Eliminar header sticky con iconos/badge/animaciones
- Layout flex: `flex-1` para contenido principal con padding, sidebar `w-[340px] border-l` pegada al borde derecho
- Header simple: "← Volver" como boton ghost, luego "Selecciona un camión" en `text-2xl font-extrabold`
- "Camiones disponibles" + toggle "Mostrar solo compatibles" (Switch simple, sin animaciones) en la misma linea
- Grid `grid-cols-2` para las cards de camiones

**3. Redisenar `TruckCard.tsx`**
- Card plana: `border rounded-lg`, sin sombras, sin border-2, sin badges flotantes, sin whileHover
- Header: ID bold grande (`text-lg font-bold`) a la izquierda, circulo SVG de compatibilidad a la derecha
- Debajo del ID: modelo/marca en texto normal, conductor + telefono en gris
- Separador `border-t` horizontal
- Grid 2x2 con labels grises: Capacidad, Dimensiones, Peso, Volumen (peso muestra `totalWeight / maxWeight kg`)
- Warning simple: badge outline con icono triangulo y texto (ej "Robusto con electrónico")
- Boton "Seleccionar" en `variant="outline"` full width, texto centrado

**4. Crear sidebar para paso 2 (Transporte)**
- Reusar estructura de `FreightDetailsSidebar` pero con `activeStep = 2`
- Paso 1: check verde (completado), Paso 2: activo (circulo primario), Pasos 3-4: gris
- Contenido: cuando hay camion seleccionado, mostrar card con ID + score circular, modelo, conductor, barras de progreso para Peso y Volumen con colores y texto "(+X disponible)"
- Cuando no hay camion: empty state
- Boton "Confirmar agrupación" fijo abajo en primary (carmesí)

**5. Indicador circular en TruckCard**
- Reusar el mismo patron `ScoreCircle` SVG de `OrdersTable.tsx` (circulo con stroke animado + porcentaje centrado)
- Colores: verde >=80, naranja >=60, rojo <60

