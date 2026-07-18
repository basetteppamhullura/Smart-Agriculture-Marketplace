const express = require('express');
const router = express.Router();
const { 
  getActiveAuctions, 
  placeBid, 
  forceResolveAuction 
} = require('../controllers/auctionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getActiveAuctions);
router.post('/:id/bid', protect, authorize('buyer'), placeBid);
router.post('/:id/resolve', protect, forceResolveAuction);

module.exports = router;
