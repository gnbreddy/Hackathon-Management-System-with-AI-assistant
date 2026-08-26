@REM ----------------------------------------------------------------------------
@REM EHub Backend Maven Wrapper Script
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

set MAVEN_CMD=%DIRNAME%..\.tools\apache-maven-3.9.9\bin\mvn.cmd

if exist "%MAVEN_CMD%" (
    call "%MAVEN_CMD%" %*
) else (
    mvn.cmd %*
)
