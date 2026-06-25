$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $Root "tmp\local\pids.json"

if (-not (Test-Path -LiteralPath $PidFile)) {
    Write-Host "No WorldCupPath launcher processes were recorded." -ForegroundColor Yellow
    exit 0
}

$pids = Get-Content -LiteralPath $PidFile -Raw | ConvertFrom-Json
$remaining = @{}
foreach ($name in @("web", "api")) {
    $processId = $pids.$name
    if ($processId -and (Get-Process -Id $processId -ErrorAction SilentlyContinue)) {
        & "$env:SystemRoot\System32\taskkill.exe" /PID $processId /T /F 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Stopped WorldCupPath $name." -ForegroundColor Green
        }
        else {
            $remaining[$name] = $processId
            Write-Host "Windows could not stop WorldCupPath $name automatically (PID $processId)." -ForegroundColor Yellow
        }
    }
}

if ($remaining.Count -gt 0) {
    $remaining | ConvertTo-Json | Set-Content -LiteralPath $PidFile -Encoding UTF8
    throw "Close the remaining minimized WorldCupPath window, then run this stop shortcut again."
}

Remove-Item -LiteralPath $PidFile -Force
Write-Host "WorldCupPath is stopped." -ForegroundColor Cyan
