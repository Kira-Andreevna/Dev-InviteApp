const db = require('../config/db');
const { notifyOrganizerRsvp, sendInviteToGuest } = require('../services/notifier');

// GET /api/cards/:slug/rsvp — RSVP-статистика в реальном времени
async function getRsvpStats(req, res) {
  try {
    const [cards] = await db.query(
      'SELECT id, title, slug, event_date, notify_email, notify_tg_chat_id, reminder_days FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (!cards.length) return res.status(404).json({ error: 'Не найдено' });
    const card = cards[0];

    // reminder_time и tg_bot_token — могут отсутствовать до миграции
    try {
      const [[rt]] = await db.query('SELECT reminder_time, tg_bot_token FROM cards WHERE id = ?', [card.id]);
      card.reminder_time = rt?.reminder_time || '10:00:00';
      card.tg_bot_token  = rt?.tg_bot_token  || '';
    } catch (e) {
      card.reminder_time = '10:00:00';
      card.tg_bot_token  = '';
    }

    const [guests] = await db.query(
      `SELECT id, full_name, attending, is_minor, minor_age, note, email,
              viewed_at, reminded_at, submitted_at
       FROM guests WHERE card_id = ? ORDER BY submitted_at DESC`,
      [card.id]
    );

    const stats = {
      total:         guests.length,
      attending:     guests.filter(g => g.attending === 'yes').length,
      not_attending: guests.filter(g => g.attending === 'no').length,
      maybe:         guests.filter(g => g.attending === 'maybe').length,
      minors:        guests.filter(g => g.is_minor).length,
      with_email:    guests.filter(g => g.email).length,
      reminded:      guests.filter(g => g.reminded_at).length,
    };

    res.json({ card, guests, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// PUT /api/cards/:slug/notify-settings — сохранить настройки уведомлений
async function saveNotifySettings(req, res) {
  const { notify_email, notify_tg_chat_id, event_date, reminder_days, reminder_time, tg_bot_token } = req.body;
  try {
    const [cards] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (!cards.length) return res.status(404).json({ error: 'Не найдено' });

    await db.query(
      'UPDATE cards SET notify_email=?, notify_tg_chat_id=?, event_date=?, reminder_days=? WHERE slug=?',
      [notify_email || null, notify_tg_chat_id || null, event_date || null, reminder_days || 3, req.params.slug]
    );

    // reminder_time и tg_bot_token — сохраняем отдельно (могут отсутствовать до миграции)
    try {
      await db.query(
        'UPDATE cards SET reminder_time=?, tg_bot_token=? WHERE slug=?',
        [reminder_time || '10:00:00', tg_bot_token || null, req.params.slug]
      );
    } catch (e) { /* колонки ещё не созданы */ }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// POST /api/cards/:slug/send-invites — массовая рассылка приглашений
async function sendBulkInvites(req, res) {
  const { guests } = req.body; // [{ name, email }]
  if (!Array.isArray(guests) || !guests.length)
    return res.status(400).json({ error: 'Список гостей пуст' });

  try {
    const [cards] = await db.query(
      'SELECT * FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (!cards.length) return res.status(404).json({ error: 'Не найдено' });
    const card = cards[0];

    const results = [];
    for (const g of guests) {
      if (!g.email) { results.push({ name: g.name, ok: false, reason: 'Нет email' }); continue; }
      const r = await sendInviteToGuest(card, g.email, g.name || g.email);
      results.push({ name: g.name, email: g.email, ok: r.ok, reason: r.reason });
    }

    const sent = results.filter(r => r.ok).length;
    res.json({ success: true, sent, total: guests.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// POST /api/invite/:slug/viewed — гость открыл приглашение
async function markViewed(req, res) {
  // Используем fingerprint (IP + user-agent) как анонимный идентификатор
  // Если гость уже заполнил анкету — обновляем viewed_at
  try {
    const { guest_id } = req.body;
    if (guest_id) {
      await db.query(
        'UPDATE guests SET viewed_at = COALESCE(viewed_at, NOW()) WHERE id = ?',
        [guest_id]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false });
  }
}

// GET /api/cards/:slug/notifications — лог уведомлений
async function getNotifications(req, res) {
  try {
    const [cards] = await db.query(
      'SELECT id FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (!cards.length) return res.status(404).json({ error: 'Не найдено' });

    const [rows] = await db.query(
      `SELECT n.*, g.full_name AS guest_name
       FROM notifications n
       LEFT JOIN guests g ON g.id = n.guest_id
       WHERE n.card_id = ?
       ORDER BY n.sent_at DESC LIMIT 50`,
      [cards[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// POST /api/cards/:slug/send-invites-telegram — рассылка через Telegram
async function sendBulkTelegram(req, res) {
  const { guests } = req.body;
  if (!Array.isArray(guests) || !guests.length)
    return res.status(400).json({ error: 'Список гостей пуст' });

  try {
    const [cards] = await db.query(
      'SELECT * FROM cards WHERE slug = ? AND user_id = ?',
      [req.params.slug, req.session.userId]
    );
    if (!cards.length) return res.status(404).json({ error: 'Не найдено' });
    const card = cards[0];

    const { sendTelegram, logNotification } = require('../services/notifier');
    const inviteUrl = `${process.env.BASE_URL}/invite/${card.slug}`;

    const results = [];
    for (const g of guests) {
      if (!g.chatId) { results.push({ name: g.name, chatId: g.chatId, ok: false, reason: 'Нет Chat ID' }); continue; }
      const text = `💌 <b>Вас приглашают!</b>\n\n` +
        `Здравствуйте, <b>${g.name}</b>!\n` +
        `Вы получили приглашение на мероприятие <b>«${card.title}»</b>.\n\n` +
        `👉 <a href="${inviteUrl}">Открыть приглашение</a>`;
      const r = await sendTelegram(g.chatId, text);
      await logNotification(card.id, null, 'invite_sent', 'telegram', g.chatId, r.ok ? 'sent' : 'failed');
      results.push({ name: g.name, chatId: g.chatId, ok: r.ok, reason: r.reason });
    }

    const sent = results.filter(r => r.ok).length;
    res.json({ success: true, sent, total: guests.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

module.exports = { getRsvpStats, saveNotifySettings, sendBulkInvites, sendBulkTelegram, markViewed, getNotifications };
