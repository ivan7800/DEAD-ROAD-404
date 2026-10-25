# Fase 23 — El pueblo sin nombre

## Contenido implementado

Tercera localización independiente y explorable de DEAD ROAD 404, con estética PSX low-poly original, **sin modelos GLB externos, iluminación dinámica cara ni sombras**.

**Acceso:** tras concluir «Los que no regresan» en THE LAST LIGHT, conducir hasta **KM 48** y seleccionar **ENTRAR EN EL PUEBLO SIN NOMBRE** desde el mapa. El capítulo se marca disponible; IV–VI siguen bloqueados.

**Plano del pueblo (coordenadas de mundo):**
- Entrada: x12, z−29. Avenida principal hacia el norte del plano (z decreciente).
- Elías: x10, z−33. Personaje con decisión persistente: creerle (+2 raciones) o desconfiar (+1 pieza).
- Monumento: x7, z−36. Nombres de Mara y Vera, hora detenida 03:13.
- Generador: x24, z−38. Restablece la electricidad del archivo.
- Archivo municipal: x24, z−45. Revela el destino del pueblo y recuerda la decisión de THE LAST LIGHT.
- Panel del reloj: x12, z−48. Pistas 03:13; código exacto **0313**.
- Campanario: x12, z−55. Abre la puerta para revelar al **Campanero**.
- Suministros opcionales: x30, z−36; recompensa única de +20 salud y +1 pieza.
- Campanero: x15, z−57; 120 PV, dos ritmos, ataque telegrafiado mediante ojo amarillo, alcance, persecución y recuperación.

El pueblo contiene una avenida, cine clausurado, hotel vacío, farmacia, archivo municipal, capilla y torre del reloj. El material narrativo y el texto son originales. La historia incorpora consecuencias de haber emitido o enterrado la grabación del restaurante.

**Cierre:** transmitir los nombres (+12 L) o sellar el registro (+25 salud). El capítulo queda registrado en el diario, con control de idempotencia.

## Guardados y progresión

Se conserva formato `version:2` y clave `dead-road-404-f19-v2` para mantener compatibilidad. `chapterThree` incluye etapa, conversación con Elías, intentos del panel, vida del Campanero, caja y decisión. Los jugadores que llegan desde F22 sin ese objeto mantienen el antiguo desenlace del KM120, sin recibir artificialmente el capítulo III como completado. Las partidas nuevas lo requieren antes de ese desenlace.

La actividad de exploración usa colisiones propias; el resto del juego (conducción, F19–F22, mochila, controles y modalidad gráfica) sigue intacto.

## Controles y verificación

- [WASD] explorar, [flechas] girar, [E] interacciones, [F] luchar, [SHIFT] esquivar/acelerar, [I] mochila, [J] diario, [M] mapa, [G] calidad PSX
- `npm test`, `npm run build`, `node scripts/check-pages-build.mjs`, `npm run smoke`
- Chromium comprueba ingreso al pueblo, 3D, aproximación física al panel, código incorrecto y correcto, guardado y recarga.
- Las pruebas Node comprueban misión completa, migración, recompensas, colisiones, distancias y dos fases del enemigo.

## Limitaciones

Los capítulos IV–VI siguen sin desarrollar. La prueba Chromium del episodio llega hasta el panel del reloj; el combate entero y cada decisión final están cubiertos en pruebas de lógica, no todavía por una sesión visual de principio a fin. No se declara el juego como 9,5/10 hasta realizar QA integral y evaluación de contenido.
