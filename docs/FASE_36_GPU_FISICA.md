# Fase 36 — Benchmark físico Windows/Linux

## Objetivo
Medir, no estimar, si DEAD ROAD 404 sostiene al menos 45 FPS durante conducción y exploración en GPU real. El criterio se comprueba por escenario y repetición para la media y el 1 % bajo (métrica exigente). La fase NO está certificada hasta ejecutar la prueba localmente en cada equipo.

## Preparación
1. Instalar Node.js 22+ y controladores GPU actualizados.
2. Clonar el repositorio, ejecutar `npm ci` y `npx playwright install chromium`.
3. Ejecutar `npm run build`.
4. En Windows, abrir `BENCHMARK-404-WINDOWS.cmd`; en Linux, `bash ./BENCHMARK-404-LINUX.sh`. Ambos ejecutan tres repeticiones de 60 segundos con `--require-hardware`.
5. Revisar informes JSON y Markdown generados en `artifacts/benchmarks/`. Se mide a 1280×800 en modo de ventana.

## Comandos avanzados
```bash
npm run benchmark:gpu -- --require-hardware --repeats=3 --seconds=120 --min-fps=45
npm run benchmark:ci
```

**Advertencias:** `--require-hardware` rechaza SwiftShader, headless, WebGL no disponible e identidad de GPU desconocida, pero no es una prueba criptográfica del hardware. El tiempo medido proviene de `requestAnimationFrame` y no de temporizadores GPU. El benchmark actual mide conducción/exploración **quietas**; no cubre combate, efectos intensivos, ni una campaña prolongada. La prueba de CI es SwiftShader y no sirve para certificar GPU real. `--min-fps=45` comprueba media y percentil 1 % bajo en cada repetición, y el script falla si no se alcanza. Esta opción es deliberadamente más estricta que una media global de 45 FPS.

## Criterios para cerrar la fase
- CI correcta sin regresiones.
- Adjuntar JSON de **Windows y Linux con GPU real identificada**, driver, resolución y condiciones térmicas.
- Medir conducción y exploración, pero también completar manualmente un combate largo y una sección compleja para cubrir el límite del benchmark.
- Registrar 1 % bajo, p95, FPS medios y draw calls; analizar cuellos de botella.
- No afirmar `>=45 FPS sostenidos` ni calidad 9,5/10 hasta cumplir y reproducir la evidencia.

## Estado de entrega inicial
Instrumentación añadida, benchmarks físicos **pendientes de ejecución** en máquinas Windows/Linux reales.
