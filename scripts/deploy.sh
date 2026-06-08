#!/bin/bash
set -e

APP_DIR="/home/proyec19/tareas_app"
BACKEND_DIR="$APP_DIR/backend"
PHP="/opt/cpanel/ea-php84/root/usr/bin/php"
COMPOSER="$HOME/bin/composer/composer.phar"

export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH

echo "Entrando al proyecto..."
cd "$APP_DIR"

echo "Actualizando repo..."
git fetch origin main
git reset --hard origin/main

echo "Instalando dependencias frontend..."
npm ci

echo "Compilando React..."
npm run build

echo "Copiando build a Laravel public..."
rm -rf "$BACKEND_DIR/public/assets"
rm -f "$BACKEND_DIR/public/index.html"
cp -R "$APP_DIR/dist/." "$BACKEND_DIR/public/"

echo "Instalando dependencias Laravel..."
cd "$BACKEND_DIR"

$PHP -d allow_url_fopen=1 -d disable_functions=none "$COMPOSER" install --no-dev --optimize-autoloader

echo "Preparando base de datos SQLite..."
mkdir -p database
touch database/database.sqlite

echo "Ejecutando migraciones..."
$PHP artisan migrate --force

echo "Limpiando y cacheando Laravel..."
$PHP artisan optimize:clear
$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache

echo "Deploy completado."
