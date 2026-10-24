# DEAD ROAD 404 — Fase 3 (v0.3.0)

## Objetivos
- Lanzadores portables Windows 11 y Linux Mint, sin rutas absolutas.
- Conservar conducción arcade, exploración en primera persona, recursos, viaje y guardado de la Fase 2.
- Incorporar dirección visual nocturna retro: cielo de estrellas, motel, señales de carretera, residuos y viñeta cinematográfica.
- Mejorar detalles del coche inspirados en coupés americanos de los setenta; **el modelo continúa siendo un placeholder procedural, no una reproducción fiel del Firebird**.
- Añadir un pequeño evento de radio mediante **R** en exploración.

## Estado de verificación
- 8 pruebas unitarias `npm test`: APROBADAS en Node.js 22.
- Sintaxis lanzadores bash: APROBADA con `bash -n`.
- `npm install`, `npm run build`, escena Three.js en navegador: **NO VERIFICADOS** en este entorno (registro de paquetes inaccesible/espera agotada).
- Lanzador Windows: creado pero no probado en Windows.
- Lanzador Mint: creado y comprobado sintácticamente, pero no probado en escritorio Mint.

## Alcance pendiente
- Modelado profesional del Pontiac, cabina y texturas originales.
- Personajes animados, combate, IA, diálogos ramificados y música.
- Ensayos reales de FPS, colisiones avanzadas, mandos y adaptación móvil.

## Primeras comprobaciones recomendadas
1. `npm install`
2. `npm test`
3. `npm run build`
4. Arrancar con lanzador, conducir y explorar; recoger bidón, probar radio, guardar/cargar.
5. Revisar consola de errores y funcionamiento tras reiniciar.

## Skills y REA
Los siete procedimientos bajo `skills/` permanecen en el repositorio; `AGENTS.md` contiene las reglas para Codex. **REA no se ejecuta dentro del juego** y no se afirma que esté instalado: integrar tras validar su versión y comandos en el entorno local.
