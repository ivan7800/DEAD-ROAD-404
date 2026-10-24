# DEAD ROAD 404 — Fase 8 (vertical slice)

## Alcance implementado

- Copia independiente de la Fase 7; no modifica los ZIP originales.
- Misión de tres hitos en La Última Parada: escuchar la radio tras el mostrador (`R`), recuperar la Llave 404 tras las neveras (`E`), hablar con Vera en el motel (`E`).
- Tres desenlaces con costes distintos: llevar a Vera, exigir pago o marcharse. Las recompensas no pueden repetirse.
- Objetivos contextuales en HUD, nuevas señales y atrezo procedural, figura de Vera, representación de llave y señalización del motel.
- Estado de misión integrado en los guardados antiguos (campo opcional con valores por defecto comprobados).
- Continuidad de conducción arcade, Firebird y cámaras, combate contra Vigilante, encuentro de carretera y recursos de fases anteriores.
- Mejoras de jerarquía de interfaz, opciones de accesibilidad CSS y texto de introducción.

## Controles

- Menú: conducir, explorar, nueva partida, guardar, cargar.
- Explorar: WASD/flechas, clic en el canvas para ratón, R para radio (cerca del mostrador), E para objetos/diálogo, Espacio o F para atacar, M para mapa, P para guardar.
- Conducir: WASD/flechas, C cámaras, L luces, M mapa.
- Si el navegador captura el ratón, ESC lo libera.

## Ruta de prueba manual

1. Abrir menú y entrar en la gasolinera.
2. Acceder por la abertura central; llegar hasta el mostrador y pulsar R a menos de cuatro metros.
3. Acercarse por el pasillo a las neveras (coordenadas aproximadas 19,-8.4); recoger la llave con E.
4. Salir y caminar hacia el motel (aprox. -20,-40); elegir una de las tres opciones al hablar con Vera.
5. Verificar mensaje de capítulo completado; guardar con P, volver al mapa con M y cargar partida.
6. Verificar persistencia de la decisión y que no se entrega otra recompensa.
7. Probar conducción, C, L, regreso a mapa, vigilancia/combate y encuentro a los 24 km.

## Verificación realizada en el entorno de generación

- 35 pruebas de Node superadas, incluidas 6 de misión.
- Sintaxis del lanzador Linux validada con `bash -n`.
- Archivos fuente y ZIP inspeccionados.
- No se realizó instalación, compilación TypeScript/Vite ni prueba WebGL real: la caché npm no contiene `@types/three`; esto no demuestra que la compilación sea correcta.
- No se ejecutó REA. Según la documentación de REA aportada, un posible análisis estático en el equipo con REA instalado es `rea analyze-javascript-application <ruta> --json`.

## Límites honestos

Esta es una **vertical slice ampliada**, no una campaña terminada ni un salto a modelados 3D de calidad comercial. El Firebird continúa siendo procedural, hay un enemigo combatible, Vera es una figura estática, y el motel es por ahora una fachada. No hay voces profesionales, cinemáticas ni interior del motel. Los cambios artísticos son incrementales y requieren evaluación visual real.

## Arranque y aislamiento

Descomprimir en `C:\Juegos\DEAD-ROAD-404-FASE-8\DEAD-ROAD-404`, separado de la copia estable, fuera de Google Drive. Ejecutar `INICIAR-WINDOWS.bat`. En Linux Mint, `chmod +x INICIAR-LINUX-MINT.sh && ./INICIAR-LINUX-MINT.sh`. Para un diagnóstico: `npm run build` y después `npm test`. No copiar `node_modules` desde otra instalación. Los guardados comparten la clave `dead-road-404-v2` del origen local: si se abre en el mismo puerto/origen, pueden ser compartidos; exportar/copiar los datos antes de pruebas destructivas.
