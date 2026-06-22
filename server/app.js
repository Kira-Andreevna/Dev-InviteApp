require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  createDatabaseTable: false
});

// Создаём папку uploads если нет
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 дней
}));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(uploadsDir));

// API маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/invite', require('./routes/invite'));
app.use('/api/cards', require('./routes/rsvp'));

// SPA-роуты для фронтенда
app.get('/invite/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/invite.html'));
});
app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/editor.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  // Запускаем планировщик напоминаний
  const { startScheduler } = require('./services/scheduler');
  startScheduler();
});
