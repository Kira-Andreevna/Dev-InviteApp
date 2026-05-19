const express = require('express');
const router = express.Router();
const { requireAuthApi } = require('../middleware/auth');
const {
  getRsvpStats, saveNotifySettings, sendBulkInvites, sendBulkTelegram, getNotifications
} = require('../controllers/rsvpController');
const { markViewed } = require('../controllers/rsvpController');

router.get('/:slug/rsvp',                requireAuthApi, getRsvpStats);
router.put('/:slug/notify-settings',     requireAuthApi, saveNotifySettings);
router.post('/:slug/send-invites',       requireAuthApi, sendBulkInvites);
router.post('/:slug/send-invites-telegram', requireAuthApi, sendBulkTelegram);
router.get('/:slug/notifications',       requireAuthApi, getNotifications);

// Публичный — гость открыл страницу
router.post('/invite/:slug/viewed', markViewed);

module.exports = router;
