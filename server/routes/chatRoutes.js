const express = require('express');
const router = express.Router();
const { getUserChats, getChatById, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserChats);
router.get('/:id', protect, getChatById);
router.post('/message', protect, sendMessage);

module.exports = router;
