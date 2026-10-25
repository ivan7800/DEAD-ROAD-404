# Fase 22 — Los que no regresan

## Alcance implementado

Nuevo capítulo **jugable** en el restaurante original PSX **THE LAST LIGHT**, accesible desde el mapa después de completar **La Última Parada** y recorrer al menos **24 km**.

El restaurante se ha modelado con geometría procedural low-poly, sin descargar GLB y sin sombras dinámicas. Usa el motor de exploración, colisiones por barrido, la mochila, guardado y controles existentes. Tiene salón, mesas, barra, cocina, un acceso al congelador, carteles retro, pistas y personajes visuales independientes.

### Guía de progresión
1. Entra en THE LAST LIGHT desde el mapa (botón desbloqueado después del capítulo I y KM 24). 
2. Busca la mesa junto a la ventana. Lee el **pedido de la mesa cuatro** [E]. La fecha es **19 OCT 1992**.
3. Puedes hablar con **Mara** [E], la antigua camarera: confiar en ella concede dos raciones; desconfiar cambia su diálogo. Es una decisión irreversible y persistente.
4. Activa el interruptor del neón del restaurante [E].
5. Examina el libro de huéspedes de la barra [E]: seis nombres tachados, uno coincide con el protagonista.
6. Introduce **1992** en la cerradura de cocina [E]. Los errores quedan registrados, pero no bloquean la partida.
7. Abre el congelador [E]; aparece **la Camarera Hueca**, una criatura low-poly con 90 PV, dos ritmos y ataques telegrafiados mediante ojo amarillo. Defiéndete con [F], corre con [SHIFT] y cura tus heridas con [I].
8. Decide si emites las voces desaparecidas (**+10 L de gasolina**) o entierras la cinta (**+2 piezas**). El capítulo II queda completado en el diario.
9. Tras ello, la carretera recupera sus desenlaces existentes. El capítulo III («El pueblo sin nombre») permanece bloqueado hasta implementarse.

### Seguridad de los guardados
Se conserva la clave **dead-road-404-f19-v2** y el formato `version:2`. Los nuevos datos `chapterTwo` registran progreso, conversación con Mara, intentos, salud de la criatura y decisión. La normalización limpia entradas inválidas y acepta versiones anteriores. Los usuarios con partidas F21 pueden seguir accediendo al epílogo clásico sin perder sus finales; eso **no** marca el capítulo II como completado.

### Limitaciones expresas
El restaurante y sus misiones constituyen un capítulo compacto; todavía no equivalen a una campaña de 6–8 horas. Los capítulos III–VI, cinematografía y contenido opcional extenso siguen pendientes. La estética PSX mantiene presupuestos reducidos, pero no garantiza FPS específicos en todos los dispositivos.

### Pruebas
Node: reglas de misión, guardados, acceso, IA telegráfica, colisiones y recompensas únicas. Chromium: renderizador, desplazamiento al restaurante, código, guardado/carga y controles.
