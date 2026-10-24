# Reglas de agentes — DEAD ROAD 404

Proyecto web-first de terror de carretera. Lee `docs/BIBLIA_FASE_2.md` y `README.md` antes de modificar código. Usa `skills/` como procedimientos de especialidad, **no como comandos mágicos**. Prioriza mantener: mapa → conducción → exploración → interacción → guardado. No copiar assets de juegos comerciales. Mantén TypeScript estricto y evita dependencias innecesarias. Al modificar lógica, amplía `tests/state.test.mjs`. Antes de declarar éxito ejecuta `npm test`, `npm run build` y prueba WebGL en navegador real; documenta si faltan dependencias o navegador. No afirmar que una función está terminada por existir una clase o placeholder. Trabajar en rama o commit aislado; REA, si está disponible externamente, deberá distribuir tareas sin editar simultáneamente archivos compartidos.

## Fase 8

La misión de La Última Parada se define en `src/mission.ts` y se prueba en `tests/mission.test.mjs`. No recrear una recompensa al cargar partidas ni omitir la compatibilidad del campo `mission` al migrar guardados anteriores. El arte actual es provisional; no afirmar que se han completado pruebas WebGL o compilación sin ejecutarlas.


## Fase 12 — dirección de arte y validación

`src/artDirection.ts` genera arte original, `src/audioDirector.ts` sintetiza sonido tras gesto de usuario, `src/quality.ts` controla los presupuestos de renderizado y `src/performance.ts` calcula FPS. F3 mide, no estima. No cargar contenidos remotos ni incorporar marcas/logos extraídos de terceros. No romper guardados bajo `dead-road-404-v2`. Ver `QA_VISUAL_FASE_12.md`. Si se usa REA en otro entorno, emplear el flujo de análisis JavaScript read-only y adjuntar Evidence; no afirmar haberlo ejecutado solo por instalar sus skills.


## Fase 14 — Reglas adicionales
- No sustituir assets ni guardados de la versión 13. El nuevo guardado es `dead-road-404-f14-v2`.
- `driveDust.ts` debe seguir con un solo InstancedMesh y 40 instancias como máximo; deshabilitar en rendimiento.
- `roadsideDetail14.ts` sólo añade decorado; no crea colisiones o misiones no implementadas.
- No afirmar que el juego fue probado en WebGL sin haber ejecutado el navegador con dependencias.
- REA es una herramienta de investigación estática/dinámica, no un motor de render ni un orquestador de agentes confirmado.


## Fase 15 — reglas de estabilización
- InputController es el único propietario del estado del teclado. Limpia entradas al cambiar de modo o abrir un diálogo.
- arcadeDrive.ts contiene toda la física arcade; no introducir fórmulas alternativas en main.ts.
- worldCollision.ts es la autoridad para los obstáculos de la estación compartidos con la IA. No duplicar cajas en main.ts.
- architecturalPass.ts es solo representación; no inventar colisiones sin añadirlas explícitamente al mapa.
- Antes de declarar resuelto un fallo, ejecutar npm run build y probar Chrome real en Windows, sin actualizar la copia estable.

## Fase 16 — activos 3D originales

Los modelos finales que se cargan en runtime viven en `public/models/`. El código que los genera vive en `tools/generate_art_assets.py`. No elimines los grupos de reserva hasta verificar que se cargan los tres GLB en el navegador de destino. No muevas la entrada de la gasolinera, el motel ni los puntos interactivos sin actualizar y probar `worldCollision.ts`, `motel.ts` y `main.ts`. Documenta las vistas offline como **renders VTK, no capturas del juego**. El origen de todos los recursos de esta fase es propio; no copiar modelos de otros videojuegos o marcas.

## Fase 17 — dirección de arte y límites de evidencia

- Los GLB de `public/models/` se generan con `tools/generate_art_assets.py` y `tools/phase17_detail.py`; regenerar, validar y comparar antes de aceptar cambios. No reemplazar geometría autorizada sin backup.
- `tools/blender_edit_assets.py` genera archivos de edición solo si existe Blender local; no afirmar que se produjo un `.blend` o que Blender verificó un render hasta ejecutarlo.
- Materiales de arquitectura usan mapas base/normal/metallic-roughness embebidos. Evitar referencias externas a modelos o texturas.
- `lighting17.ts` debe respetar Rendimiento y movimiento reducido. Preservar entrada a SUNSPUR, motel y anclajes de misiones.
- Guardado nuevo: `dead-road-404-f17-v2`, lectura de F16 y anteriores. No sobrescribir la versión estable.
- Las capturas VTK offline no equivalen a renders de Three.js. `npm test` no equivale a `npm run build` ni a QA en Windows.

## Fase 18 / contratos de assets

- Fuente de arte reproducible: `tools/generate_art_assets.py` (base) + `tools/phase18_rebuild.py` (topología/UV). Mantener los originales de F17 fuera de esta carpeta sin cambios.
- Los GLB deben mantener `Wheel_FL`, `Wheel_FR`, `Wheel_RL`, `Wheel_RR`, huecos de acceso a SUNSPUR/MILE 404 y las posiciones de los objetos de misión.
- Comprobar los mapas UV y alpha de capó, cristales y fachadas; no dar por pasada la QA de Three.js con renders de VTK.
- Antes de integrar cualquier GLB: `python tools/validate_art.py`, `npm test` y, en un entorno con npm funcional, `npm run build` + navegador real con F3.
- No sobrescribir guardados de F17: la Fase 18 escribe solo `dead-road-404-f18-v2`.


## Fase 19 — Contratos de autoría y validación
- No sobrescribir F18 ni los GLB en producción por una exportación Blender no validada.
- Los recursos F19 son originales y los cambios se reproducen con `tools/phase19_studio_pass.py` partiendo de los modelos F18.
- Mantener los pivotes `Wheel_FL/FR/RL/RR`, el cockpit y las puertas libres.
- Guardar solo en `dead-road-404-f19-v2`; leer F18 como origen migrable.
- Separar los renders VTK y las pruebas Node de la verificación WebGL que sigue pendiente.
