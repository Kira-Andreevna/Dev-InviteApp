const db = require('../config/db');
const { notifyOrganizerRsvp } = require('../services/notifier');

// POST /api/invite/:slug/guest — гость заполняет анкету
async function submitGuest(req, res) {
  const { full_name, attending, is_minor, minor_age, note, email } = req.body;
  if (!full_name) return res.status(400).json({ error: 'Укажите ФИО' });

  try {
    const [cards] = await db.query(
      'SELECT * FROM cards WHERE slug = ? AND is_published = 1',
      [req.params.slug]
    );
    if (!cards.length) return res.status(404).json({ error: 'Приглашение не найдено' });
    const card = cards[0];

    const [result] = await db.query(
      'INSERT INTO guests (card_id, full_name, attending, is_minor, minor_age, note, email, viewed_at) VALUES (?,?,?,?,?,?,?,NOW())',
      [card.id, full_name, attending || 'maybe', is_minor ? 1 : 0, is_minor ? minor_age : null, note || null, email || null]
    );

    const guest = { id: result.insertId, full_name, attending: attending || 'maybe', is_minor, minor_age, note, email };

    // Уведомляем организатора асинхронно (не блокируем ответ)
    notifyOrganizerRsvp(card, guest).catch(e => console.error('[notify]', e.message));

    res.json({ success: true, guest_id: result.insertId });
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
    if (!cards.length) return res.status(404).json({ error: 'Не найдено' });

    const [guests] = await db.query(
      'SELECT * FROM guests WHERE card_id = ? ORDER BY submitted_at DESC',
      [cards[0].id]
    );

    const stats = {
      total:         guests.length,
      attending:     guests.filter(g => g.attending === 'yes').length,
      not_attending: guests.filter(g => g.attending === 'no').length,
      maybe:         guests.filter(g => g.attending === 'maybe').length,
      minors:        guests.filter(g => g.is_minor).length
    };

    res.json({ guests, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// DELETE /api/cards/:slug/guests/:guestId
async function deleteGuest(req, res) {
  try {
    const [cards] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (!cards.length) return res.status(404).json({ error: 'Не найдено' });

    await db.query('DELETE FROM guests WHERE id = ? AND card_id = ?', [req.params.guestId, cards[0].id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

module.exports = { submitGuest, getGuests, deleteGuest };
