# Используем Node.js LTS
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальной код
COPY . .

# Создаём папку uploads
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]