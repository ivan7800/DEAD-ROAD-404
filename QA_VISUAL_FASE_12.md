# Auditoría visual y rendimiento · Fase 12

**Estado:** preparada, aún no ejecutada en Windows real.

## 1. Arranque

1. Descomprimir en `C:\Juegos\DEAD-ROAD-404-FASE-12` conservando la Fase 11.
2. Ejecutar `INICIAR-WINDOWS.bat` y comprobar que npm instala, Vite compila y la página aparece sin errores de consola.
3. Confirmar que `http://127.0.0.1:4173` abre con el menú y la carretera.

## 2. Capturas comparables

Con resolución 1920×1080 (si está disponible), tomar captura **A** en el menú, **B** conduciendo en modo persecución, **C** en cockpit, **D** en el interior de la tienda y **E** frente al motel. Repetir A-E en la Fase 11 para comparar silueta, materiales, lectura de luces, estructura, texturas, densidad ambiental y errores gráficos. Anotar si aparecen transparencias raras, parpadeos, sombras bloqueadas o colisiones.

## 3. Prueba funcional

- Menú: conducir, explorar, cargar, guardar, nueva partida.
- Firebird: acelerar/frenar/girar, C para alternar cuatro cámaras, L para faros, agujas de salpicadero y motor audible.
- Estación: abrir la puerta, buscar radio, llave, bidón y entrar a las habitaciones del motel.
- Combate: el Vigilante no atraviesa muros, solo golpea a distancia válida, respeta las paredes y deja de moverse tras morir.
- Historia: radio → llave → Vera; guardar y recuperar; la cinta del motel no vuelve a recompensar tras cargar.
- Interfaz: G alterna los tres perfiles, conserva la opción tras recargar; F3 activa medidor de rendimiento; T linterna, Shift correr, J diario.

## 4. Medición

1. Pulsa **F3** y espera varios segundos para que se llene la ventana de muestras.
2. Registrar FPS y llamadas de dibujo en 3 escenas por separado: mapa, conducción y tienda.
3. Comparar los perfiles **rendimiento/equilibrado/cinematográfico** en la misma resolución, evitando pestañas en segundo plano.
4. Objetivo: **≥45 FPS sostenidos** en el equipo de destino, sin bloquear la interacción. No existe todavía medición validada; el objetivo no equivale a éxito.
5. Si cae por debajo de 45 FPS, utilizar **G → RENDIMIENTO**, anotar llamadas de dibujo y comprobar que se reducen sombras y pixel ratio.

## 5. Clasificación del resultado

Registrar **PASÓ / FALLÓ / NO PROBADO** para cada prueba, con captura y error de consola correspondiente. No declarar validada una fase por pasar únicamente `npm test`.
