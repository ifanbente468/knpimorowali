# Build knpi-php-upload.zip (isi = isi public_html).
# Usage: powershell -ExecutionPolicy Bypass -File php\build-zip.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$src = $PSScriptRoot
$outZip = Join-Path $root 'knpi-php-upload.zip'

$files = @(
  'index.php', 'login.php', 'logout.php', 'install.php',
  'lib.php', 'theme.php', 'config.sample.php', '.htaccess',
  'CARA-UPLOAD.txt'
)
$dirs = @('images')

if (Test-Path $outZip) { Remove-Item -LiteralPath $outZip -Force }

$zip = [System.IO.Compression.ZipFile]::Open($outZip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($name in $files) {
    $path = Join-Path $src $name
    if (-not (Test-Path $path)) { throw "Missing file: $name" }
    $entry = $zip.CreateEntry($name, [System.IO.Compression.CompressionLevel]::Optimal)
    $entry.LastWriteTime = (Get-Item -LiteralPath $path).LastWriteTime
    $stream = $entry.Open()
    try {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $stream.Write($bytes, 0, $bytes.Length)
    } finally { $stream.Dispose() }
  }
  foreach ($dir in $dirs) {
    $base = Join-Path $src $dir
    Get-ChildItem -LiteralPath $base -Recurse -File -Force | ForEach-Object {
      $rel = $_.FullName.Substring($src.Length + 1).Replace('\', '/')
      $entry = $zip.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
      $entry.LastWriteTime = $_.LastWriteTime
      $stream = $entry.Open()
      try {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        $stream.Write($bytes, 0, $bytes.Length)
      } finally { $stream.Dispose() }
    }
  }
} finally { $zip.Dispose() }

$verify = [System.IO.Compression.ZipFile]::OpenRead($outZip)
try {
  $names = @($verify.Entries | ForEach-Object { $_.FullName })
  foreach ($n in $names) { if ($n.Contains('\')) { throw "Bad entry: $n" } }
  foreach ($required in @('index.php', 'install.php', 'login.php', 'lib.php', 'theme.php', 'config.sample.php', '.htaccess', 'images/logo.jpg', 'images/hero.jpg')) {
    if (-not ($names -contains $required)) { throw "Missing: $required" }
  }
  Write-Host ("Verified {0} entries." -f $names.Count)
} finally { $verify.Dispose() }

Write-Host ("OK: {0}" -f $outZip)
