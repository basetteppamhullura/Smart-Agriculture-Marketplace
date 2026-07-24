const express = require('express');
const router = express.Router();
const { chargePayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/charge', protect, authorize('buyer'), chargePayment);

module.exports = router;
