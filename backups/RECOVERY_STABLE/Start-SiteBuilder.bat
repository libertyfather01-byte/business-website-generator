@echo off
title SiteBuilder AI Professional Engine
echo Launching SiteBuilder AI Professional Environment...
start http://localhost:8081/index.html
npx http-server . -p 8081 -c-1
