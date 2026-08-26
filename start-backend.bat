@echo off
title EHub Backend (Port 8080)
echo ===================================================
echo [EHub] Starting Spring Boot REST Backend on port 8080...
echo ===================================================
cd /d "%~dp0\ehub-backend"
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
pause
