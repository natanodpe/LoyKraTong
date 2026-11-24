@echo off
title Loy Krathong Digital Server
cd /d "%~dp0"
echo ========================================================
echo   Loy Krathong Digital - Starting Server...
echo ========================================================
echo.
echo Opening web browser at http://localhost:3000 ...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo Server is running! (Do not close this window while using)
echo.
node server.js
pause
