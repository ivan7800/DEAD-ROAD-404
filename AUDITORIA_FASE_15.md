# Auditoría técnica de DEAD ROAD 404 — Fase 15

## Alcance
- Base examinada: ZIP Fase 14 entregado al usuario. Copia de trabajo separada.
- No se ha ejecutado la aplicación en el Windows del usuario ni se ha validado el renderizador 3D.
- No se ha ejecutado REA: sus herramientas no están instaladas/conectadas en este contenedor.

## Evidencias observadas
1. `src/main.ts`: teclado, menú, misión, física, colisiones, interacciones, guardado y loop de render coexistían en un único archivo.
2. El listener original añadía teclas a un Set **antes** de comprobar que había un diálogo abierto; esto podía crear estados de entrada retenidos.
3. La lógica de colisión del jugador estaba duplicada respecto a la de `combat.ts`; había riesgo de geometrías divergentes.
4. La física original aplicaba mucha amortiguación y un factor de conversión de velocidad de 7.2 para representar km/h, incompatible con los metros por segundo del desplazamiento.
5. `scene.ts` tenía la estación y el motel definidos fundamentalmente con primitivas de caja; los escenarios requieren un pipeline de arte de verdad.
6. El proyecto ya tenía lanzadores Windows y Linux, pruebas de lógica y guardados. Conservarlos tiene prioridad.

## Cambios de esta rama
- Nuevo InputController; estados borrados al abrir diálogos, ayuda o cambiar de modo. Atajos de teclado visibles con H.
- `arcadeDrive.ts`: motor, freno, giro progresivo y marcha atrás simulados de forma desacoplada, con pruebas de diferencia de FPS.
- `worldCollision.ts`: obstáculo único usado por jugador y enemigo, con deslizamiento alrededor de esquinas.
- `architecturalPass.ts`: pase artístico original (SUNSPUR, MILE 404, cristaleras, marquesinas, molduras, techos, surtidores). Es aditivo y no pretende reemplazar los modelos 3D definitivos.
- Corregida la indicación de velocidad a m/s × 3.6 km/h; tasa de consumo durante la conducción ajustada a una escala coherente para recorridos de prueba.
- Guardado independiente `dead-road-404-f15-v2`, lectura compatible de f14/f13/v2.

## Limitaciones y riesgos
- La reconstrucción artística NO equivale a crear un coche y edificios profesionales. Para eso hace falta un pipeline GLB/GLTF y texturas originales, preferiblemente con Blender o herramientas equivalentes.
- El Firebird todavía circula por un segmento limitado, no por un mundo abierto completo. La física está diseñada para este escenario.
- Las colisiones nuevas no son un sistema de física industrial y no mapean todavía cada objeto ornamental.
- No se ha comprobado la calidad visual ni medido FPS, uso de GPU o draw calls reales.
- Se necesita compilar en un entorno con `three`, Vite y TypeScript instalados y reproducir recorridos reales con el teclado.

## Pruebas reproducibles
```bash
npm install
npm test
npm run build
npm run dev
```

Prueba guiada: comenzar desde mapa, conducir W/A/S/D, frenar con Espacio, entrar a explorar, pulsar H/Escape, caminar por puerta central, rozar estanterías, escuchar radio, hablar con Vera, guardar, cerrar, cargar. Registrar capturas y F3 durante conducción y exploración.

## Próximos entregables artísticos obligatorios
1. Firebird: malla 3D hecha por artista, no cúmulo de cajas; interior proporcionado, UVs, materiales y LOD.
2. Estación: planta coherente, puertas y cristales, surtidores y cubierta con proporciones realistas, colisiones derivadas del nivel.
3. Motel: al menos dos habitaciones conectadas y una fachada modular, iluminación interior por zonas.
4. Materiales: atlas de texturas originales de 128–512 px, normal/roughness donde aporte, filtro nearest opcional.
5. Producción: capturas antes/después, presupuesto de draw calls y rendimiento en Windows y Linux Mint.
