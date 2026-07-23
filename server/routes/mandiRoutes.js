const express = require('express');
const router = express.Router();
const { getMandiPrices, getMandiComparison, getMandiPriceHistory } = require('../controllers/mandiController');

router.get('/', getMandiPrices);
router.get('/compare', getMandiComparison);
router.get('/:id/history', getMandiPriceHistory);

module.exports = router;
