@echo off
setlocal EnableExtensions
title DEAD ROAD 404 - QA FASE 33 (Windows)
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :node_error
where npm >nul 2>nul
if errorlevel 1 goto :node_error
:menu
cls
echo ================================================
echo  DEAD ROAD 404 - FASE 33 - CONTROL DE CALIDAD
echo ================================================
echo [1] Preparar dependencias y navegador
echo [2] Capturas de los seis capitulos (PSX)
echo [3] Estabilidad 20 minutos (Windows local)
echo [4] Benchmark GPU fisica
echo [5] Ejecutar pruebas Node y compilacion
echo [0] Salir
echo.
set /p CHOICE=Selecciona una opcion: 
if "%CHOICE%"=="0" goto :end
if "%CHOICE%"=="1" (
  call npm ci
  if errorlevel 1 goto :failure
  call npx playwright install chromium
  if errorlevel 1 goto :failure
  goto :ok
)
if "%CHOICE%"=="2" (
  call npm run build
  if errorlevel 1 goto :failure
  call npm run qa:visual
  if errorlevel 1 goto :failure
  goto :ok
)
if "%CHOICE%"=="3" (
  call npm run build
  if errorlevel 1 goto :failure
  call npm run qa:stability -- --minutes=20
  if errorlevel 1 goto :failure
  goto :ok
)
if "%CHOICE%"=="4" (
  call npm run benchmark:gpu -- --repeats=3 --seconds=10 --require-hardware
  if errorlevel 1 goto :failure
  goto :ok
)
if "%CHOICE%"=="5" (
  call npm test
  if errorlevel 1 goto :failure
  call npm run build
  if errorlevel 1 goto :failure
  goto :ok
)
echo Opcion no reconocida.
pause
goto :menu
:ok
echo.
echo Prueba completada. Capturas e informes en artifacts\
pause
goto :menu
:node_error
echo Necesitas Node.js 22 o superior y npm en PATH.
goto :end_pause
:failure
echo.
echo Ha fallado una prueba. Revisa el error mostrado arriba.
echo La partida publicada en GitHub Pages no se modifica.
:end_pause
pause
:end
endlocal
