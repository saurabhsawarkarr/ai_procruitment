@echo off
echo ====================================================================
echo   AERCHAIN SOURCING INTELLIGENCE - INSTANT LIVE SHARE TUNNEL
echo ====================================================================
echo.
echo Spawning public Cloudflare HTTPS tunnel for http://localhost:8000 ...
echo A public https://*.trycloudflare.com link will appear below.
echo Share that link with any evaluator or stakeholder!
echo.
%~dp0backend\cloudflared.exe tunnel --url http://localhost:8000
pause
