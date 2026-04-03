const bcrypt = require('bcryptjs');
const db = require('../config/db');

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Заполните все поля' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: 'Email уже зарегистрирован' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    req.session.userId = result.insertId;
    req.session.userName = name;
    res.json({ success: true, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Заполните все поля' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Неверный email или пароль' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: 'Неверный email или пароль' });

    req.session.userId = user.id;
    req.session.userName = user.name;
    res.json({ success: true, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  req.session.destroy(() => {
    res.json({ success: true });
  });
}

// GET /api/auth/me
function me(req, res) {
  if (req.session && req.session.userId) {
    res.json({ loggedIn: true, userId: req.session.userId, name: req.session.userName });
  } else {
    res.json({ loggedIn: false });
  }
}

module.exports = { register, login, logout, me };
