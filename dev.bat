@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul
title FLOWBASE Dev Server

echo ======================================================
echo    FLOWBASE DEV SERVER - KHOI DONG TRUC TIEP
echo ======================================================
echo.

if not exist ".env" (
    copy .env.example .env >nul
)

echo [*] Dang khoi dong may chu tai http://localhost:3000...
echo [*] Trang quan tri: http://localhost:3000/admin
echo.
start http://localhost:3000
call npm run dev

echo.
echo May chu da dung.
pause