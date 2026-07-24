const express = require('express');
const router = express.Router();
const { getShipments, updateShipmentStatus } = require('../controllers/logisticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/shipments', protect, getShipments);
router.put('/:id/status', protect, authorize('farmer'), updateShipmentStatus);

module.exports = router;
