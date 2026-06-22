-- Миграция: Расширенная система RSVP
USE invite_app;

-- Добавляем поля в cards для уведомлений и событий
ALTER TABLE cards 
  ADD COLUMN IF NOT EXISTS event_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reminder_days INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS notify_email VARCHAR(150) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notify_tg_chat_id VARCHAR(100) DEFAULT NULL;

-- Добавляем поля в guests для email и отслеживания
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS email VARCHAR(150) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMP NULL DEFAULT NULL;

-- Создаём таблицу для логирования уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  guest_id INT DEFAULT NULL,
  type ENUM('rsvp_alert', 'invite_sent', 'reminder') NOT NULL,
  channel ENUM('email', 'telegram') NOT NULL,
  recipient VARCHAR(200) NOT NULL,
  status ENUM('sent', 'failed') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
);

-- Добавляем время отправки напоминания
ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '10:00:00';
