# Fase 12 · Informe de ingeniería

## Procedencia

Base: ZIP Fase 11 del proyecto aportado. Se extrajo una **copia nueva**; los archivos de la Fase 11 se conservan.

## Evidencia y modificaciones

| Sistema | Archivo | Cambio |
|---|---|---|
| Dirección artística | `src/artDirection.ts` | Texturas procedurales y rótulos 3D originales. |
| Firebird | `src/vehicle.ts` | Casco perfilado, instrumentación animada, acabados y detalles. |
| Paisaje y estación | `src/scene.ts` | Materiales texturizados, horizonte, polvo, luces y animación contextual. |
| Sonido | `src/audioDirector.ts`, `src/audioMath.ts` | Motor sintetizado, ruido de viento y ambiente; valores vinculados al estado. |
| Rendimiento | `src/quality.ts`, `src/performance.ts` | 3 presets, media móvil de FPS y llamadas al renderizador. |
| Integración y UI | `src/main.ts`, `index.html`, `src/style.css` | Atajos G y F3, feedback visual y conexión con el juego. |
| QA | `tests/quality.test.mjs`, `tests/performance.test.mjs`, `tests/audio.test.mjs`, `tests/ui-contract.test.mjs` | Nuevas pruebas sin dependencias externas. |

## Comprobaciones

- `npm test`: 57/57 pruebas pasadas.
- `bash -n INICIAR-LINUX-MINT.sh`: pasa.
- `typescript.transpileModule`: sin errores sintácticos en los archivos nuevos/modificados.
- `npm install --no-audit --no-fund`: FALLA por DNS `EAI_AGAIN` al solicitar paquetes al registro de npm.
- `npm run build`: NO supera la resolución de `three` y tipos porque npm no ha instalado dependencias; no demuestra un fallo intrínseco de tipos o renderizado.
- Ejecución en Chromium: NO REALIZADA, sin dependencia Three.js instalada.
- REA: NO EJECUTADO. Guías del proyecto consultadas, sin acceso a un servidor MCP de REA.

## Limitaciones conocidas

El coche es una reinterpretación original de geometría retro de un muscle car clásico, **no un modelo CAD de precisión** del Pontiac. El Vigilante usa animaciones por articulaciones procedurales, no rigging ni motion capture. El rendimiento es desconocido hasta obtener mediciones reales. La misión del motel y el guardado son los de la Fase 11. La mejora visual deberá validarse comparando capturas y FPS entre ambas versiones en el mismo equipo.
