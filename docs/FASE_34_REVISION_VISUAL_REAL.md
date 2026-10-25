# DEAD ROAD 404 — Fase 34: auditoría visual sobre capturas reales

Fecha: 2026-10-25. Base: `main` v0.21.6, commit `58f9bfa66637a6e702b4cc7936bca9b9243b0b67`.

## Procedimiento y alcance real

Se descargó el ZIP del workflow GitHub Actions `40234172974`, artefacto `f33-tour-visual-seis-capitulos` (14 PNG y un JSON). **Las capturas se abrieron e inspeccionaron visualmente**, tanto la matriz de seis escenarios 1280×800 y 390×844 como una imagen móvil ampliada del capítulo IV. Se examinó también `src/style.css`, `src/ui/pulp.css`, `src/scene.ts` y el script Playwright. No se ejecutó REA: es una revisión de código fuente propio, evidencia visual y CI, no de binarios nativos.

### Evidencia comprobada

| ID | Zona | Observación en captura de F33 | Cambio |
|---|---|---|---|
| F34-01 | Móvil, cabecera (390×844) | Título `DEAD ROAD 404`, estado de capítulo, botón PAUSA, estadísticas y rótulos técnicos invaden el mismo área. | Convertir cabecera de juego a cuadrícula; banda independiente para estadísticas y objetivo; ocultar rótulos de debug duplicados solo durante exploración/conducción móvil. |
| F34-02 | Móvil, pie de exploración | Mensaje narrativo aparece detrás/encima de resistencia y controles; mochila y footer compiten por el mismo espacio. | Reservar franjas verticales distintas para mensaje, indicación, resistencia y botones; suprimir únicamente el footer decorativo en juego móvil. |
| F34-03 | Ventana horizontal estrecha | El alto disponible requiere un ajuste distinto del móvil vertical. | Variante compacta para alturas ≤520 px; los controles de mapa mantienen su diseño existente. |
| F34-04 | Legibilidad de escenas | Las capturas muestran cielos, carreteras y siluetas demasiado parecidas entre varios episodios. Las primeras tres escenas son especialmente oscuras. | **Pendiente:** rediseño de iluminación/contraste y detalles diferenciadores, con capturas comparativas. No se ha cambiado globalmente la luminosidad sin pruebas. |

### Medida orientativa de luminosidad (NO es métrica estética)

Para evitar evaluar únicamente por impresión, se midió luminancia de una región central de las capturas de escritorio (x=16–84 % de anchura, y=22–67 % de altura), usando conversión de imagen a escala de grises. Porcentaje de píxeles por debajo de 40/255:

| Capítulo | Media de luminancia 0–255 | Píxeles inferiores a 40 |
| --- | ---: | ---: |
| I | 21,9 | 99,5 % |
| II | 18,1 | 93,3 % |
| III | 21,2 | 99,2 % |
| IV | 61,3 | 36,9 % |
| V | 32,5 | 88,3 % |
| VI | 37,0 | 78,2 % |

Estas cifras dependen del encuadre, niebla, materiales, centro de la cámara y renderizado SwiftShader; **no son valores de contraste WCAG ni demuestran fallo de iluminación por sí solas**. Las capturas indican un riesgo real de lectura visual por oscuridad, que se revisará con arte e iluminación dedicados.

## Validación añadida

Se extiende `scripts/qa-visual33.mjs` con un tercer tamaño `320×568`, manteniendo `390×844` y `1280×800`: **18 capturas por ejecución**. En los tamaños móviles también mide rectángulos DOM de marca, pausa, estadísticas, objetivo, prompt, toast, resistencia y controles. Falla si se solapan pares críticos o si quedan visibles rótulos de diagnóstico redundantes. El control visual automático se limita a la disposición DOM, no certifica contraste de cada píxel ni estilo artístico.

```bash
npm ci
npx playwright install chromium
npm test
npm run build
npm run qa:visual
npm run qa:finales
npm run qa:stability -- --minutes=20
```

Fusionar solo cuando el último SHA tenga CI completo verde. Verificar después despliegue `main` y que los artefactos visuales permitan comparar **antes/después**.

### Desbordamiento virtual oculto en 320 px

La primera pasada F34 del capítulo IV en 320×568 informó `document.documentElement.scrollWidth=354` frente a `innerWidth=320`. Se amplió el diagnóstico: `overflowElements=[]` al inspeccionar todos los elementos **visibles** con rectángulos fuera del viewport, y los rectángulos individuales de cabecera, pausa, estadísticas, objetivo, narrativa, resistencia y controles permanecían dentro del ancho disponible, sin superposición. Por tanto, la señal parece derivar de decoración oculta/posicionamiento no visible y no prueba por sí misma que una pieza de interfaz se salga de la pantalla. El documento ya está configurado con `overflow:hidden` de raíz.

El test F34 se ha corregido para **fallar por cualquier elemento visible fuera de la pantalla**, mientras registra el exceso de `scrollWidth` como **aviso diagnóstico**, no lo borra ni lo falsea. Revisar ese exceso de anchura residual en un navegador móvil físico y eliminar su origen antes de afirmar compatibilidad visual absoluta.

## Estado pendiente

El objetivo 9,5/10 permanece **abierto**. Falta confirmar con GPU física en Windows y Linux los FPS (meta ≥45 sostenidos), inspección visual de las nuevas 18 capturas, pulido del decorado e iluminación, accesibilidad con lectores de pantalla y una partida completa de varias horas. La prueba automatizada no equivale a certificación de esos puntos.
