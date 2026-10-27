# Eventos de carretera

- Reglas puras: `src/roadEvents.ts` (6 eventos, selección, resolución, normalización). Props 3D: `src/roadEventScene.ts`. Integración: `rollRoadEvent`/`showRoadEvent` en `src/main.ts`.
- Al empezar un tramo de conducción desde km >= 24 hay una probabilidad dinámica de evento (base 70 %, baja de forma gradual hasta 48 % según los eventos ya vistos; nunca repite el último y prioriza los no vistos). El primer tramo queda limpio.
- Al llegar a la z del evento el coche se detiene y se abre el diálogo `#encounter` con 2-3 decisiones rápidas. Efectos sobre gasolina, comida, salud (mínimo 1), piezas y estado del Firebird.
- Guardado: campo opcional `roadEvents` en `GameState` (misma clave `dead-road-404-f19-v2`, `version:2`). Los guardados sin el campo cargan con valores por defecto. El evento pendiente no se guarda.
- PSX: solo cajas low-poly con `MeshStandardMaterial` que `applyPSXMaterials` convierte; sin texturas, luces ni sombras nuevas.
- Pruebas: `tests/road-events.test.mjs`.
