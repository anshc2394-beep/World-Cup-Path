param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $Root "apps\api"
$WebDir = Join-Path $Root "apps\web"
$RuntimeDir = Join-Path $Root "tmp\local"
$PidFile = Join-Path $RuntimeDir "pids.json"
$VenvPython = Join-Path $ApiDir ".venv\Scripts\python.exe"

New-Item -ItemType Directory -Path $RuntimeDir -Force | Out-Null

function Test-Endpoint([string]$Url) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

function Test-PythonExecutable([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return $false }
    try {
        & $Path -c "import sys; assert sys.version_info >= (3, 12)" *> $null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

function Start-MinimizedCommand([string]$Name, [string]$Title, [string]$WorkingDirectory, [string]$Command) {
    $commandFile = Join-Path $RuntimeDir "run-$Name.cmd"
    $logFile = Join-Path $RuntimeDir "$Name.log"
    Set-Content -LiteralPath $logFile -Value "Starting $Title..." -Encoding UTF8
    @(
        "@echo off"
        "title $Title"
        "cd /d `"$WorkingDirectory`""
        "echo Logs: `"$logFile`""
        "$Command 1>>`"$logFile`" 2>>&1"
        "if errorlevel 1 ("
        "  echo."
        "  echo WorldCupPath could not start this service."
        "  echo Review this log file:"
        "  echo $logFile"
        "  echo."
        "  type `"$logFile`""
        "  echo."
        "  echo Review the message above, then press any key to close."
        "  pause ^>nul"
        ")"
    ) | Set-Content -LiteralPath $commandFile -Encoding ASCII

    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = "$env:SystemRoot\System32\cmd.exe"
    # cmd.exe needs the doubled outer quotes when a script path contains spaces.
    $info.Arguments = '/d /c ""' + $commandFile + '""'
    $info.WorkingDirectory = $WorkingDirectory
    $info.UseShellExecute = $true
    if ($NoBrowser) {
        $info.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    }
    else {
        $info.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Minimized
    }
    $process = [System.Diagnostics.Process]::Start($info)
    if (-not $process) { throw "Unable to start $Title" }
    return $process.Id
}

function Open-DefaultBrowser([string]$Url) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $Url
    $info.UseShellExecute = $true
    [System.Diagnostics.Process]::Start($info) | Out-Null
}

Write-Host ""
Write-Host "  WorldCupPath 2026 local launcher" -ForegroundColor Cyan
Write-Host "  --------------------------------" -ForegroundColor DarkCyan

if (-not (Test-PythonExecutable $VenvPython)) {
    if (Test-Path -LiteralPath (Join-Path $ApiDir ".venv")) {
        Write-Host "Refreshing a stale Python environment..." -ForegroundColor Yellow
        Remove-Item -LiteralPath (Join-Path $ApiDir ".venv") -Recurse -Force
    }
    Write-Host "Creating the Python environment..." -ForegroundColor Yellow
    $launcher = Get-Command py.exe -ErrorAction SilentlyContinue
    if ($launcher) {
        & $launcher.Source -3.12 -m venv (Join-Path $ApiDir ".venv")
    }
    else {
        $python = Get-Command python.exe -ErrorAction SilentlyContinue
        $bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
        if ($python -and (Test-PythonExecutable $python.Source)) {
            & $python.Source -m venv (Join-Path $ApiDir ".venv")
        }
        elseif (Test-PythonExecutable $bundledPython) {
            & $bundledPython -m venv (Join-Path $ApiDir ".venv")
        }
        else {
            throw "Python 3.12+ is required. Install it from https://www.python.org/downloads/ and run this launcher again."
        }
    }
    if ($LASTEXITCODE -ne 0) { throw "Python environment creation failed." }
}

$apiReady = Test-Endpoint "http://127.0.0.1:8000/api/health"
$webReady = Test-Endpoint "http://127.0.0.1:3000"

if (-not $apiReady) {
    Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
    $dependenciesReady = $false
    try {
        & $VenvPython -c "import fastapi, sqlalchemy, numpy, worldcup_simulator" *> $null
        $dependenciesReady = $LASTEXITCODE -eq 0
    }
    catch {
        $dependenciesReady = $false
    }
    if (-not $dependenciesReady) {
        $previousPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        Push-Location $ApiDir
        try {
            & $VenvPython -m pip install -r "requirements.txt"
            $installExitCode = $LASTEXITCODE
        }
        finally { Pop-Location }
        $ErrorActionPreference = $previousPreference
        if ($installExitCode -ne 0) { throw "Backend dependency installation failed." }
    }
}

if (-not $webReady) {
    $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $npm) {
        throw "Node.js 22+ is required. Install it from https://nodejs.org/ and run this launcher again."
    }
    if (-not (Test-Path -LiteralPath (Join-Path $WebDir "node_modules"))) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        Push-Location $WebDir
        try {
            $previousPreference = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            & $npm.Source install
            $installExitCode = $LASTEXITCODE
            $ErrorActionPreference = $previousPreference
        }
        finally { Pop-Location }
        if ($installExitCode -ne 0) { throw "Frontend dependency installation failed." }
    }
}

$pids = @{}
if (Test-Path -LiteralPath $PidFile) {
    try {
        $savedPids = Get-Content -LiteralPath $PidFile -Raw | ConvertFrom-Json
        foreach ($name in @("api", "web")) {
            $savedId = $savedPids.$name
            if ($savedId -and (Get-Process -Id $savedId -ErrorAction SilentlyContinue)) {
                $pids[$name] = $savedId
            }
        }
    }
    catch {
        # A damaged PID file should never stop the application from starting.
        $pids = @{}
    }
}
if (-not $apiReady) {
    Write-Host "Starting the API..." -ForegroundColor Green
    $pids.api = Start-MinimizedCommand "api" "WorldCupPath API" $ApiDir "`"$VenvPython`" -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
}
if (-not $webReady) {
    Write-Host "Starting the website..." -ForegroundColor Green
    $pids.web = Start-MinimizedCommand "web" "WorldCupPath Web" $WebDir "npm.cmd run dev -- --hostname 127.0.0.1"
}

$pids | ConvertTo-Json | Set-Content -LiteralPath $PidFile -Encoding UTF8

Write-Host "Waiting for localhost..." -ForegroundColor Yellow
$deadline = (Get-Date).AddSeconds(60)
do {
    Start-Sleep -Milliseconds 750
    $apiReady = Test-Endpoint "http://127.0.0.1:8000/api/health"
    $webReady = Test-Endpoint "http://127.0.0.1:3000"
} until (($apiReady -and $webReady) -or (Get-Date) -gt $deadline)

if (-not $apiReady -or -not $webReady) {
    throw "Startup timed out. Review tmp\local\api.log and tmp\local\web.log, or open the two minimized WorldCupPath windows."
}

Write-Host ""
Write-Host "WorldCupPath is ready at http://127.0.0.1:3000" -ForegroundColor Green
Write-Host "Use 'Stop WorldCupPath 2026.cmd' when you are finished." -ForegroundColor DarkGray

if ($NoBrowser) {
    Write-Host "Browser launch skipped for this run." -ForegroundColor DarkGray
}
else {
    Open-DefaultBrowser "http://127.0.0.1:3000"
}
