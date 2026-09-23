@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion
title FLOWBASE ? From Spreadsheet to Software

echo ======================================================
echo    FLOWBASE STUDIO ? H? TH?NG QU?N TR? DOANH NGHI?P
echo ======================================================
echo.

:: 1. Ki?m tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] L?i: M?y t?nh ch?a c?i ??t Node.js.
    echo Vui l?ng t?i v? c?i ??t Node.js t?i: https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Ki?m tra file c?u h?nh .env
if not exist ".env" (
    echo [*] Ch?a t?m th?y file .env, ?ang kh?i t?o t? .env.example...
    copy .env.example .env >nul
    echo [v] ?? kh?i t?o file .env th?nh c?ng.
)

:: 3. Menu tu? ch?n
echo Ch?n ch? ?? kh?i ??ng:
echo   [1] M?y ch? ph?t tri?n (Dev: npm run dev) - M?c ??nh
echo   [2] M?y ch? production (Build ^& Start: npm run build ^&^& npm run start)
echo   [3] Ch?y to?n b? 9 b? ki?m th? t? ??ng (npm run test:all)
echo   [4] M? giao di?n qu?n tr? c? s? d? li?u Prisma Studio (npm run db:studio)
echo   [5] Tho?t
echo.

set /p choice="Nh?p l?a ch?n [1-5] (Nh?n Enter ?? ch?n m?c ??nh 1): "
if "%choice%"=="" set choice=1

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto prod
if "%choice%"=="3" goto test
if "%choice%"=="4" goto studio
if "%choice%"=="5" exit /b 0

echo L?a ch?n kh?ng h?p l?, t? ??ng kh?i ch?y ch? ?? Dev...
goto dev

:dev
echo.
echo [*] ?ang kh?i ??ng Development Server...
echo [*] Trang ch?:        http://localhost:3000
echo [*] Trang qu?n tr?:   http://localhost:3000/admin
echo [*] Nh?n Ctrl + C ?? d?ng m?y ch? b?t k? l?c n?o.
echo.
start http://localhost:3000
npm run dev
goto end

:prod
echo.
echo [*] ?ang ??ng g?i b?n d?ng t?i ?u (Production build)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [!] ??ng g?i th?t b?i. Vui l?ng ki?m tra log l?i.
    pause
    exit /b 1
)
echo.
echo [*] ?ang kh?i ??ng m?y ch? Production...
start http://localhost:3000
npm run start
goto end

:test
echo.
echo [*] ?ang ch?y to?n b? 9 b? test t?ch h?p (298 test cases)...
call npm run test:all
pause
goto end

:studio
echo.
echo [*] ?ang m? Prisma Studio...
start http://localhost:5555
call npm run db:studio
goto end

:end
