const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAuthApi } = require('../middleware/auth');
const {
  getMyCards, getCard, createCard, updateCard, deleteCard, getQR, getTemplates
} = require('../controllers/cardController');
const { getGuests, deleteGuest } = require('../controllers/guestController');

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const allowed = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'];
    cb(null, allowed.includes(ext));
  }
});

router.get('/templates', getTemplates);
router.get('/', requireAuthApi, getMyCards);
router.get('/:slug', requireAuthApi, getCard);
router.post('/', requireAuthApi, createCard);
router.put('/:slug', requireAuthApi, updateCard);
router.delete('/:slug', requireAuthApi, deleteCard);
router.get('/:slug/qr', requireAuthApi, getQR);
router.get('/:slug/guests', requireAuthApi, getGuests);
router.delete('/:slug/guests/:guestId', requireAuthApi, deleteGuest);

// Загрузка медиафайлов
router.post('/:slug/upload', requireAuthApi, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Файл слишком большой (макс. 50MB)' });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Недопустимый формат файла. Разрешены: jpg, png, gif, webp, mp4, mov, webm' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
