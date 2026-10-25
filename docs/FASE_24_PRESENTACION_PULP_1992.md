# Fase 24 · Presentación de medianoche — DEAD ROAD 404

## Objetivo y fuentes creativas

Dar personalidad audiovisual original al videojuego sin copiar personajes, logotipos, músicas o fotogramas comerciales. Lenguaje visual de videoclub, pulp cinematográfico, horror de carretera, títulos de terror ochenteros/noventeros y proyección analógica. Los referentes culturales se interpretan como convenciones de género, no material reutilizado.

## Implementado

- Portada principal original con títulos dramáticos, lema, contenido narrativo y navegación al juego existente.
- Secuencia introductoria breve, completamente omitible y no bloqueante.
- Cartelas pulp para conducción, exploración de SUNSPUR, THE LAST LIGHT y El pueblo sin nombre.
- Pausa real en conducción/exploración mediante ESC o botón; se suspenden las actualizaciones de juego y la calidad adaptable. Reanudar/guardar/cargar/opciones/mapa funcionan.
- Menú **OPCIONES** con cuatro resoluciones PSX (240p, 288p, 360p, 450p), volumen general de audio, grano estático, movimiento reducido, contraste alto y ampliación tipográfica; ajustes persistentes.
- Pantalla **CAPÍTULOS** con los seis actos y estados reales de bloqueado/disponible/en curso/completado; IV–VI se mantienen no jugables.
- Pantalla de créditos de la obra original, sin atribuir elementos ajenos.
- Sustitución visual de HUD, diario, cartelas narrativas, pistas, panel de inventario y controles.
- Sonidos originales con síntesis Web Audio; sin nuevos archivos de música ni dependencias externas.
- CSS con capas estáticas/opacity, sin desenfoque activo, GLB pesados ni nuevos pasos de postprocesado.
- Respeta `prefers-reduced-motion`, cierre con ESC, enfoque de teclado y los guardados `dead-road-404-f19-v2`.

## Uso

Al iniciar se muestra la portada `DEAD ROAD 404` con una secuencia muy breve, sin bloquear los botones. En el menú principal:
- **ARCHIVO DE CAPÍTULOS** para comprobar qué rollos se han completado.
- **OPCIONES · VÍDEO Y AUDIO** para personalizar gráficos, sonido y accesibilidad.
- **CRÉDITOS** para consultar el proyecto.
- Al conducir o explorar, **ESC** muestra **PAUSA DE CINTA**; desde ahí es posible reanudar, guardar, cargar y regresar.

Las selecciones de los controles se almacenan en `dead-road-404-pulp-ui-v1`, sin sobrescribir el guardado. Las teclas G, V, J, I, H, F3 y controles previos siguen disponibles.

## QA

```bash
npm test
npm run build
node scripts/check-pages-build.mjs
npm run smoke
```

CI debe validar opciones, navegación con teclado, pausa del gameplay, restauración de volumen y preferencias, cambio de calidad, visor de capítulos y conducción/exploración/puzles de las tres fases anteriores.

**Límite**: esta es una revisión transversal de UI/UX y no añade el capítulo narrativo IV. Los capítulos IV–VI y la auditoría 9,5/10 final siguen pendientes; el rendimiento real se evalúa en hardware del usuario.
