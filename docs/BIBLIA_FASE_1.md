# DEAD ROAD 404 — Biblia de diseño v0.1

## Visión
Survival horror de carretera, en español, que une gestión de expedición, conducción arcade y exploración en primera persona. Inspiración de atmósfera retro y cine grindhouse, con personajes, música y narrativa originales. Público: aficionados al terror, la exploración y las decisiones difíciles.

## Pilares
1. **La carretera cobra un precio:** combustible, salud, tiempo, reputación y vínculos son recursos conectados.
2. **Cada parada cuenta:** las localizaciones esconden recursos, pistas, peligros y decisiones.
3. **El coche es un personaje:** Pontiac Firebird Trans Am de 1977 como icono visual y mecánico; consumo alto, aceleración contundente, poco maletero.
4. **Terror con contraste:** tensión sostenida, diálogos de humor negro y ráfagas de acción; no convertir el horror en parodia.
5. **Consecuencias legibles:** elecciones con costes anunciados y efectos persistentes; evitar castigos arbitrarios.

## Premisa
Una carretera del suroeste estadounidense conduce a localidades que desaparecieron de los mapas. Una transmisión nocturna promete un refugio al oeste. La expedición descubre que los muertos no son la causa del desastre, sino uno de sus síntomas. El viaje se estructura en ocho capítulos; cada uno tiene un arco humano, un misterio y una decisión irreversible.

## Bucle principal
Elegir ruta → conducir/gastar recursos → evento → detenerse → explorar/arriesgarse → conseguir suministros o información → gestionar expedición → continuar. La conducción arcade es un modo de juego, no una animación obligatoria.

## Modos
- **Carretera:** navegación, consumo, encuentros y en fases posteriores conducción arcade.
- **Exploración:** primera persona, colisiones, puertas, objetos, linterna y amenazas.
- **Campamento:** inventario, reparación, descanso, conversaciones y relaciones.

## Sistemas y reglas iniciales
- Recursos: gasolina, comida, botiquines, munición, integridad del coche y moral.
- Personajes: salud, cansancio, confianza, heridas, rasgos y objetivos personales.
- Vehículos: aceleración, maniobrabilidad, consumo, capacidad de carga, ruido y resistencia.
- Horror: amenaza escalonada, sonido direccional, incertidumbre; no depender de jumpscares.
- Combate: evitar que todas las situaciones se resuelvan disparando; huida y sigilo viables.
- Narrativa: diálogo ramificado, consecuencias registradas y cuatro finales principales previstos.
- Accesibilidad: subtítulos, remapeo futuro, contraste, control de sensibilidad y reducción de efectos.

## Dirección audiovisual
3D low-poly original con texturas de resolución deliberadamente baja, niebla, siluetas potentes, luces rojas/ámbar y encuadres cinematográficos. Música original: surf rock, blues desértico, rock fronterizo y ambient inquietante. No copiar diálogos, música, personajes ni activos de obras de referencia.

## Arquitectura objetivo
TypeScript + Three.js + Vite; HTML/CSS para HUD; Web Audio; IndexedDB con guardados versionados; pruebas unitarias y Playwright; GitHub Actions; distribución web primero, Electron posteriormente. Separar motor, simulación, contenido y persistencia.

## Plan de contenido (objetivos, no implementados)
8 capítulos, 20–30 lugares, 6–8 vehículos, 10 compañeros, 12–15 arquetipos de enemigo, 100+ eventos, 4 finales; campaña estimada 8–12 horas, a validar mediante pruebas.

## Hitos y puertas de calidad
1. **Fase 1:** vertical slice de navegación/exploración, primer evento, HUD, mapa, guardado, pruebas.
2. **Fase 2:** Firebird 3D, conducción arcade y daños.
3. **Fase 3:** economía de supervivencia, compañeros y eventos.
4. **Fase 4:** combate, sigilo, IA, puzles y terror sistémico.
5. **Fase 5:** campaña completa y contenido original.
6. **Fase 6:** accesibilidad, rendimiento, QA, empaquetado y publicación.

**Criterio de aprobación:** ninguna fase se declara terminada por una captura o por compilar. Se exigen pruebas automáticas, pruebas manuales y una lista de defectos abierta. La puntuación 9,5/10 es una aspiración, no una evaluación alcanzada.

## Estado real de Fase 1
Se entrega un prototipo web sin dependencias con raycasting 2.5D en primera persona, colisiones, gasolinera explorable, recurso interactivo, HUD, ruta estratégica, evento narrativo y guardado local. No incluye todavía Three.js, modelos 3D reales, conducción física, enemigos, audio, ni campaña. Estos sistemas no deben anunciarse como implementados.
