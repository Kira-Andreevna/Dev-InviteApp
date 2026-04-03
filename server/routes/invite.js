const express = require('express');
const router = express.Router();
const { getPublicCard } = require('../controllers/cardController');
const { submitGuest } = require('../controllers/guestController');

router.get('/:slug', getPublicCard);
router.post('/:slug/guest', submitGuest);

module.exports = router;
