@echo off
title HECTORGYM - Sistema
color 0A

echo.
echo  =============================================
echo   HECTORGYM - Iniciando sistema...
echo  =============================================
echo.

:: Iniciar backend
echo  [1/2] Iniciando servidor backend...
start "HECTORGYM Backend" cmd /k "cd /d c:\programa de gym\backend && npm start"

:: Esperar a que el backend arranque
timeout /t 4 /nobreak >nul

:: Iniciar tunel Cloudflare
echo  [2/2] Iniciando tunel Cloudflare...
start "HECTORGYM Tunnel" cmd /k "c:\programa de gym\cloudflared.exe tunnel --url http://localhost:3000 2>&1"

echo.
echo  =============================================
echo   Sistema iniciado!
echo   Local:   http://localhost:3000
echo   Busca la URL publica en la ventana "Tunnel"
echo   (linea que empieza con https://...)
echo  =============================================
echo.
echo  Presiona cualquier tecla para abrir el panel...
pause >nul
start "" "http://localhost:3000/login.html"
