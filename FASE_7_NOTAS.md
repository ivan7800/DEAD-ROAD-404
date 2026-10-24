# DEAD ROAD 404 — Fase 7 (v0.7.0)

## Cambios implementados
- IA del Vigilante: detección por línea visual, movimiento con comprobación de obstáculos y colisiones con geometría del local. No incluye búsqueda de rutas completa (A*).
- Ataque cuerpo a cuerpo orientado: solo golpea objetivos dentro de un cono frontal; retroceso y aturdimiento breve.
- Iluminación dinámica de impacto y daño.
- Capa ambiental sintetizada de baja intensidad, iniciada tras clic del usuario (política de audio del navegador).
- Nuevas pruebas de navegación y orientación del ataque.
- Se conservan partida, cámaras, viaje, lanzadores y recursos.

## Limitaciones
- La física sigue siendo arcade simplificada. La IA puede quedar temporalmente detenida frente a obstáculos; no existe navegación por malla.
- La señal sonora es sintética, no es una banda sonora terminada.
- No se ha verificado el renderizado en un navegador real ni la ejecución de Windows, por falta de compilación de dependencias en este entorno.
- No se ejecutó REA: su documentación se consultó para seleccionar un análisis estático adecuado si se habilita posteriormente.

## Validación local
`npm test` y `npm run build`. Si npm no puede descargar dependencias, ejecutar la instalación en Windows/Mint con conexión y conservar el log del lanzador.
