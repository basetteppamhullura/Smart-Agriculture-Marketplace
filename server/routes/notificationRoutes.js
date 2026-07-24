const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserNotifications);
router.post('/:id/read', protect, markNotificationRead);
router.post('/read-all', protect, markAllNotificationsRead);

module.exports = router;
