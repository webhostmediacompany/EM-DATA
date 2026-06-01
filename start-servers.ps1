#!/usr/bin/env powershell
<#
.SYNOPSIS
    Start Backend and Frontend Development Servers.
.DESCRIPTION
    Automated launcher that boots:
      1. Django rest-framework & Channels backend server on port 8081.
      2. Vite-powered React hot-reload dev-server on port 5173.
    Ensures venv setup and auto-runs missing database migrations.
.EXAMPLE
    .\start-servers.ps1
#>

# Usage: .\start-servers.ps1

$ProjectRoot = "D:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main"
$FrontendPath = "$ProjectRoot\ethanol\frontend"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Development Servers" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if venv exists
if (-not (Test-Path "$ProjectRoot\.venv")) {
    Write-Host "ERROR: Virtual environment not found at .\.venv" -ForegroundColor Red
    Write-Host "Please run setup first:" -ForegroundColor Yellow
    Write-Host "  py -3.14 -m venv .venv" -ForegroundColor Yellow
    Write-Host "  .\.venv\Scripts\activate" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Verify database exists
if (-not (Test-Path "$ProjectRoot\db.sqlite3")) {
    Write-Host "WARNING: Database not found" -ForegroundColor Yellow
    Write-Host "Running migrations..." -ForegroundColor Yellow
    & "$ProjectRoot\.venv\Scripts\python.exe" "$ProjectRoot\manage.py" migrate
    Write-Host ""
}

Write-Host "1. Starting Backend Server on http://127.0.0.1:8081" -ForegroundColor Green
Write-Host "   (Press Ctrl+C to stop)" -ForegroundColor Gray
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; .\.venv\Scripts\activate; python manage.py runserver 8081" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "2. Starting Frontend Server on http://localhost:5173" -ForegroundColor Green
Write-Host "   (Press Ctrl+C to stop)" -ForegroundColor Gray
Write-Host ""

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Both servers started!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://127.0.0.1:8081" -ForegroundColor White
Write-Host "   Admin:    http://127.0.0.1:8081/admin" -ForegroundColor White
Write-Host ""
Write-Host "🔗 WebSocket:" -ForegroundColor Cyan
Write-Host "   ws://127.0.0.1:8081/ws/readings/" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Check frontend console for logs (F12)" -ForegroundColor Gray
Write-Host "   - Check backend terminal for API logs" -ForegroundColor Gray
Write-Host "   - Both windows will close when servers stop" -ForegroundColor Gray
Write-Host ""
