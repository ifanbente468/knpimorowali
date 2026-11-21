# Build knpi-cpanel-upload.zip (Next.js production bundle for cPanel).
#
# Concept mirrors the IUJP cPanel package: one zip, extract, done.
# Difference: this is a Node.js app, not PHP. The zip contains the built
# `.next` output, so the hosting server never runs `next build`.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File cpanel\build-zip.ps1
#   powershell -ExecutionPolicy Bypass -File cpanel\build-zip.ps1 -SkipBuild
#
# Output: knpi-cpanel-upload.zip at repo root.

param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$outZip = Join-Path $root 'knpi-cpanel-upload.zip'
$stage = Join-Path $env:TEMP ('knpi-stage-' + [guid]::NewGuid().ToString('N'))

function Copy-Into($from, $to) {
  $dir = Split-Path -Parent $to
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  Copy-Item -LiteralPath $from -Destination $to -Force
}

try {
  Push-Location $root

  if (-not $SkipBuild) {
    Write-Host 'Building production bundle...'
    $env:NEXT_TELEMETRY_DISABLED = '1'
    $env:APP_URL = 'https://knpimorowali.com'
    & npx.cmd next build --webpack
    if ($LASTEXITCODE -ne 0) { throw "next build failed with exit code $LASTEXITCODE" }
  }

  $buildId = Join-Path $root '.next\BUILD_ID'
  if (-not (Test-Path $buildId)) {
    throw '.next/BUILD_ID not found. Run without -SkipBuild first.'
  }

  New-Item -ItemType Directory -Force -Path $stage | Out-Null

  # Built Next.js output (server chunks + static assets + manifests)
  Copy-Item -LiteralPath (Join-Path $root '.next') -Destination (Join-Path $stage '.next') -Recurse -Force

  # Runtime entry + config
  Copy-Into (Join-Path $root 'app.js') (Join-Path $stage 'app.js')
  Copy-Into (Join-Path $root 'server.js') (Join-Path $stage 'server.js')
  Copy-Into (Join-Path $root 'package.json') (Join-Path $stage 'package.json')
  Copy-Into (Join-Path $root 'next.config.ts') (Join-Path $stage 'next.config.ts')

  # Prisma migrations/schema: used by the /install page at runtime
  Copy-Item -LiteralPath (Join-Path $root 'prisma') -Destination (Join-Path $stage 'prisma') -Recurse -Force

  # Public assets
  Copy-Item -LiteralPath (Join-Path $root 'public') -Destination (Join-Path $stage 'public') -Recurse -Force

  # Upload instructions
  Copy-Into (Join-Path $root 'cpanel\CARA-UPLOAD.txt') (Join-Path $stage 'CARA-UPLOAD.txt')

  if (Test-Path $outZip) { Remove-Item -LiteralPath $outZip -Force }
  $zip = [System.IO.Compression.ZipFile]::Open($outZip, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    $files = Get-ChildItem -LiteralPath $stage -Recurse -File -Force | Sort-Object FullName
    foreach ($file in $files) {
      $rel = $file.FullName.Substring($stage.Length + 1).Replace('\', '/')
      if ($rel.Contains('\')) { throw "Entry name still contains backslash: $rel" }
      $entry = $zip.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
      $entry.LastWriteTime = $file.LastWriteTime
      $stream = $entry.Open()
      try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $stream.Write($bytes, 0, $bytes.Length)
      } finally { $stream.Dispose() }
    }
    $dirs = Get-ChildItem -LiteralPath $stage -Recurse -Directory -Force | Sort-Object FullName
    foreach ($dir in $dirs) {
      $rel = $dir.FullName.Substring($stage.Length + 1).Replace('\', '/') + '/'
      $zip.CreateEntry($rel) | Out-Null
    }
  } finally {
    $zip.Dispose()
  }

  # Verify: names use '/', no secrets, required entries present
  $verify = [System.IO.Compression.ZipFile]::OpenRead($outZip)
  try {
    $names = @($verify.Entries | ForEach-Object { $_.FullName })
    foreach ($name in $names) {
      if ($name.Contains('\')) { throw "Invalid entry separator: $name" }
      if ($name -match '(^|/)\.env($|\.)' ) { throw "Secret file inside zip: $name" }
      if ($name -match '(^|/)data/.*\.db$') { throw "Database file inside zip: $name" }
    }
    foreach ($required in @('.next/BUILD_ID', 'app.js', 'server.js', 'package.json', 'prisma/migrations/migration_lock.toml', 'public/images/logo.jpg', 'CARA-UPLOAD.txt')) {
      if (-not ($names -contains $required)) { throw "Missing required entry: $required" }
    }
    Write-Host ("Verified {0} entries." -f $names.Count)
  } finally {
    $verify.Dispose()
  }

  $size = [math]::Round((Get-Item -LiteralPath $outZip).Length / 1MB, 2)
  Write-Host ("OK: {0} ({1} MB)" -f $outZip, $size)
} finally {
  Pop-Location
  if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
}
