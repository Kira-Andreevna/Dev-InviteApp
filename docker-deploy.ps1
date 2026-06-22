# Скрипт для развёртывания приложения с Docker (PowerShell)

Write-Host "=== Развёртывание Invite App с Docker ===" -ForegroundColor Green

# Проверяем наличие .env файла
if (-not (Test-Path ".env")) {
    Write-Host "Файл .env не найден. Копирую из примера..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Отредактируйте .env файл перед запуском!" -ForegroundColor Red
    exit 1
}

# Проверяем установлен ли Docker
try {
    $dockerVersion = docker --version
    Write-Host "Docker обнаружен: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker не установлен. Установите Docker Desktop перед продолжением." -ForegroundColor Red
    exit 1
}

# Проверяем установлен ли Docker Compose
try {
    $dockerComposeVersion = docker-compose --version
    Write-Host "Docker Compose обнаружен: $dockerComposeVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker Compose не установлен. Установите Docker Desktop перед продолжением." -ForegroundColor Red
    exit 1
}

Write-Host "Сборка и запуск контейнеров..." -ForegroundColor Cyan
docker-compose build --no-cache
docker-compose up -d

Write-Host "Ожидание запуска сервисов..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "Проверка статуса контейнеров..." -ForegroundColor Cyan
docker-compose ps

Write-Host "Просмотр логов приложения..." -ForegroundColor Cyan
docker-compose logs --tail=10 app

Write-Host "=== Развёртывание завершено ===" -ForegroundColor Green
Write-Host "Приложение доступно по адресу: http://localhost:3000" -ForegroundColor Yellow
Write-Host "MySQL доступен на порту: 3306" -ForegroundColor Yellow
Write-Host ""
Write-Host "Для просмотра логов: docker-compose logs -f app"
Write-Host "Для остановки: docker-compose down"
Write-Host "Для остановки с удалением данных: docker-compose down -v"