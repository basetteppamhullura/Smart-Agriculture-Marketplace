const mandiPricesList = require('../data/mandiPricesData');

// GET all Mandi Market Prices with advanced search, filtering & sorting
exports.getMandiPrices = async (req, res) => {
  try {
    const { search, category, state, district, mandi, sortBy } = req.query;
    let result = [...mandiPricesList];

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(item => 
        item.crop.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.mandi.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q)
      );
    }

    if (category) {
      result = result.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (state) {
      result = result.filter(item => item.state.toLowerCase() === state.toLowerCase());
    }

    if (district) {
      result = result.filter(item => item.district.toLowerCase() === district.toLowerCase());
    }

    if (mandi) {
      result = result.filter(item => item.mandi.toLowerCase().includes(mandi.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'highestPrice') {
      result.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (sortBy === 'lowestPrice') {
      result.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sortBy === 'latestUpdate') {
      result.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    } else if (sortBy === 'changePct') {
      result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    } else if (sortBy === 'demand') {
      const rank = { 'High': 3, 'Medium': 2, 'Low': 1 };
      result.sort((a, b) => (rank[b.demandLevel] || 0) - (rank[a.demandLevel] || 0));
    }

    res.json({
      success: true,
      count: result.length,
      unit: '₹/Quintal',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving mandi prices', error: error.message });
  }
};

// GET Compare prices for a crop across different Mandis
exports.getMandiComparison = async (req, res) => {
  try {
    const { cropName } = req.query;
    if (!cropName) {
      return res.status(400).json({ success: false, message: 'Crop name query parameter is required' });
    }

    const matchedCrops = mandiPricesList.filter(item => 
      item.crop.toLowerCase().includes(cropName.toLowerCase())
    );

    res.json({
      success: true,
      cropName,
      unit: '₹/Quintal',
      data: matchedCrops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error performing mandi price comparison', error: error.message });
  }
};

// GET Historical price trend data (7 days, 30 days, 6 months)
exports.getMandiPriceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const item = mandiPricesList.find(c => c.id === id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Mandi crop price record not found' });
    }

    res.json({
      success: true,
      crop: item.crop,
      mandi: item.mandi,
      unit: '₹/Quintal',
      history7d: item.history7d,
      history30d: item.history30d,
      history6m: item.history6m
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving mandi price history', error: error.message });
  }
};
