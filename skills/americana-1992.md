# Skill de producción: Americana 1992

## Función
Mantener la coherencia visual y narrativa de DEAD ROAD 404, sin suplantar pruebas reales.

## Directrices
- Referencias de época: documentación de `docs/FASE_13_DIRECCION.md` y paleta JSON. No copiar assets, diálogos, música ni identidades protegidas.
- Preservar el recorrido radio → llave → Vera, las cuatro cámaras del coche, el guardado y el flujo mapa/exploración/conducción.
- Revisar siluetas, materiales, iluminación, señalización, funciones de colisión y accesibilidad de cada prop nuevo.
- Evitar añadir luces dinámicas innecesarias: evaluar draw calls y FPS antes de multiplicar efectos.
- Pruebas obligatorias: `npm test`, `npm run build` donde haya dependencias, recorrido real y capturas.
- Las métricas tomadas sobre una máquina se anotarán con resolución, GPU, navegador, preset y FPS.
- No declarar «9,5/10» ni «estable» sin las pruebas integrales correspondientes.
