# Fase 9 — El peso de la noche

Esta iteración continúa sobre una COPIA de la Fase 8 y no modifica la instalación anterior.

## Cambios funcionales
- Linterna 3D orientada con la cámara en exploración, con tecla **T**.
- Sprint con **Shift**, resistencia (agotamiento y recuperación) calculada con delta de tiempo acotado.
- Diario de misión con **J**, que muestra el objetivo y la decisión narrativa tomada.
- Gasolinera enriquecida con señalización, aparcamiento, barriles, bolardos y neumáticos.
- HUD de resistencia y ayudas contextuales.
- Cuatro pruebas nuevas de lógica de exploración.

## Limitaciones
- El vehículo todavía emplea arte procedural. No se han incorporado modelos externos.
- La linterna no dispone de batería ni sombras volumétricas.
- No se ha ejecutado REA; su uso opcional se reserva para auditoría estática del proyecto propio.
- La compilación completa y la prueba gráfica requieren instalar las dependencias npm y ejecutar el juego en un navegador con WebGL.

## Verificación local
```bash
npm install
npm test
npm run build
npm run dev
```

En Windows usa INICIAR-WINDOWS.bat; en Linux Mint INICIAR-LINUX-MINT.sh.
