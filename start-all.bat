@echo off
title EHub Platform Launcher
echo ===================================================
echo   🚀 Launching EHub Hackathon Management Platform
echo ===================================================
echo 1. Starting Backend in background window...
start "EHub Backend" cmd /c "%~dp0start-backend.bat"

echo 2. Starting Frontend in background window...
start "EHub Frontend" cmd /c "%~dp0start-frontend.bat"

echo.
echo All services launched!
echo Access the web UI at: http://localhost:5173
echo Backend REST API at: http://localhost:8080/api
echo.
pause
