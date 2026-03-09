

## Reemplazar badge de compatibilidad por indicador circular (como la referencia)

La referencia muestra un indicador circular de progreso en el extremo derecho de cada card, con el porcentaje en el centro y colores segun el nivel (verde oscuro 80%+, naranja 40-60%, rojo <40%). Actualmente se usa un `CompatibilityBadge` inline en texto.

### Cambios en `OrdersTable.tsx`

**Layout de la card**: Cambiar a `flex items-center` con el contenido principal a la izquierda (`flex-1`) y el indicador circular a la derecha.

**Indicador circular**: Reusar el patron SVG del `CompatibilityIndicator` existente en `CompatibilityBadge.tsx` pero simplificado:
- Circulo SVG de ~48px con stroke de progreso animado
- Porcentaje centrado en bold
- Color segun score: verde oscuro (>=80), verde (>=60), naranja (>=40), rojo (<40)
- Track gris de fondo
- Posicionado a la derecha con `ml-auto`, junto al chevron

**Eliminar**: El `CompatibilityBadge` inline del header row. Mover el chevron junto al circulo.

**Estructura resultante de cada card**:
```
[Checkbox] [ID bold] [Cliente]                    [Circulo %] [Chevron]
           [Lugar de entrega] [Peso] [Volumen]
```

El indicador circular solo se muestra cuando `hasPrimary && !isPrimary && compatibility` existe. Para el pedido principal, se mantiene el badge "Principal" sin circulo.

