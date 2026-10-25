@echo off
setlocal EnableExtensions
title DEAD ROAD 404 - Benchmark GPU Windows
pushd "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo ERROR: Node.js no esta instalado o no figura en PATH.
 goto :fail
)
where npm >nul 2>nul
if errorlevel 1 (
 echo ERROR: npm no esta instalado o no figura en PATH.
 goto :fail
)
if not exist "node_modules\playwright" (
 echo Falta Playwright. Ejecuta primero:
 echo   npm install
 echo   npx playwright install chromium
 goto :fail
)
if "%~1"=="" (
 call npm run benchmark:gpu -- --repeats=3 --seconds=10
) else (
 call npm run benchmark:gpu -- %*
)
if errorlevel 1 goto :fail
echo.
echo Informes locales en artifacts\benchmarks\
goto :end
:fail
echo.
echo No se ha podido completar el benchmark. No se ha modificado el juego.
:end
popd
pause
endlocal
