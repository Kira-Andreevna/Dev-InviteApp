#!/bin/bash

# Скрипт для развёртывания приложения с Docker

set -e

echo "=== Развёртывание Invite App с Docker ==="

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "Файл .env не найден. Копирую из примера..."
    cp .env.example .env
    echo "Отредактируйте .env файл перед запуском!"
    exit 1
fi

# Проверяем установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "Docker не установлен. Установите Docker перед продолжением."
    exit 1
fi

# Проверяем установлен ли Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose не установлен. Установите Docker Compose перед продолжением."
    exit 1
fi

echo "Сборка и запуск контейнеров..."
docker-compose build --no-cache
docker-compose up -d

echo "Ожидание запуска сервисов..."
sleep 10

echo "Проверка статуса контейнеров..."
docker-compose ps

echo "Просмотр логов приложения..."
docker-compose logs --tail=10 app

echo "=== Развёртывание завершено ==="
echo "Приложение доступно по адресу: http://localhost:3000"
echo "MySQL доступен на порту: 3306"
echo ""
echo "Для просмотра логов: docker-compose logs -f app"
echo "Для остановки: docker-compose down"
echo "Для остановки с удалением данных: docker-compose down -v"