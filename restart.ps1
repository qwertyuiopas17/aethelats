Write-Host "Killing processes on port 8000 (Backend)..." -ForegroundColor Yellow
$backendPids = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($backendPids) {
    foreach ($p in $backendPids) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process $p on port 8000." -ForegroundColor Green
    }
} else {
    Write-Host "No backend process found on port 8000." -ForegroundColor Gray
}

Write-Host "Killing processes on port 5173 (Frontend)..." -ForegroundColor Yellow
$frontendPids = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($frontendPids) {
    foreach ($p in $frontendPids) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process $p on port 5173." -ForegroundColor Green
    }
} else {
    Write-Host "No frontend process found on port 5173." -ForegroundColor Gray
}

Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0"
# Wait for backend to be ready
Write-Host "Waiting for backend to be reachable on port 8000..."
while (-not (Test-NetConnection -ComputerName localhost -Port 8000).TcpTestSucceeded) {
    Start-Sleep -Seconds 1
}
Write-Host "Backend is up. Starting Frontend..."

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Restart complete. Frontend and Backend are starting in new windows." -ForegroundColor Green
