USE invite_app;

-- Настройки уведомлений для каждой открытки
ALTER TABLE cards
  ADD COLUMN event_date DATE DEFAULT NULL,
  ADD COLUMN notify_email VARCHAR(150) DEFAULT NULL,
  ADD COLUMN notify_tg_chat_id VARCHAR(50) DEFAULT NULL,
  ADD COLUMN reminder_days INT DEFAULT 3;

-- Расширяем таблицу гостей
ALTER TABLE guests
  ADD COLUMN email VARCHAR(150) DEFAULT NULL,
  ADD COLUMN phone VARCHAR(30) DEFAULT NULL,
  ADD COLUMN viewed_at TIMESTAMP DEFAULT NULL,
  ADD COLUMN reminded_at TIMESTAMP DEFAULT NULL;

-- Лог уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  guest_id INT DEFAULT NULL,
  type ENUM('rsvp_alert','reminder','invite_sent') NOT NULL,
  channel ENUM('email','telegram') NOT NULL,
  recipient VARCHAR(200) NOT NULL,
  status ENUM('sent','failed') DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
);
