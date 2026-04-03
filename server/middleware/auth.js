// Проверка авторизации — редирект на логин если не залогинен
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login.html');
}

// Для API — возвращаем 401 вместо редиректа
function requireAuthApi(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Необходима авторизация' });
}

module.exports = { requireAuth, requireAuthApi };
