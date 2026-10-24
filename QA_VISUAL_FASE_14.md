# Protocolo de QA visual · Fase 14

Este documento es una **lista de comprobación para ejecutar en navegador real**, no un certificado de pruebas superadas.

## Prueba manual en Windows/Linux

1. `npm run build` termina sin errores. Abrir el juego desde el lanzador, no con `file://`.
2. En el menú, el Firebird y los letreros son visibles, sin lienzo negro ni errores en consola.
3. Conducir, cambiar cámaras (C) y verificar que la geometría de techo y salpicadero no ocluye toda la carretera.
4. Girar a velocidad, activar freno de mano (Espacio) y comprobar respuesta suave. Comparar G=rendimiento contra G=cine: polvo en cine/equilibrado, desactivado en rendimiento.
5. Comprobar que los pilotos se iluminan al frenar y los faros responden a L.
6. Visualizar autocine y postes desde la carretera. Se permite decoración estática, pero no parpadeo gráfico ni objetos que atraviesen el coche.
7. Abrir la tienda, escuchar R, recoger llave, hablar con Vera, recoger cinta y usar la cabina opcional.
8. Guardar y recargar con P; comprobar que no se escribe en clave F13.
9. Pulsar V: comparar estética. Activar preferencia del SO «Reducir movimiento»: VHS estático.
10. Pulsar F3, anotar métricas 30 s conducción + 30 s exploración, tres calidades. Si cae por debajo de 45 FPS sostenidos en el equipo objetivo, investigar draw calls, resolución y sombras antes de añadir más geometría.

## Evidencias a guardar

- Captura de cockpit y frontal, carretera y gasolinera.
- FPS medios y 1% bajo, draw calls y triángulos en cada preset.
- Consola del navegador (errores), versión Node, salida de `npm run build`.
- Sistema operativo, GPU y resolución de pantalla.

## Estado realizado aquí

- Pruebas automáticas de lógica: ejecutadas con `node --experimental-strip-types --test`.
- Comprobación sintáctica de módulos TypeScript: ejecutada con Node.
- Comprobación de shell Linux: `bash -n`.
- npm install / build completo / pruebas gráficas WebGL: **no completadas** debido a fallo DNS npm.
- REA: no ejecutado.
