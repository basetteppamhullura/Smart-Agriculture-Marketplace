const express = require('express');
const router = express.Router();
const { 
  getDynamicPricing, 
  getPriceTrend, 
  getCropRecommendations, 
  detectDisease, 
  chatbotQuery,
  predictYield
} = require('../controllers/aiController');

router.post('/dynamic-pricing', getDynamicPricing);
router.post('/predict-trend', getPriceTrend);
router.post('/recommend-crop', getCropRecommendations);
router.post('/detect-disease', detectDisease);
router.post('/chatbot', chatbotQuery);
router.post('/predict-yield', predictYield);

module.exports = router;
