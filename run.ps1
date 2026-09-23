# FLOWBASE Launcher Script for PowerShell
param (
    [switch]$Dev,
    [switch]$Prod,
    [switch]$Test,
    [switch]$Studio
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "FLOWBASE — From Spreadsheet to Software"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   FLOWBASE STUDIO — HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra .env
if (-not (Test-Path ".env")) {
    Write-Host "[*] Chưa tìm thấy .env, đang khởi tạo từ .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[v] Đã khởi tạo file .env thành công." -ForegroundColor Green
}

# 2. Xử lý cờ tham số (arguments)
if ($Dev) {
    Start-Process "http://localhost:3000"
    npm run dev
    exit
}
if ($Prod) {
    npm run build
    Start-Process "http://localhost:3000"
    npm run start
    exit
}
if ($Test) {
    npm run test:all
    exit
}
if ($Studio) {
    Start-Process "http://localhost:5555"
    npm run db:studio
    exit
}

# 3. Menu tương tác
Write-Host "Chọn chế độ khởi động:" -ForegroundColor White
Write-Host "  [1] Máy chủ phát triển (Dev: npm run dev) - Mặc định" -ForegroundColor Green
Write-Host "  [2] Máy chủ production (Build & Start: npm run build && npm run start)" -ForegroundColor Yellow
Write-Host "  [3] Chạy toàn bộ 9 bộ kiểm thử tự động (npm run test:all)" -ForegroundColor Blue
Write-Host "  [4] Mở giao diện quản trị cơ sở dữ liệu Prisma Studio (npm run db:studio)" -ForegroundColor Magenta
Write-Host "  [5] Thoát" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Nhập lựa chọn [1-5] (Nhấn Enter để chọn mặc định 1)"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

switch ($choice) {
    "1" {
        Write-Host "`n[*] Đang khởi động Development Server..." -ForegroundColor Green
        Write-Host "[*] Trang chủ:        http://localhost:3000" -ForegroundColor Green
        Write-Host "[*] Trang quản trị:   http://localhost:3000/admin" -ForegroundColor Green
        Start-Process "http://localhost:3000"
        npm run dev
    }
    "2" {
        Write-Host "`n[*] Đang đóng gói bản dựng tối ưu..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[*] Đang khởi động Production Server tại http://localhost:3000..." -ForegroundColor Yellow
            Start-Process "http://localhost:3000"
            npm run start
        }
    }
    "3" {
        Write-Host "`n[*] Đang chạy 9 bộ test tự động (298 test cases)..." -ForegroundColor Blue
        npm run test:all
    }
    "4" {
        Write-Host "`n[*] Đang khởi động Prisma Studio tại http://localhost:5555..." -ForegroundColor Magenta
        Start-Process "http://localhost:5555"
        npm run db:studio
    }
    default {
        Write-Host "Đã thoát chương trình." -ForegroundColor Gray
    }
}
