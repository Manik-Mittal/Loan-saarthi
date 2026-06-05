param(
    [int]$BackendPort = 5001,
    [ValidateSet("lan", "tunnel")]
    [string]$ExpoMode = "lan"
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "backend"
$MobileDir = Join-Path $RootDir "mobile-app"
$MobileEnvPath = Join-Path $MobileDir ".env"
$BackendOut = Join-Path $BackendDir "backend.out.log"
$BackendErr = Join-Path $BackendDir "backend.err.log"
$TunnelOut = Join-Path $MobileDir "backend-tunnel.out.log"
$TunnelErr = Join-Path $MobileDir "backend-tunnel.err.log"
$ExpoOut = Join-Path $MobileDir "expo.out.log"
$ExpoErr = Join-Path $MobileDir "expo.err.log"

function Test-Backend {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/" -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    } catch {
        return $false
    }
}

function Update-MobileEnv {
    param([string]$ApiUrl)

    if (Test-Path $MobileEnvPath) {
        $content = Get-Content $MobileEnvPath
    } else {
        $content = @()
    }

    $updated = $false
    $next = @(
        foreach ($line in $content) {
            if ($line -match "^EXPO_PUBLIC_API_URL=") {
                $updated = $true
                "EXPO_PUBLIC_API_URL=$ApiUrl"
            } else {
                $line
            }
        }
    )

    if (-not $updated) {
        $next += "EXPO_PUBLIC_API_URL=$ApiUrl"
    }

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllLines($MobileEnvPath, $next, $encoding)
}

if (-not (Test-Backend)) {
    Write-Host "Starting backend on port $BackendPort..."
    Remove-Item -LiteralPath $BackendOut, $BackendErr -ErrorAction SilentlyContinue
    Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "start") -WorkingDirectory $BackendDir -RedirectStandardOutput $BackendOut -RedirectStandardError $BackendErr -WindowStyle Hidden | Out-Null
    Start-Sleep -Seconds 5

    if (-not (Test-Backend)) {
        throw "Backend did not start. Check $BackendOut and $BackendErr."
    }
}

Write-Host "Starting backend Cloudflare quick tunnel..."
Remove-Item -LiteralPath $TunnelOut, $TunnelErr -ErrorAction SilentlyContinue
$tunnel = Start-Process -FilePath "npx.cmd" -ArgumentList @("--yes", "cloudflared", "tunnel", "--url", "http://127.0.0.1:$BackendPort") -WorkingDirectory $MobileDir -RedirectStandardOutput $TunnelOut -RedirectStandardError $TunnelErr -WindowStyle Hidden -PassThru

$tunnelUrl = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if ($tunnel.HasExited) {
        throw "Cloudflare tunnel exited early. Check $TunnelOut and $TunnelErr."
    }

    $logs = @()
    if (Test-Path $TunnelOut) {
        $logs += Get-Content $TunnelOut
    }
    if (Test-Path $TunnelErr) {
        $logs += Get-Content $TunnelErr
    }

    $line = $logs | Select-String -Pattern "https://.*\.trycloudflare\.com" | Select-Object -First 1
    if ($line) {
        $tunnelUrl = [regex]::Match($line.Line, "https://\S+").Value
        break
    }
}

if (-not $tunnelUrl) {
    throw "Timed out waiting for Cloudflare tunnel URL. Check $TunnelOut and $TunnelErr."
}

$apiUrl = "$tunnelUrl/api"
Update-MobileEnv -ApiUrl $apiUrl

Write-Host "Mobile API URL set to $apiUrl"
Write-Host "Starting Expo in $ExpoMode mode..."
Write-Host "Expo will run in this terminal so you can scan the QR code."

Write-Host "Backend: http://127.0.0.1:$BackendPort/"
Write-Host "Backend tunnel: $tunnelUrl"
Write-Host "Tunnel logs: $TunnelOut"

Push-Location $MobileDir
try {
    & npx.cmd expo start "--$ExpoMode" "-c" "--max-workers" "1"
} finally {
    Pop-Location
}
