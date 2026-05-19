const cron = require('node-cron');
const db = require('../config/db');
const { sendReminderToGuest, sendEmail, logNotification, sendTelegram } = require('./notifier');

// Запускается каждую минуту, проверяет у каких карточек сейчас время напоминания
function startScheduler() {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const hh  = String(now.getHours()).padStart(2, '0');
      const mm  = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hh}:${mm}`;

      // Карточки, у которых сегодня день напоминания И сейчас нужное время
      const [cards] = await db.query(`
        SELECT c.*, u.email AS owner_email,
               COALESCE(c.tg_bot_token, '') AS tg_bot_token
        FROM cards c
        JOIN users u ON u.id = c.user_id
        WHERE c.event_date IS NOT NULL
          AND c.is_published = 1
          AND DATEDIFF(c.event_date, CURDATE()) = c.reminder_days
          AND TIME_FORMAT(COALESCE(c.reminder_time, '10:00:00'), '%H:%i') = ?
      `, [currentTime]);

      if (!cards.length) return;

      console.log(`⏰ [Scheduler] ${currentTime} — найдено ${cards.length} карточек для напоминания`);

      for (const card of cards) {
        // Напоминания гостям
        const [guests] = await db.query(
          'SELECT * FROM guests WHERE card_id = ? AND email IS NOT NULL AND reminded_at IS NULL AND attending != ?',
          [card.id, 'no']
        );

        console.log(`📋 [Scheduler] Карточка "${card.title}": ${guests.length} напоминаний гостям`);
        for (const guest of guests) {
          await sendReminderToGuest(card, guest);
        }

        // Напоминание организатору
        const eventDate = new Date(card.event_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const [[s]] = await db.query(
          `SELECT COUNT(*) AS total,
            SUM(attending = 'yes') AS attending,
            SUM(attending = 'no') AS not_attending,
            SUM(attending = 'maybe') AS maybe
           FROM guests WHERE card_id = ?`,
          [card.id]
        );
        const dashboardUrl = `${process.env.BASE_URL}/rsvp-manager.html?slug=${card.slug}`;
        const orgHtml = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#7c5cbf">⏰ Напоминание о мероприятии</h2>
            <p>🪩 До мероприятия <b>«${card.title}»</b> осталось <b>${card.reminder_days} дн.</b></p>
            <p>🗓️ Дата: <b>${eventDate}</b></p>
            <hr style="border:none;border-top:1px solid #eee;margin:1rem 0">
            <h3>📊 Статистика гостей:</h3>
            <ul>
              <li>👥 Всего ответов: <b>${s.total}</b></li>
              <li>✅ Придут: <b>${s.attending}</b></li>
              <li>❌ Не придут: <b>${s.not_attending}</b></li>
              <li>❔ Не определились: <b>${s.maybe}</b></li>
            </ul>
            <p style="margin-top:1.5rem">
            </p>
            <hr>
            <p style="color:#999;font-size:0.75rem">✉️ Это автоматическое напоминание. Отвечать на него не нужно.</p>
          </div>`;

        const emailTo = card.notify_email || card.owner_email;
        if (emailTo) {
          const r = await sendEmail(emailTo, `⏰ Напоминание: «${card.title}» через ${card.reminder_days} дн.`, orgHtml);
          await logNotification(card.id, null, 'reminder', 'email', emailTo, r.ok ? 'sent' : 'failed');
          console.log(`📧 [Scheduler] Напоминание организатору (${emailTo}): ${r.ok ? '✅ отправлено' : '❌ ошибка'}`);
        }

        if (card.notify_tg_chat_id && (card.tg_bot_token || process.env.TG_BOT_TOKEN)) {
          const tgMsg = `⏰ <b>Напоминание о мероприятии</b>\n\n` +
            `🪩 <b>${card.title}</b>\n` +
            `🗓️ Дата: ${eventDate}\n` +
            `⏳ До события: <b>${card.reminder_days} дн.</b>\n\n` +
            `👥 Гостей: ${s.total} | ✅ Придут: ${s.attending} | ❌ Не придут: ${s.not_attending} | ❔ Не знают: ${s.maybe}\n\n`;
          const r = await sendTelegram(card.notify_tg_chat_id, tgMsg, card.tg_bot_token);
          await logNotification(card.id, null, 'reminder', 'telegram', card.notify_tg_chat_id, r.ok ? 'sent' : 'failed');
          console.log(`🤖 [Scheduler] Telegram напоминание: ${r.ok ? '✅ отправлено' : '❌ ошибка'}`);
        }
      }
    } catch (err) {
      console.error('❌ [Scheduler error]', err.message);
    }
  });

  console.log('✅ [Scheduler] Запущен (проверка каждую минуту, время напоминания задаётся в настройках)');
}

module.exports = { startScheduler };