# DEAD ROAD 404 · Fase 30: estabilidad y GPU real

Fecha de revisión: 25/10/2026. Base estable: `main` v0.21.2, commit `10a2a7083d9b7af4e7bde62b796f56d109034360`.

## Hallazgos comprobados mediante inspección estática

| ID | Evidencia | Cambio de F30 | Nivel de comprobación |
|---|---|---|---|
| F30-01 | En `src/main.ts`, el modo mapa llamaba a `camera.updateProjectionMatrix()` en cada actualización aunque `fov` fuera siempre 73. | Recalcular solo cuando cambia el FOV y reutilizar la posición objetivo. | Código y test de contrato; pendientes mediciones comparativas |
| F30-02 | El texto del HUD se sobrescribía periódicamente aunque su contenido fuera idéntico; se creaban vectores temporales para comprobar distancias al bidón. | Reutilizar posiciones constantes y no escribir el mismo texto. | Código y test de contrato |
| F30-03 | `GameWorld.setFlashlight` creaba un `THREE.Vector3` cada actualización con linterna encendida. | Reutilizar un vector miembro. | Código y test de contrato |
| F30-04 | `DriveDust.update` calculaba `driveFeedback` incluso cuando las calidades PSX/rendimiento ocultaban todas las partículas. | Retorno anticipado sin simular polvo invisible. | Código y test de contrato |
| F30-05 | F29 redujo draw calls pero no verificó FPS en hardware real: rAF de SwiftShader 21,1 FPS, 1 % bajo 5 FPS. | Benchmark local repetible en Windows y Linux, con trazabilidad del renderer WebGL, resolución, FPS e informe JSON/MD. | Instrumentación, no mejora de FPS certificada |

El motor REA no se ha ejecutado sobre esta aplicación: se ha inspeccionado código fuente autorizado y utilizado GitHub Actions/Playwright. No se ha ejecutado software de origen desconocido.

## Ejecución reproducible

Requisitos: Node.js 22+, npm, Chromium descargado para Playwright y dependencias del repositorio. Todas las mediciones se guardan **solo localmente**.

```bash
npm install
npx playwright install chromium
npm run benchmark:gpu -- --repeats=3 --seconds=10
```

En Windows también puedes abrir `BENCHMARK-404-WINDOWS.cmd`. En Linux Mint:

```bash
bash ./BENCHMARK-404-LINUX.sh
```

Para diagnósticos de CI con renderizador por software:

```bash
npm run benchmark:ci
```

La opción `--require-hardware` produce un error cuando el renderer está identificado como SwiftShader/llvmpipe. La ausencia de ese identificador **no prueba** que se esté utilizando hardware acelerado. Los datos de renderer/sistema se quedan dentro de `artifacts/benchmarks`; revisar el JSON antes de compartirlo.

## Protocolo de interpretación

- Cada escena (conducción y exploración) se ejecuta al menos tres veces, en ventana 1280×800 y PSX 240p; 1,4 s iniciales de estabilización.
- Registrar FPS medios y 1 % bajo por repetición, p95 de intervalo rAF, driver WebGL, draw calls y triángulos. Las muestras rAF miden cadencia observada, **no duración real de GPU**.
- Para una comparación A/B, ejecutar el mismo benchmark sobre `v0.21.2` y `v0.21.3` en el mismo ordenador, misma sesión térmica, Chromium/driver, resolución y escena. Controlar aplicaciones y carga del sistema.
- No concluir 45 FPS sostenidos a partir de un solo promedio. Repetir con combate, caminata y conducción de 10–15 minutos para detectar tirones y fugas.
- La escena quieta sirve como línea de referencia, **no representa** el peor caso de una campaña larga con enemigos y animaciones.
- El CI ejecuta `npm run benchmark:ci`, adjunta JSON/MD al workflow y no aplica umbrales arbitrarios de FPS; SwiftShader es un entorno de diagnóstico y no reemplaza GPU física.

## Límites y cierre

Las mejoras anteriores son reducciones justificables de trabajo de CPU/DOM por inspección; su efecto en FPS y estabilidad **no se afirma** hasta una prueba A/B real. El test de navegador permite verificar que los seis capítulos, decisiones, controles, persistencia y cuatro finales no se ven afectados, aunque solo cubre la ruta completa de algunos finales. No se acredita calidad 9,5/10, GPU real ni una campaña completa de horas sin errores.

Quedan pendientes lockfile de dependencias con `npm ci`, auditoría visual Windows/Linux, benchmark de combates con movimiento y cuatro finales completos en navegador.
