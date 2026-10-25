# Fase 21 — La Última Parada: expansión jugable del primer capítulo

## Escenarios existentes y nueva ruta
La gasolinera SUNSPUR y el motel MILE 404 siguen en estilo PSX 240p. No se descargan GLB pesados.

1. Explora SUNSPUR. Escucha la radio [R] desde el mostrador; recoge la llave de la trastienda [E].
2. Habla con Vera frente al motel [E] y elige una de las tres decisiones anteriores (rescate, pago o abandono).
3. Busca **el fusible** a la derecha de los surtidores, x25 z7 [E]. Su etiqueta apunta a las 02:17.
4. Vuelve al **cuadro eléctrico** delante de SUNSPUR, x14 z5 [E]. Introduce el fusible.
5. Sintoniza 170, 217 o 404 kHz. La pista es la hora congelada **02:17**: el código correcto es 217.
6. Regresa al **registro del motel**, x−20 z−36 [E] y abre la escotilla.
7. Se alza **el Celador de la Frecuencia**: jefe PSX de 120 puntos de vida y dos fases. En su ojo aparece un destello amarillo antes de atacar. Ataca con [F] mirando hacia él, corre con Shift y utiliza la mochila [I] si necesitas curarte.
8. Elige **quemar** o **conservar** la transmisión; cada decisión produce recursos y un hito distintos. El capítulo queda completado en el diario [J].
9. La carretera y los tres desenlaces existentes siguen disponibles al alcanzar 120 km, únicamente después de cerrar el capítulo.

## Compatibilidad
- Save `dead-road-404-f19-v2`, versión 2, compatible con F19 y F20.
- Partidas antiguas con misión de Vera ya resuelta reciben estado `complete` para no sufrir bloqueos retroactivos. Partidas nuevas empiezan la ruta extendida.
- La salud restante del jefe, frecuencia equivocada e elección final se guardan; recargar nunca duplica recompensas.
- Los capítulos II–VI **no están implementados**. No se confunde esta misión expandida con la campaña total 1.0.

## QA
`npm test`, `npm run build`, verificación Pages y prueba Chromium desde el bundle de producción.
Las pruebas Node cubren las restricciones del puzle, migración, recompensa única, ataque anunciado, alcance, evasión y segunda fase del jefe.
Chromium verifica controles reales sin inventar métricas de FPS de una GPU dedicada.

## Pendiente para el 9,5/10
Más variantes de interiores, animaciones y ataques del jefe, música, subtítulos y pruebas de accesibilidad completas. La Fase 21 añade un arco con principio y cierre, pero no sustituye las fases 22–27.
