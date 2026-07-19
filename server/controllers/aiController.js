// @desc    Calculate dynamic AI price recommendation
// @route   POST /api/ai/dynamic-pricing
// @access  Public
const getDynamicPricing = (req, res) => {
  const { cropName, grade, quantity, location } = req.body;

  if (!cropName || !grade) {
    return res.status(400).json({ message: 'Crop name and grade are required' });
  }

  // Base pricing mapping
  const baseRates = { paddy: 22, wheat: 24, tomato: 18, potato: 15, onion: 18, cotton: 62, mango: 90 };
  const cropKey = cropName.toLowerCase().trim();
  let baseRate = 25; // fallback

  for (let key in baseRates) {
    if (cropKey.includes(key)) {
      baseRate = baseRates[key];
      break;
    }
  }

  // Add multipliers
  const gradeMultiplier = grade === 'A' ? 1.20 : grade === 'B' ? 1.00 : 0.80;
  const quantityMultiplier = quantity > 1000 ? 0.95 : 1.02; // wholesale bulk discount suggestion
  const stateDemandMultiplier = location && location.toLowerCase().includes('karnataka') ? 1.05 : 1.0;

  const fairPrice = Math.round(baseRate * gradeMultiplier * quantityMultiplier * stateDemandMultiplier);
  const minRange = Math.round(fairPrice * 0.9);
  const maxRange = Math.round(fairPrice * 1.1);

  res.json({
    cropName,
    grade,
    fairPrice,
    priceRange: `Rs ${minRange} - Rs ${maxRange} per kg`,
    factors: {
      gradeQuality: grade === 'A' ? 'High (+20%)' : grade === 'B' ? 'Average (+0%)' : 'Low (-20%)',
      marketDemand: stateDemandMultiplier > 1 ? 'High Local Demand (+5%)' : 'Stable',
      volumePricing: quantity > 1000 ? 'Bulk Quantity Discount (-5%)' : 'Standard Volume (+2%)'
    }
  });
};

// @desc    Predict crop pricing trend for the next 6 months
// @route   POST /api/ai/predict-trend
// @access  Public
const getPriceTrend = (req, res) => {
  const { cropName } = req.body;

  if (!cropName) {
    return res.status(400).json({ message: 'Crop name is required' });
  }

  const basePrice = 45; // arbitrary starting point
  const months = ['August', 'September', 'October', 'November', 'December', 'January'];
  
  // Create a realistic-looking wave curve (seasonal fluctuations)
  const trends = months.map((month, idx) => {
    const changePercent = Math.sin(idx * 0.9) * 15 + (Math.random() * 4 - 2);
    const predictedPrice = Math.round(basePrice * (1 + changePercent / 100));
    return {
      month,
      predictedPrice,
      trend: changePercent > 5 ? 'Upward' : changePercent < -5 ? 'Downward' : 'Stable',
      percentage: parseFloat(changePercent.toFixed(1))
    };
  });

  res.json({
    cropName,
    currentPrice: basePrice,
    projections: trends,
    advice: 'Prices are projected to peak in November due to high festive demand and winter season start. Consider cellaring/warehousing until then.'
  });
};

// @desc    Crop recommendations based on location and season
// @route   POST /api/ai/recommend-crop
// @access  Public
const getCropRecommendations = (req, res) => {
  const { location, soilType, waterAvailability } = req.body;

  const recommendations = {
    sandy: ['Groundnut', 'Watermelon', 'Potato', 'Carrot'],
    clayey: ['Paddy Rice', 'Wheat', 'Sugarcane', 'Cotton'],
    loamy: ['Tomatoes', 'Onions', 'Maize', 'Pulses', 'Cabbage'],
    black: ['Cotton', 'Soybean', 'Wheat', 'Jowar']
  };

  const soil = soilType ? soilType.toLowerCase().trim() : 'loamy';
  const crops = recommendations[soil] || recommendations['loamy'];

  res.json({
    soilType: soil,
    suitableCrops: crops,
    fertilizerAdvised: 'NPK (19:19:19) for vegetable crops or organic Vermicompost for nutrient-rich roots.',
    expectedHarvestDurationWeeks: 12,
    wateringGuide: waterAvailability === 'high' ? 'Drip irrigation 3 times a week' : 'Controlled mist watering/sprinklers once daily in early mornings.'
  });
};

// @desc    Plant disease detection mock
// @route   POST /api/ai/detect-disease
// @access  Public
const detectDisease = (req, res) => {
  const { cropName } = req.body; // In real app, takes file from multipart form

  const diseaseDatabase = {
    rice: {
      disease: 'Rice Blast (Magnaporthe oryzae)',
      symptoms: 'Spindle-shaped lesions on leaves with gray or white centers and brown borders.',
      severity: 'High',
      organicRemedy: 'Spray neem oil formulation (5%) or apply Pseudomonas fluorescens bio-agent to the soil.',
      chemicalRemedy: 'Spray Tricyclazole 75 WP @ 0.6 g/liter of water if severity increases.'
    },
    tomato: {
      disease: 'Early Blight (Alternaria solani)',
      symptoms: 'Dark brown spots with concentric rings resembling target boards on older leaves first.',
      severity: 'Medium',
      organicRemedy: 'Apply compost tea spray or copper-based bio-fungicides. Prune lower leaves to avoid soil splashing.',
      chemicalRemedy: 'Foliar spray of Mancozeb @ 2g/liter of water.'
    },
    default: {
      disease: 'Leaf Spot / Nitrogen Deficiency',
      symptoms: 'Mild yellowing of leaf tips and edges. Small circular dots on lower foliage.',
      severity: 'Low',
      organicRemedy: 'Apply diluted liquid manure, compost tea, and ensure balanced nitrogen-phosphorus soil aeration.',
      chemicalRemedy: 'Apply urea or water-soluble NPK foliar spray.'
    }
  };

  const key = cropName ? cropName.toLowerCase().trim() : 'default';
  const analysis = diseaseDatabase[key] || diseaseDatabase['default'];

  res.json({
    status: 'success',
    fileName: 'crop_leaf_scan.jpg',
    scannedCrop: cropName || 'General foliage',
    ...analysis
  });
};

// @desc    Farming chatbot logic
// @route   POST /api/ai/chatbot
// @access  Public
const chatbotQuery = (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Empty query' });

  const query = message.toLowerCase();
  let response = '';

  if (query.includes('pest') || query.includes('insect')) {
    response = 'For organic pest control, you can prepare a garlic-chilli spray or spray 5% Neem Seed Kernel Extract (NSKE). For severe insect infestation, please consult our Information Hub for agricultural guides.';
  } else if (query.includes('subsidy') || query.includes('scheme') || query.includes('government')) {
    response = 'The PM-KISAN scheme provides income support of Rs 6,000 per year to all landholding farmer families. Also, PM Fasal Bima Yojana offers low-premium crop insurance. You can review and apply in our daily Information Hub!';
  } else if (query.includes('price') || query.includes('pricing') || query.includes('market')) {
    response = 'Market prices fluctuate daily based on arrivals and crop grade. Try our AI-powered Dynamic Pricing tool to estimate fair buyout values, or start an Auction for bidding competition.';
  } else if (query.includes('organic') || query.includes('compost')) {
    response = 'Organic farming enhances soil micro-flora. You can use Vermicompost, Panchagavya, or green manuring (sowing sunn hemp/dhaincha) before planting. Check out our Waste Management Guide in the Sustainability features!';
  } else if (query.includes('weather') || query.includes('rain')) {
    response = 'Monsoon forecasts are critical. Our Information Hub fetches real-time meteorological reports. For clayey soil, ensure deep channels to prevent waterlogging during heavy downpours.';
  } else {
    response = 'Hello! I am your Smart Farming AI Assistant. You can ask me about organic fertilizers, crop diseases, dynamic market prices, or government subsidy eligibility checkers. How can I help you today?';
  }

  res.json({ response });
};

// @desc    Crop yield prediction
// @route   POST /api/ai/predict-yield
// @access  Public
const predictYield = (req, res) => {
  const { cropName, acreage, soilType, fertilizerType, waterSupply } = req.body;

  if (!cropName || !acreage) {
    return res.status(400).json({ message: 'Crop name and acreage are required' });
  }

  const acres = Number(acreage);
  const yieldsPerAcre = { rice: 2.1, wheat: 1.8, tomato: 8.5, potato: 9.2, onion: 7.0 }; // standard average yields in tons
  
  const cropKey = cropName.toLowerCase().trim();
  let baseYield = 2.0;

  for (let key in yieldsPerAcre) {
    if (cropKey.includes(key)) {
      baseYield = yieldsPerAcre[key];
      break;
    }
  }

  // Multipliers
  const soilMultiplier = soilType === 'clayey' || soilType === 'black' ? 1.1 : 0.95;
  const fertilizerMultiplier = fertilizerType === 'organic' ? 1.05 : 1.15; // chemical has immediate boost
  const waterMultiplier = waterSupply === 'drip' || waterSupply === 'high' ? 1.1 : 0.85;

  const totalYield = parseFloat((acres * baseYield * soilMultiplier * fertilizerMultiplier * waterMultiplier).toFixed(2));

  res.json({
    cropName,
    acreage: acres,
    predictedYieldTons: totalYield,
    yieldPerAcre: parseFloat((totalYield / acres).toFixed(2)),
    soilConditionScore: '84/100',
    suggestions: 'To improve yield, practice crop rotation with legumes (e.g. green gram) to naturally replenish nitrogen levels in your soil.'
  });
};

module.exports = {
  getDynamicPricing,
  getPriceTrend,
  getCropRecommendations,
  detectDisease,
  chatbotQuery,
  predictYield
};
