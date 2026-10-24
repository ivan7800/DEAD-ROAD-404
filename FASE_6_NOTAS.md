# Fase 6 — Vigilante de la estación

## Implementado
- Vigilante 3D procedural con patrulla, detección cercana, aproximación y ataque temporizado.
- Golpe cuerpo a cuerpo mediante espacio/F, distancia máxima y salud del enemigo.
- Daño al jugador integrado en la supervivencia.
- Estado del enemigo persistente en guardado con migración compatible de Fase 5.
- Efectos auditivos sintetizados mediante Web Audio después del primer clic.
- 7 pruebas nuevas de reglas de combate/guardado más regresión previa.

## Límites conocidos
- Arte procedural provisional y sin animación esquelética.
- La IA no navega con pathfinding; puede cruzar objetos sólidos.
- Combate no comprueba todavía obstáculos entre personaje y enemigo.
- Audio mínimo sintetizado, no banda sonora.
- Prueba de renderizado real y compilación pendientes hasta disponer de paquetes npm.
- REA no se ha ejecutado, solo se ha consultado su documentación.
