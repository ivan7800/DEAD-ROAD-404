@echo off
setlocal
cd /d "%~dp0"
where npm.cmd >nul 2>&1 || (echo [ERROR] npm no encontrado & pause & exit /b 1)
call npm.cmd install || (pause & exit /b 1)
call npm.cmd run check
set "rc=%errorlevel%"
echo Codigo de salida: %rc%
pause
exit /b %rc%
