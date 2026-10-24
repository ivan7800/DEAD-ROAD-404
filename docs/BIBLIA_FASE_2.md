# DEAD ROAD 404 — Biblia de producción v0.2

## Premisa

1978, un Estados Unidos ficticio y maldito. Cuatro supervivientes atraviesan una carretera que altera distancias y recuerdos. Un Pontiac Firebird Trans Am negro y dorado es hogar, herramienta y fuente de problemas: hermoso, rápido, ruidoso, gastón y con poco maletero. La carretera ofrece encuentros criminales absurdos, conversaciones de humor negro, violencia estilizada, decisiones duras y terror cósmico progresivo.

## Pilares (orden de prioridad)

1. Viaje significativo: cada tramo consume recursos y presenta una elección.
2. Alternancia híbrida: mapa estratégico ↔ conducción arcade ↔ exploración 3D en primera persona.
3. Atmósfera propia: retro 3D deliberado, materiales austeros, niebla, luz dramática, música original surf/noir/ambient (pendiente).
4. Compañeros memorables y conversaciones con tensión, ritmo y humor seco; inspiración de cine de carretera y grindhouse, **sin imitar guiones concretos ni personajes de autores vivos**.
5. Horror creciente: al inicio infectados y forajidos; más adelante anomalías y sectas; nada depende exclusivamente de jumpscares.

## Bucles

- **Macro**: consultar mapa → decidir destino → viajar → evento → reabastecer → consecuencias → progreso.
- **Mesosistema**: detener Firebird → inspeccionar localización → intercambiar/registrar/riesgo → regresar al vehículo.
- **Micro**: observar → escuchar → administrar luz y recursos → interactuar → escapar o luchar.

## Acto I: Camino que recuerda

Capítulo 1: La Última Parada. La emisora advierte que no se recoja a nadie en el km 404. Combustible inicial 44 L; un bidón espera a la vista de la estación. En carretera, la señalización se repite.
Capítulo 2: Cena para dos cadáveres (previsto). Restaurante de carretera con conversación ramificada.
Capítulo 3: La deuda del sheriff (previsto). Western criminal y primer enfrentamiento.

Actos II y III quedan abiertos a desarrollo por hitos y se documentarán antes de producir decenas de escenarios.

## Vehículos

Firebird 1977/78 visual provisional; dirección arcade, aceleración/inercia y gasto de combustible dependiente de distancia. Futuro: sonido, daños, interior, suspensión, cámaras, mejoras y otros coches con estadísticas distintas. Se usarán recursos originales y tratamiento prudente de nombres/marcas.

## Dirección artística

Low-poly deliberado PS1/PC 1990s, contornos angulosos, sombras suaves limitadas, paleta ciruela/óxido/dorado, luz cálida en zonas de sospechosa seguridad. Objetivo visual atmosférico, no fidelidad literal a Lunacid. Más adelante: texturas pixeladas originales, UI más sofisticada, efectos climáticos y audio reactivo.

## Criterios de aceptación de Fase 2

- [x] Proyecto modular TypeScript y declaración Three.js/Vite.
- [x] Escenario tridimensional original programado: carretera, terreno, gasolinera, surtidores y decoración.
- [x] Firebird provisional 3D y control de conducción arcade.
- [x] Primera persona con cámara por ratón y movimiento WASD.
- [x] Recurso interactivo, consumo y guardado versionado.
- [x] Pruebas unitarias de estado y economía.
- [ ] Build verificado con `npm install && npm run build`.
- [ ] Prueba de navegador real y mediciones FPS en dispositivos objetivo.
- [ ] Arte de producción, audio, UI final, combate y campaña completa.

## Calidad esperada

Objetivos: navegador PC estable ~60 FPS, adaptación a hardware de gama baja mediante escalado, ninguna excepción en consola, cero regresiones en save/travel/interacción, teclado operativo, rutas de publicación correctas. Ninguna cifra de rendimiento se da por alcanzada sin medición.

## Estrategia posterior

Fase 3: movimiento/colisiones más refinados, interior explorable, vehículos con pivotes correctos, NPC inicial y vertical slice con objetivo y final concretos. Fase 4: IA y combate. Fase 5: campaña. Fase 6: QA, rendimiento y distribución de escritorio.
