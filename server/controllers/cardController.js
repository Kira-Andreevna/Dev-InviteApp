const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// GET /api/cards — все открытки пользователя
async function getMyCards(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.slug, c.title, c.created_at, c.is_published,
              t.name AS template_name,
              (SELECT COUNT(*) FROM guests g WHERE g.card_id = c.id) AS guest_count
       FROM cards c
       LEFT JOIN templates t ON t.id = c.template_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// GET /api/cards/:slug — одна открытка (только владелец)
async function getCard(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Не найдено' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// GET /api/invite/:slug — публичный просмотр открытки
async function getPublicCard(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT slug, title, content_json FROM cards WHERE slug = ? AND is_published = 1',
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Приглашение не найдено' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// POST /api/cards — создать открытку
async function createCard(req, res) {
  const { title, template_id, content_json } = req.body;
  if (!title || !content_json)
    return res.status(400).json({ error: 'Укажите заголовок и содержимое' });

  const slug = uuidv4().replace(/-/g, '').substring(0, 12);

  try {
    const [result] = await db.query(
      'INSERT INTO cards (user_id, slug, title, template_id, content_json) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, slug, title, template_id || null, JSON.stringify(content_json)]
    );
    res.json({ success: true, slug, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// PUT /api/cards/:slug — обновить открытку
async function updateCard(req, res) {
  const { title, content_json, is_published } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Не найдено' });

    const cardId = rows[0].id;

    // Определяем следующий номер версии
    const [[{ maxVersion }]] = await db.query(
      'SELECT COALESCE(MAX(version), 0) AS maxVersion FROM card_versions WHERE card_id = ?',
      [cardId]
    );

    // Сохраняем новую версию
    await db.query(
      'INSERT INTO card_versions (card_id, version, title, content_json) VALUES (?, ?, ?, ?)',
      [cardId, maxVersion + 1, title, JSON.stringify(content_json)]
    );

    // Обновляем текущую открытку
    await db.query(
      'UPDATE cards SET title = ?, content_json = ?, is_published = ? WHERE slug = ?',
      [title, JSON.stringify(content_json), is_published ?? 1, req.params.slug]
    );

    res.json({ success: true, version: maxVersion + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// DELETE /api/cards/:slug — удалить открытку
async function deleteCard(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Не найдено' });

    await db.query('DELETE FROM cards WHERE slug = ?', [req.params.slug]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// GET /api/cards/:slug/qr — получить QR-код
async function getQR(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT slug FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Не найдено' });

    const url = `${req.protocol}://${req.get('host')}/invite/${req.params.slug}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    res.json({ qr: qrDataUrl, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// GET /api/templates — список шаблонов
async function getTemplates(req, res) {
  try {
    const [rows] = await db.query('SELECT id, name, preview_img, structure_json FROM templates');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

module.exports = { getMyCards, getCard, getPublicCard, createCard, updateCard, deleteCard, getQR, getTemplates };
