@echo off
title EHub Backend (Port 8080)
echo ===================================================
echo [EHub] Starting Spring Boot REST Backend on port 8080...
echo ===================================================
if exist "%~dp0.env" (
    for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env") do (
        set "line=%%A"
        if not "%%A"=="" if not "!line:~0,1!"=="#" set "%%A=%%B"
    )
)

cd /d "%~dp0\ehub-backend"
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
pause
