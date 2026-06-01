#!/usr/bin/env powershell
<#
.SYNOPSIS
    Verify Backend Setup Script for the Ethanol & Molasses Real-time Production Dashboard.
.DESCRIPTION
    This script performs sanity checks across the backend environment to ensure
    successful server operations. It validates:
      1. Virtual environment (.venv) presence
      2. Python launcher & version (Targeting Python 3.14+)
      3. Critical Django & DRF dependencies
      4. Database file structure (db.sqlite3)
      5. Django models integrity
      6. React node_modules packages
.EXAMPLE
    .\verify-setup.ps1
#>

# Usage: .\verify-setup.ps1

$ProjectRoot = "D:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Verifying Backend Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Virtual Environment
Write-Host "1️⃣  Virtual Environment..." -NoNewline
if (Test-Path "$ProjectRoot\.venv") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Run: py -3.14 -m venv .venv" -ForegroundColor Yellow
    $allGood = $false
}

# Check 2: Python Version
Write-Host "2️⃣  Python Version..." -NoNewline
try {
    $pythonVersion = & "$ProjectRoot\.venv\Scripts\python.exe" --version 2>&1
    if ($pythonVersion -match "3.14") {
        Write-Host " ✅ $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  $pythonVersion (3.14+ recommended)" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Django Installation
Write-Host "3️⃣  Django Installation..." -NoNewline
try {
    & "$ProjectRoot\.venv\Scripts\python.exe" -c "import django; print(django.VERSION)" 2>&1 | Out-Null
    $djangoVersion = & "$ProjectRoot\.venv\Scripts\python.exe" -c "import django; print(f'Django {django.__version__}')" 2>&1
    Write-Host " ✅ $djangoVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Run: pip install -r requirements.txt" -ForegroundColor Yellow
    $allGood = $false
}

# Check 4: Database
Write-Host "4️⃣  Database (db.sqlite3)..." -NoNewline
if (Test-Path "$ProjectRoot\db.sqlite3") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Run: python manage.py migrate" -ForegroundColor Yellow
    $allGood = $false
}

# Check 5: Requirements File
Write-Host "5️⃣  requirements.txt..." -NoNewline
if (Test-Path "$ProjectRoot\requirements.txt") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    $allGood = $false
}

# Check 6: Django Settings
Write-Host "6️⃣  Django Configuration..." -NoNewline
try {
    & "$ProjectRoot\.venv\Scripts\python.exe" "$ProjectRoot\manage.py" check 2>&1 | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Check output above" -ForegroundColor Yellow
}

# Check 7: Key Models
Write-Host "7️⃣  Database Models..." -NoNewline
try {
    $modelCheck = & "$ProjectRoot\.venv\Scripts\python.exe" -c "from ethanolapp.models import Profile, MolassesReading, ActivityLog, PasswordResetToken; print('OK')" 2>&1
    if ($modelCheck -eq "OK") {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌" -ForegroundColor Red
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allGood = $false
}

# Check 8: Frontend
Write-Host "8️⃣  Frontend (node_modules)..." -NoNewline
if (Test-Path "$ProjectRoot\ethanol\frontend\node_modules") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Not installed (run: cd ethanol\frontend && npm install)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ Backend is Ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Green
    Write-Host "  1. Backend: python manage.py runserver 8081" -ForegroundColor White
    Write-Host "  2. Frontend: cd ethanol\frontend && npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use: .\start-servers.ps1" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some issues detected - see above" -ForegroundColor Yellow
}
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
