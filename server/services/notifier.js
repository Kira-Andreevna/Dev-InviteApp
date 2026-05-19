const nodemailer = require('nodemailer');
const db = require('../config/db');

let transporter = null;
function getTransporter() {
  if (!transporter && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

async function sendEmail(to, subject, html) {
  const t = getTransporter();
  if (!t) return { ok: false, reason: 'SMTP не настроен' };
  try {
    await t.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
    return { ok: true };
  } catch (err) {
    console.error('[Email error]', err.message);
    return { ok: false, reason: err.message };
  }
}

// botToken — токен из карточки (настройки организатора), иначе из .env
async function sendTelegram(chatId, text, botToken) {
  const token = botToken || process.env.TG_BOT_TOKEN;
  if (!token) return { ok: false, reason: 'TG_BOT_TOKEN не настроен' };
  try {
    const TelegramBot = require('node-telegram-bot-api');
    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    return { ok: true };
  } catch (err) {
    console.error('[TG error]', err.message);
    return { ok: false, reason: err.message };
  }
}

async function logNotification(cardId, guestId, type, channel, recipient, status) {
  try {
    await db.query(
      'INSERT INTO notifications (card_id, guest_id, type, channel, recipient, status) VALUES (?,?,?,?,?,?)',
      [cardId, guestId || null, type, channel, recipient, status]
    );
  } catch (e) {}
}

async function notifyOrganizerRsvp(card, guest) {
  const inviteUrl = `${process.env.BASE_URL}/invite/${card.slug}`;
  const attendingMap = { 
    yes: '✅ Придёт', 
    no: '❌ Не придёт', 
    maybe: '❔ Не знает' 
  };
  const status = attendingMap[guest.attending] || guest.attending;

  const message = `📨 <b>Новый ответ на приглашение</b>\n\n` +
    `📋 <b>${card.title}</b>\n` +
    `👤 Гость: ${guest.full_name}\n` +
    `📊 Статус: ${status}\n` +
    `${guest.is_minor ? `🔞 Несовершеннолетний, ${guest.minor_age} лет\n` : ''}` +
    `${guest.note ? `📝 Заметка: ${guest.note}\n` : ''}`;

  const htmlEmail = `
    <div style="font-family:sans-serif;max-width:500px">
      <h2>📨 Новый ответ на приглашение «${card.title}»</h2>
      <p><b>👤 Гость:</b> ${guest.full_name}</p>
      <p><b>📊 Статус:</b> ${status}</p>
      ${guest.is_minor ? `<p><b>🔞 Несовершеннолетний:</b> ${guest.minor_age} лет</p>` : ''}
      ${guest.note ? `<p><b>📝 Заметка:</b> ${guest.note}</p>` : ''}
    </div>`;

  if (card.notify_tg_chat_id) {
    const r = await sendTelegram(card.notify_tg_chat_id, message, card.tg_bot_token);
    await logNotification(card.id, guest.id, 'rsvp_alert', 'telegram', card.notify_tg_chat_id, r.ok ? 'sent' : 'failed');
  }
  if (card.notify_email) {
    const r = await sendEmail(card.notify_email, `📨 Новый ответ: ${guest.full_name}`, htmlEmail);
    await logNotification(card.id, guest.id, 'rsvp_alert', 'email', card.notify_email, r.ok ? 'sent' : 'failed');
  }
}

async function sendInviteToGuest(card, guestEmail, guestName) {
  const inviteUrl = `${process.env.BASE_URL}/invite/${card.slug}`;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#7c5cbf">📩 Вас приглашают!</h1>
      <p>Здравствуйте, <b>${guestName}</b>!</p>
      <p>💌 Вы получили приглашение на <b>«${card.title}»</b>.</p>
      <p style="margin:2rem 0">
        📍 Для подтверждения участия перейдите: 
        <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#7c5cbf;color:#fff;text-decoration:none;border-radius:5px">🔗 Ответить</a>
      </p>
      <p style="color:#999;font-size:0.85rem">🖇️ Или перейдите по ссылке: ${inviteUrl}</p>
      <hr>
      <p style="color:#999;font-size:0.75rem">✉️ Это автоматическое письмо. Отвечать на него не нужно.</p>
    </div>`;

  const r = await sendEmail(guestEmail, `📩 Приглашение: ${card.title}`, html);
  await logNotification(card.id, null, 'invite_sent', 'email', guestEmail, r.ok ? 'sent' : 'failed');
  return r;
}

async function sendReminderToGuest(card, guest) {
  if (!guest.email) return;
  const eventDate = card.event_date
    ? new Date(card.event_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#7c5cbf">⏰ Напоминание о мероприятии</h2>
      <p>👋 Здравствуйте, <b>${guest.full_name}</b>!</p>
      <p>🗣️ Напоминаем, что скоро состоится <b>«${card.title}»</b>.</p>
      ${eventDate ? `<p>🗓️ Дата: <b>${eventDate}</b></p>` : ''}
      <p>💡 Если вы ещё не ответили, пожалуйста, подтвердите участие по ссылке из предыдущего письма.</p>
      <p style="color:#999;font-size:0.85rem;margin-top:2rem">⏳ Это автоматическое напоминание. Отвечать на это письмо не нужно.</p>
    </div>`;

  const r = await sendEmail(guest.email, `⏰ Напоминание: ${card.title}`, html);
  if (r.ok) {
    await db.query('UPDATE guests SET reminded_at = NOW() WHERE id = ?', [guest.id]);
  }
  await logNotification(card.id, guest.id, 'reminder', 'email', guest.email, r.ok ? 'sent' : 'failed');
}

module.exports = { sendEmail, sendTelegram, notifyOrganizerRsvp, sendInviteToGuest, sendReminderToGuest, logNotification };