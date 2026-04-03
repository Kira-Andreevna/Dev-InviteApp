const db = require('../config/db');

// POST /api/invite/:slug/guest — гость заполняет анкету
async function submitGuest(req, res) {
  const { full_name, attending, is_minor, minor_age, note } = req.body;
  if (!full_name) return res.status(400).json({ error: 'Укажите ФИО' });

  try {
    const [cards] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND is_published = 1',
      [req.params.slug]
    );
    if (cards.length === 0) return res.status(404).json({ error: 'Приглашение не найдено' });

    const cardId = cards[0].id;
    await db.query(
      'INSERT INTO guests (card_id, full_name, attending, is_minor, minor_age, note) VALUES (?, ?, ?, ?, ?, ?)',
      [cardId, full_name, attending || 'maybe', is_minor ? 1 : 0, is_minor ? minor_age : null, note || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// GET /api/cards/:slug/guests — список гостей (только владелец)
async function getGuests(req, res) {
  try {
    const [cards] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (cards.length === 0) return res.status(404).json({ error: 'Не найдено' });

    const [guests] = await db.query(
      'SELECT * FROM guests WHERE card_id = ? ORDER BY submitted_at DESC',
      [cards[0].id]
    );

    // Краткая статистика
    const stats = {
      total: guests.length,
      attending: guests.filter(g => g.attending === 'yes').length,
      not_attending: guests.filter(g => g.attending === 'no').length,
      maybe: guests.filter(g => g.attending === 'maybe').length,
      minors: guests.filter(g => g.is_minor).length
    };

    res.json({ guests, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// DELETE /api/cards/:slug/guests/:guestId — удалить запись гостя
async function deleteGuest(req, res) {
  try {
    const [cards] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (cards.length === 0) return res.status(404).json({ error: 'Не найдено' });

    await db.query(
      'DELETE FROM guests WHERE id = ? AND card_id = ?',
      [req.params.guestId, cards[0].id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

module.exports = { submitGuest, getGuests, deleteGuest };
