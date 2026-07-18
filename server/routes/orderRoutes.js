const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrders, 
  updateDeliveryStatus, 
  addOrderReview 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('buyer'), createOrder);
router.get('/', protect, getOrders);
router.put('/:id/delivery', protect, updateDeliveryStatus);
router.post('/:id/review', protect, authorize('buyer'), addOrderReview);

module.exports = router;
