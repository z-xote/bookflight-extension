# ============================================================================
# Bookflight Extension Auto-Update Script (Windows PowerShell)
# ============================================================================

$EXTENSION_DIR = "C:\bookflight-extension"
$GIT_REPO = "https://github.com/z-xote/bookflight-extension.git"
$BRANCH = "production"
$DIST_SUBDIR = "dist"

$LOCK_FILE = "$EXTENSION_DIR\.update.lock"
$LOG_FILE = "$EXTENSION_DIR\update.log"
$VERSION_FILE = "$EXTENSION_DIR\version.txt"

function Write-Report {
    param([string]$Status, [string]$Version, [int]$Duration, [string]$Error = "")
    $output = "$Status|$Version|$Duration|$Error"
    Write-Output $output
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LOG_FILE -Value "[$timestamp] $output" -ErrorAction SilentlyContinue
}

function Get-CurrentVersion {
    if (Test-Path $VERSION_FILE) {
        return (Get-Content $VERSION_FILE -Raw) -replace 'v', '' -replace '\s', ''
    }
    return "0.0.0"
}

function Compare-Versions {
    param([string]$Version1, [string]$Version2)
    $v1Parts = $Version1.Split('.') | ForEach-Object { [int]$_ }
    $v2Parts = $Version2.Split('.') | ForEach-Object { [int]$_ }
    $maxLength = [Math]::Max($v1Parts.Count, $v2Parts.Count)
    while ($v1Parts.Count -lt $maxLength) { $v1Parts += 0 }
    while ($v2Parts.Count -lt $maxLength) { $v2Parts += 0 }
    for ($i = 0; $i -lt $maxLength; $i++) {
        if ($v1Parts[$i] -gt $v2Parts[$i]) { return 1 }
        if ($v1Parts[$i] -lt $v2Parts[$i]) { return -1 }
    }
    return 0
}

function Remove-LockFile {
    if (Test-Path $LOCK_FILE) { Remove-Item $LOCK_FILE -Force -ErrorAction SilentlyContinue }
}

# Start timer
$startTime = Get-Date

# Ensure extension directory exists
if (-not (Test-Path $EXTENSION_DIR)) {
    try { New-Item -ItemType Directory -Path $EXTENSION_DIR -Force | Out-Null }
    catch { Write-Report -Status "ERROR" -Version "unknown" -Duration 0 -Error "Cannot create extension directory"; exit 1 }
}

Set-Location $EXTENSION_DIR

# Check for stale lock
if (Test-Path $LOCK_FILE) {
    $lockAge = (Get-Date) - (Get-Item $LOCK_FILE).LastWriteTime
    if ($lockAge.TotalMinutes -gt 10) { Remove-Item $LOCK_FILE -Force }
    else { Write-Report -Status "LOCKED" -Version "unknown" -Duration 0 -Error "Update in progress"; exit 1 }
}

New-Item -ItemType File -Path $LOCK_FILE -Force | Out-Null

try {
    $currentVersion = Get-CurrentVersion
    $isFirstRun = ($currentVersion -eq "0.0.0")
    
    $tempDir = "$env:TEMP\extension-update-$(Get-Random)"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    try {
        # Clone repo
        $gitOutput = & git clone --depth 1 --branch $BRANCH $GIT_REPO $tempDir 2>&1
        if ($LASTEXITCODE -ne 0) { 
            Write-Report -Status "ERROR" -Version "v$currentVersion" -Duration 0 -Error "Git clone failed: $gitOutput"
            exit 1 
        }
        
        # Find version.txt (fixed Join-Path for older PowerShell)
        $latestVersion = $null
        $distVersionFile = "$tempDir\$DIST_SUBDIR\version.txt"
        $rootVersionFile = "$tempDir\version.txt"
        
        if (Test-Path $distVersionFile) { 
            $latestVersion = (Get-Content $distVersionFile -Raw) -replace 'v', '' -replace '\s', '' 
        }
        elseif (Test-Path $rootVersionFile) { 
            $latestVersion = (Get-Content $rootVersionFile -Raw) -replace 'v', '' -replace '\s', '' 
        }
        else { 
            Write-Report -Status "ERROR" -Version "v$currentVersion" -Duration 0 -Error "Cannot find version.txt"
            exit 1 
        }
        
        if ([string]::IsNullOrWhiteSpace($latestVersion)) { 
            Write-Report -Status "ERROR" -Version "v$currentVersion" -Duration 0 -Error "Version file is empty"
            exit 1 
        }
        
        # First run: always install
        if ($isFirstRun) {
            $sourceDir = if (Test-Path "$tempDir\$DIST_SUBDIR") { "$tempDir\$DIST_SUBDIR" } else { $tempDir }
            Get-ChildItem -Path $sourceDir -Exclude ".git" | ForEach-Object { 
                Copy-Item -Path $_.FullName -Destination $EXTENSION_DIR -Recurse -Force 
            }
            Set-Content -Path $VERSION_FILE -Value "v$latestVersion"
            
            $duration = [int](Get-Date).Subtract($startTime).TotalSeconds
            Write-Report -Status "SUCCESS" -Version "v$latestVersion" -Duration $duration -Error "Initial install"
            exit 0
        }
        
        # Compare versions
        $compareResult = Compare-Versions -Version1 $latestVersion -Version2 $currentVersion
        
        if ($compareResult -eq 0) {
            $duration = [int](Get-Date).Subtract($startTime).TotalSeconds
            Write-Report -Status "NO_UPDATE" -Version "v$currentVersion" -Duration $duration
            exit 0
        }
        elseif ($compareResult -lt 0) {
            $duration = [int](Get-Date).Subtract($startTime).TotalSeconds
            Write-Report -Status "NO_UPDATE" -Version "v$currentVersion" -Duration $duration -Error "Local version newer"
            exit 0
        }
        
        # Update available - copy files
        $sourceDir = if (Test-Path "$tempDir\$DIST_SUBDIR") { "$tempDir\$DIST_SUBDIR" } else { $tempDir }
        Get-ChildItem -Path $sourceDir -Exclude ".git" | ForEach-Object { 
            Copy-Item -Path $_.FullName -Destination $EXTENSION_DIR -Recurse -Force 
        }
        Set-Content -Path $VERSION_FILE -Value "v$latestVersion"
        
        $duration = [int](Get-Date).Subtract($startTime).TotalSeconds
        Write-Report -Status "SUCCESS" -Version "v$latestVersion" -Duration $duration
        exit 0
    }
    finally {
        if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue }
    }
}
finally { Remove-LockFile }