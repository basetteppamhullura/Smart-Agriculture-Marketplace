const dbManager = require('../utils/dbManager');
const { getImageForCrop } = require('../utils/cropImages');
const socketManager = require('../utils/socketManager');

// Helper function to mock AI pricing calculation
const calculateAIRecommendedPrice = (cropName, grade, category) => {
  const basePrices = {
    'rice': 55,
    'basmati': 80,
    'tomato': 25,
    'potato': 20,
    'onion': 22,
    'mango': 120,
    'banana': 30,
    'carrot': 35,
    'wheat': 25,
    'ragi': 45,
    'jowar': 40,
    'arecanut': 450,
    'coconut': 30
  };

  const nameLower = cropName.toLowerCase().trim();
  let basePrice = 30; // fallback default
  
  for (let key in basePrices) {
    if (nameLower.includes(key)) {
      basePrice = basePrices[key];
      break;
    }
  }

  // Adjust base price based on category
  if (category === 'Agricultural equipment') basePrice = 15000;
  if (category === 'Fertilizers') basePrice = 45;
  if (category === 'Dairy products') basePrice = 60;
  if (category === 'Flowers') basePrice = 90;
  if (category === 'Commercial Crops') basePrice = 250;

  // Quality multiplier
  let multiplier = 1.0;
  if (grade === 'A') multiplier = 1.15;
  if (grade === 'Premium') multiplier = 1.3;
  if (grade === 'C') multiplier = 0.85;

  return Math.round(basePrice * multiplier);
};

// @desc    Create a new crop listing
// @route   POST /api/crops
// @access  Private/Farmer
const uploadCrop = async (req, res) => {
  const { 
    name, localName, category, quantity, qualityGrade, harvestDate, 
    location, district, village, listingMode, price, imageUrl, images, 
    stockStatus, deliveryOption, description 
  } = req.body;

  try {
    const aiPriceRecommended = calculateAIRecommendedPrice(name, qualityGrade || 'A', category);

    // Build multiple images array
    let imageList = images && images.length > 0 ? images : [];
    if (imageList.length === 0) {
      if (imageUrl && imageUrl.trim().length > 0) {
        imageList = [imageUrl];
      } else {
        const cropDefaultImg = getImageForCrop(name || localName);
        imageList = [cropDefaultImg];
      }
    }

    const crop = await dbManager.crops.create({
      farmer: req.user._id,
      name,
      localName: localName || '',
      category: category || 'Grains',
      quantity: Number(quantity),
      qualityGrade: qualityGrade || 'A',
      harvestDate: harvestDate || new Date().toISOString(),
      location: location || req.user.location,
      district: district || 'Mandya',
      village: village || '',
      listingMode: listingMode || 'buynow',
      price: Number(price),
      aiPriceRecommended,
      imageUrl: imageList[0],
      images: imageList,
      stockStatus: stockStatus || 'in-stock',
      deliveryOption: deliveryOption || 'logistics-delivery',
      description,
      analytics: { views: 0, ordersCount: 0, revenue: 0 }
    });

    // If it's an auction listing, automatically create an associated auction record
    if (listingMode === 'auction') {
      const durationHours = req.body.durationHours || 24;
      const endTime = new Date(Date.now() + 3600000 * Number(durationHours)).toISOString();
      
      await dbManager.auctions.create({
        crop: crop._id,
        durationHours: Number(durationHours),
        endTime,
        highestBid: Number(price)
      });
    }

    // Broadcast new crop in real time
    socketManager.broadcastToChannel('mandi', {
      type: 'new_crop',
      crop
    });

    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all crops (with search and filter)
// @route   GET /api/crops
// @access  Public
const getCrops = async (req, res) => {
  const { search, location, listingMode, qualityGrade, category, district } = req.query;

  try {
    let query = { status: 'available' };

    if (search) {
      query.$or = [
        { name: { $regex: search } },
        { localName: { $regex: search } }
      ];
    }
    if (location) {
      query.location = location;
    }
    if (listingMode) {
      query.listingMode = listingMode;
    }
    if (qualityGrade) {
      query.qualityGrade = qualityGrade;
    }
    if (category) {
      query.category = category;
    }
    if (district) {
      query.district = district;
    }

    const crops = await dbManager.crops.find(query);
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get crop details by ID (automatically logs a view!)
// @route   GET /api/crops/:id
// @access  Public
const getCropById = async (req, res) => {
  try {
    const crop = await dbManager.crops.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Dynamic views count increment
    await dbManager.crops.findByIdAndUpdate(req.params.id, {
      $inc: { 'analytics.views': 1 }
    });

    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a crop listing
// @route   PUT /api/crops/:id
// @access  Private/Farmer
const editCrop = async (req, res) => {
  const { 
    name, localName, category, quantity, qualityGrade, price, 
    images, stockStatus, deliveryOption, description, district, village 
  } = req.body;

  try {
    const crop = await dbManager.crops.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    // Validate ownership
    if (crop.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this listing' });
    }

    let imageList = images && images.length > 0 ? images : [];
    if (imageList.length === 0) {
      if (name && name !== crop.name) {
        const cropDefaultImg = getImageForCrop(name || localName || crop.localName);
        imageList = [cropDefaultImg];
      } else {
        imageList = crop.images;
      }
    }
    const aiPriceRecommended = calculateAIRecommendedPrice(name || crop.name, qualityGrade || crop.qualityGrade, category || crop.category);

    const updatedCrop = await dbManager.crops.findByIdAndUpdate(req.params.id, {
      name: name || crop.name,
      localName: localName !== undefined ? localName : crop.localName,
      category: category || crop.category,
      quantity: quantity !== undefined ? Number(quantity) : crop.quantity,
      qualityGrade: qualityGrade || crop.qualityGrade,
      price: price !== undefined ? Number(price) : crop.price,
      aiPriceRecommended,
      images: imageList,
      imageUrl: imageList[0] || crop.imageUrl || getImageForCrop(name || crop.name),
      stockStatus: stockStatus || crop.stockStatus,
      deliveryOption: deliveryOption || crop.deliveryOption,
      description: description || crop.description,
      district: district || crop.district,
      village: village || crop.village
    });

    res.json(updatedCrop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a crop listing
// @route   DELETE /api/crops/:id
// @access  Private/Farmer
const deleteCrop = async (req, res) => {
  try {
    const crop = await dbManager.crops.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    // Validate ownership
    if (crop.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await dbManager.crops.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product listing removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Farmer Dashboard Data (analytics, expenses, profit tracker)
// @route   GET /api/crops/farmer/dashboard
// @access  Private/Farmer
const getFarmerDashboard = async (req, res) => {
  try {
    // 1. Get listed crops
    const crops = await dbManager.crops.find({ farmer: req.user._id });
    
    // 2. Mock Expenses list (seeds, fertilizers, fuel, transport, labor)
    const expenses = [
      { id: 'exp_1', category: 'High-yield Seeds', cost: 1800, date: '2026-05-10', description: 'Bought seeds' },
      { id: 'exp_2', category: 'Organic Fertilizers', cost: 3500, date: '2026-05-25', description: 'Compost and bio-fertilizer' },
      { id: 'exp_3', category: 'Labor Charges', cost: 4000, date: '2026-07-10', description: 'Harvesting laborers' },
      { id: 'exp_4', category: 'Drip Irrigation Maintenance', cost: 1500, date: '2026-06-05', description: 'Pipeline cleaning' },
      { id: 'exp_5', category: 'Transportation', cost: 2200, date: '2026-07-16', description: 'Delivery truck booking' }
    ];

    // 3. Calculate revenues from sold orders
    const orders = await dbManager.orders.find({ farmer: req.user._id, paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.cost, 0);
    const netProfit = totalRevenue - totalExpenses;

    // 4. Sales analytics monthly data
    const monthlySales = [
      { month: 'April', revenue: 8000, expenses: 3200 },
      { month: 'May', revenue: 14000, expenses: 5300 },
      { month: 'June', revenue: 22000, expenses: 4000 },
      { month: 'July', revenue: totalRevenue, expenses: totalExpenses }
    ];

    res.json({
      crops,
      expenses,
      financials: {
        totalRevenue,
        totalExpenses,
        netProfit,
        roiPercentage: totalExpenses > 0 ? parseFloat(((netProfit / totalExpenses) * 100).toFixed(1)) : 0
      },
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update crop inventory quantity
// @route   PUT /api/crops/:id/inventory
// @access  Private/Farmer
const updateInventory = async (req, res) => {
  const { quantity } = req.body;

  try {
    const crop = await dbManager.crops.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    if (crop.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this crop listing' });
    }

    const updatedCrop = await dbManager.crops.findByIdAndUpdate(req.params.id, { quantity: Number(quantity) });
    res.json(updatedCrop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get crop reviews
// @route   GET /api/crops/:id/reviews
// @access  Public
const getCropReviews = async (req, res) => {
  try {
    const reviews = await dbManager.reviews.find({ crop: req.params.id });
    
    // Calculate aggregate metrics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)) 
      : 0;

    res.json({
      reviews,
      totalReviews,
      averageRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post crop review (Verified buyers only!)
// @route   POST /api/crops/:id/reviews
// @access  Private/Buyer
const postCropReview = async (req, res) => {
  const { rating, sentiment, comment, recommend, images } = req.body;

  try {
    // 1. Verify buyer purchase history for this crop
    const orders = await dbManager.orders.find({
      buyer: req.user._id.toString(),
      crop: req.params.id
    });
    
    const paidOrder = orders.find(o => o.paymentStatus === 'paid');
    if (!paidOrder) {
      return res.status(403).json({ message: 'Only verified buyers of this product can submit reviews.' });
    }

    const review = await dbManager.reviews.create({
      crop: req.params.id,
      buyer: req.user._id,
      buyerName: req.user.name,
      rating: Number(rating),
      sentiment: sentiment || 'Good',
      comment,
      recommend: recommend !== undefined ? recommend : true,
      images: images || [],
      purchaseDate: paidOrder.createdAt,
      likes: []
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle helpful like toggle
// @route   POST /api/crops/:id/reviews/:reviewId/like
// @access  Private
const toggleReviewLike = async (req, res) => {
  try {
    const review = await dbManager.reviews.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const userLiked = review.likes && review.likes.includes(req.user._id.toString());
    let updated;
    if (userLiked) {
      updated = await dbManager.reviews.findByIdAndUpdate(req.params.reviewId, {
        $pull: { likes: req.user._id.toString() }
      });
    } else {
      updated = await dbManager.reviews.findByIdAndUpdate(req.params.reviewId, {
        $push: { likes: req.user._id.toString() }
      });
    }

    res.json({ liked: !userLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get crop questions
// @route   GET /api/crops/:id/questions
// @access  Public
const getCropQuestions = async (req, res) => {
  try {
    const questions = await dbManager.questions.find({ crop: req.params.id });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ask crop question
// @route   POST /api/crops/:id/questions
// @access  Private
const askCropQuestion = async (req, res) => {
  const { questionText } = req.body;

  try {
    const question = await dbManager.questions.create({
      crop: req.params.id,
      asker: req.user._id,
      askerName: req.user.name,
      questionText,
      answers: []
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Answer crop question
// @route   POST /api/crops/:id/questions/:questionId/answers
// @access  Private
const answerCropQuestion = async (req, res) => {
  const { answerText } = req.body;

  try {
    const question = await dbManager.questions.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Check if responder is a verified buyer of this crop
    const orders = await dbManager.orders.find({
      buyer: req.user._id.toString(),
      crop: req.params.id
    });
    const isVerifiedBuyer = orders.some(o => o.paymentStatus === 'paid');

    const updated = await dbManager.questions.findByIdAndUpdate(req.params.questionId, {
      $push: {
        answers: {
          responder: req.user._id,
          responderName: req.user.name,
          answerText,
          isVerifiedBuyer
        }
      }
    });

    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadCrop,
  getCrops,
  getCropById,
  editCrop,
  deleteCrop,
  getFarmerDashboard,
  updateInventory,
  getCropReviews,
  postCropReview,
  toggleReviewLike,
  getCropQuestions,
  askCropQuestion,
  answerCropQuestion
};
