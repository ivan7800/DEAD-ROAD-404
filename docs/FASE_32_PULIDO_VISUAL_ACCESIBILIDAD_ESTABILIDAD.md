# DEAD ROAD 404 — Fase 32: pulido visual y estabilidad prolongada

Base examinada: `main` v0.21.4, commit `c621909e770d1c7cec2b6f0514495b3ecc224bf7`, 25/10/2026.

## Evidencias y hallazgos

**F32-01 · Diario recortado en pantallas pequeñas (alto).** La hoja CSS definía `.journal` a `top:24%`, pero no contenía una altura máxima ni desplazamiento vertical propio; la interfaz completa utiliza `overflow:hidden`. Con seis capítulos y muchos hitos, parte de la información podía quedar fuera de la ventana. Medida: `max-height` con unidades `dvh`, desplazamiento interno, prioridad a móviles y a pantallas apaisadas de poca altura.

**F32-02 · Cierre de diario inaccesible en dispositivos táctiles (medio).** El texto pedía [J] o [ESC], sin control visible para cerrarlo. Se incorpora un botón CERRAR DIARIO de 44 px como mínimo; la apertura mueve el foco al panel y el cierre lo restaura a su origen cuando es posible.

**F32-03 · Diálogos narrativos altos (medio).** Los encuentros con varias decisiones no tenían límite de altura ni scroll interno. Se añade altura máxima y scroll accesible, sin alterar texto ni decisiones. Se mantiene el pixel art y el estilo original.

**F32-04 · Estabilidad y regresiones (cobertura pendiente).** El smoke existente verifica rutas de capítulos con checkpoints y los cuatro finales en UI, pero no muchas transiciones consecutivas. El nuevo script `qa-stability32.mjs` realiza alternancia entre conducción, exploración y menú, apertura/cierre del diario, guardados, recargas y recopilación de errores JS y solicitudes fallidas. Emplea un perfil aislado temporal de Chromium y no altera partidas reales.

## Validación

```bash
npm ci
npx playwright install chromium
npm test
npm run build
npm run smoke
npm run qa:finales
npm run qa:stability -- --seconds=18   # CI breve
npm run qa:stability -- --minutes=10  # ejecución prolongada en equipo propio
```

La ejecución prolongada genera `artifacts/f32-stability.json` y capturas `f32-*.png` para 320×568, 568×320 y 1280×800. Valida posiciones dentro de ventana, visibilidad del botón de cierre, diálogo de nueva partida, ausencia de errores JavaScript, operaciones de guardado y coherencia del progreso tras recargar. No hay ninguna transmisión de telemetría del usuario.

**Limitaciones:** 18 segundos automatizados son un control de regresión, no una prueba prolongada. Diez minutos de conducción y exploración alternadas no equivalen a completar las seis escenas narrativas desde cero. Las capturas automáticas no sustituyen una inspección visual humana, la evaluación WCAG integral ni FPS verificados con GPU real. REA no se ha ejecutado en esta etapa porque se trabaja sobre el código fuente autorizado y Playwright. No puede concederse aún el objetivo 9,5/10 únicamente con CI.
