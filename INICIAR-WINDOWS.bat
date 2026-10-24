@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul 2>&1
title DEAD ROAD 404 - Lanzador Windows (diagnostico)
cd /d "%~dp0"
if not exist "logs" mkdir "logs" >nul 2>&1
set "LOG=%CD%\logs\arranque-windows.log"
>"%LOG%" echo DEAD ROAD 404 - Diagnostico de inicio
>>"%LOG%" echo Carpeta: %CD%
echo.
echo ===========================================
echo  DEAD ROAD 404 - WINDOWS - FASE 19
 echo ===========================================
echo [INFO] Registro: "%LOG%"
echo.
if not exist "package.json" goto NO_PROJECT
where node.exe >nul 2>&1
if errorlevel 1 goto NO_NODE
where npm.cmd >nul 2>&1
if errorlevel 1 goto NO_NPM
for /f "delims=" %%V in ('node --version 2^>nul') do set "NODE_VERSION=%%V"
echo [INFO] Node: %NODE_VERSION%
>>"%LOG%" echo Node: %NODE_VERSION%
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=12)||(v[0]===20&&(v[1]>19||(v[1]===19&&v[2]>=0)))?0:1)"
if errorlevel 1 goto NODE_OLD
if not exist "node_modules\vite\bin\vite.js" (
 echo [INFO] Instalando dependencias. La primera vez necesita Internet...
 >>"%LOG%" echo ===== npm install =====
 call npm.cmd install --no-audit --no-fund --fetch-retries=1 --fetch-timeout=30000
 >>"%LOG%" echo npm install termino con codigo %ERRORLEVEL%
 if errorlevel 1 goto FAILED_INSTALL
)
echo [INFO] Comprobando compilacion...
>>"%LOG%" echo ===== npm run build =====
call npm.cmd run build
 >>"%LOG%" echo npm run build termino con codigo %ERRORLEVEL%
if errorlevel 1 goto FAILED_BUILD
set "DR404_URL=http://127.0.0.1:4173"
echo [INFO] Arrancando %DR404_URL%
echo [INFO] El navegador solo se abrira cuando el servidor responda.
rem Run polling in a separate windowless PowerShell process; server stays here.
start "" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\abrir-cuando-listo.ps1" -Url "%DR404_URL%"
call npm.cmd run dev -- --host 127.0.0.1 --port 4173 --strictPort
set "RC=%ERRORLEVEL%"
>>"%LOG%" echo El servidor termino con codigo %RC%.
if not "%RC%"=="0" goto FAILED_SERVER
echo [INFO] Servidor detenido.
goto DONE
:NO_PROJECT
echo [ERROR] No se encuentra package.json. Extrae el ZIP completo.
goto ERROR
:NO_NODE
echo [ERROR] No se encuentra Node.js. Instala Node.js 22 LTS y abre de nuevo el BAT.
goto ERROR
:NO_NPM
echo [ERROR] No se encuentra npm.cmd. Repara la instalacion de Node.js.
goto ERROR
:NODE_OLD
echo [ERROR] Version Node.js incompatible con Vite 7. Se recomienda Node.js 22 LTS actualizado.
goto ERROR
:FAILED_INSTALL
echo [ERROR] npm install ha fallado. Revisa la conexion, proxy y el fichero de registro.
goto ERROR
:FAILED_BUILD
echo [ERROR] La compilacion TypeScript/Vite ha fallado. El detalle esta en el registro.
goto ERROR
:FAILED_SERVER
echo [ERROR] Vite ha terminado con error. Consulta el texto mostrado arriba.
goto ERROR
:ERROR
>>"%LOG%" echo ERROR: comprueba el mensaje mostrado en la consola.
echo.
echo [IMPORTANTE] Adjunta este archivo si necesitas ayuda:
echo "%LOG%"
pause
exit /b 1
:DONE
pause
exit /b 0
