@echo off
title Liberty Self Site Builder AI
echo ===================================================
echo   Liberty Self - Site Builder AI Professional
echo ===================================================
echo.
echo Launching local development environment...
echo Access your app at: http://localhost:8081
echo.
echo NOTE: This instance is isolated from MandateHub (Port 3000).
echo.
start http://localhost:8081/index.html
npx http-server . -p 8081 -c-1

