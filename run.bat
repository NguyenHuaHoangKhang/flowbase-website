@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul
title FLOWBASE Studio

echo ======================================================
echo    FLOWBASE STUDIO - HE THONG QUAN TRI DOANH NGHIEP
echo ======================================================
echo.

if not exist ".env" (
    echo [*] Chua tim thay .env, dang khoi tao tu .env.example...
    copy .env.example .env >nul
    echo [v] Da tao file .env thanh cong.
    echo.
)

echo Chon che do khoi dong:
echo   [1] May chu phat trien (npm run dev) - Tu dong chon sau 5 giay
echo   [2] May chu production (Build va Start)
echo   [3] Chay toan bo 9 bo test tu dong (npm run test:all)
echo   [4] Mo giao dien database Prisma Studio (npm run db:studio)
echo   [5] Thoat
echo.

choice /c 12345 /d 1 /t 5 /m "Nhap lua chon [1-5]"
if errorlevel 5 exit /b 0
if errorlevel 4 goto studio
if errorlevel 3 goto test
if errorlevel 2 goto prod
if errorlevel 1 goto dev

:dev
echo.
echo [*] Dang khoi dong Development Server...
echo [*] Ung dung se mo tai: http://localhost:3000
echo [*] Trang quan tri:     http://localhost:3000/admin
echo [*] Nhan Ctrl + C de dung may chu.
echo.
start http://localhost:3000
call npm run dev
goto done

:prod
echo.
echo [*] Dang dong goi ban dung Production...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Dong goi that bai!
    goto done
)
echo.
echo [*] Dang khoi dong Production Server tai http://localhost:3000...
start http://localhost:3000
call npm run start
goto done

:test
echo.
echo [*] Dang chay toan bo 9 bo test tu dong (298 test cases)...
call npm run test:all
goto done

:studio
echo.
echo [*] Dang mo Prisma Studio tai http://localhost:5555...
start http://localhost:5555
call npm run db:studio
goto done

:done
echo.
echo ======================================================
echo May chu da ket thuc.
pause