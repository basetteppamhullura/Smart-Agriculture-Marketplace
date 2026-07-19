const express = require('express');
const router = express.Router();
const { 
  startNegotiation,
  getBuyerNegotiations,
  getSellerNegotiations,
  counterOffer,
  acceptOffer,
  rejectOffer
} = require('../controllers/negotiationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, startNegotiation);
router.get('/buyer', protect, getBuyerNegotiations);
router.get('/seller', protect, getSellerNegotiations);
router.post('/:id/counter', protect, counterOffer);
router.post('/:id/accept', protect, acceptOffer);
router.post('/:id/reject', protect, rejectOffer);

module.exports = router;
