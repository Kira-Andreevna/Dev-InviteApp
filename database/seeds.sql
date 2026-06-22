SET NAMES utf8mb4;
USE invite_app;

INSERT INTO templates (name, preview_img, structure_json) VALUES
(
  'Свадьба',
  '/img/templates/wedding-preview.jpg',
  '{
    "blocks": [
      {"type": "hero", "label": "Заголовок", "placeholder": "Иван и Мария приглашают вас!"},
      {"type": "story", "label": "Наша история", "placeholder": "Расскажите вашу историю..."},
      {"type": "gallery", "label": "Фотогалерея", "placeholder": "Загрузите фото"},
      {"type": "date", "label": "Дата торжества", "placeholder": "Выберите дату"},
      {"type": "palette", "label": "Цветовая палитра", "placeholder": "Выберите цвета"},
      {"type": "details", "label": "Детали мероприятия", "placeholder": "Место, время, дресс-код..."},
      {"type": "wishes", "label": "Пожелания гостям", "placeholder": "Ваши пожелания..."}
    ]
  }'
),
(
  'День рождения',
  '/img/templates/birthday-preview.jpg',
  '{
    "blocks": [
      {"type": "hero", "label": "Заголовок", "placeholder": "Приглашаем на день рождения!"},
      {"type": "date", "label": "Дата и время", "placeholder": "Выберите дату"},
      {"type": "details", "label": "Детали", "placeholder": "Место проведения, адрес..."},
      {"type": "wishes", "label": "Пожелания", "placeholder": "Дресс-код, пожелания..."}
    ]
  }'
),
(
  'Корпоратив',
  '/img/templates/corporate-preview.jpg',
  '{
    "blocks": [
      {"type": "hero", "label": "Заголовок", "placeholder": "Приглашаем на корпоративное мероприятие!"},
      {"type": "date", "label": "Дата и время", "placeholder": "Выберите дату"},
      {"type": "details", "label": "Программа", "placeholder": "Программа мероприятия..."},
      {"type": "details", "label": "Место проведения", "placeholder": "Адрес, схема проезда..."}
    ]
  }'
);
