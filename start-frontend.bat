@echo off
title EHub Frontend (Port 5173)
echo ===================================================
echo [EHub] Starting Vite React UI on http://localhost:5173...
echo ===================================================
cd /d "%~dp0\ehub-ui"
call npm.cmd run dev
pause
