# Prepara la base de datos SQLite del cronograma (solo la primera vez).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\backend

$db = "database\database.sqlite"
if (-not (Test-Path $db)) {
    New-Item -Path $db -ItemType File -Force | Out-Null
    Write-Host "Creado $db"
} else {
    Write-Host "Ya existe $db"
}

php artisan migrate --force
Write-Host ""
Write-Host "Listo. Levanta el backend con:"
Write-Host "  cd backend"
Write-Host "  php artisan serve --port=8000"
