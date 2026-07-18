const dbManager = require('../utils/dbManager');

// @desc    Create a new order (Buy Now)
// @route   POST /api/orders
// @access  Private/Buyer
const createOrder = async (req, res) => {
  const { cropId, quantity, isSubscription, frequency } = req.body;
  const buyerId = req.user._id;

  try {
    const crop = await dbManager.crops.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop listing not found' });
    }

    if (crop.status !== 'available') {
      return res.status(400).json({ message: 'Crop is no longer available' });
    }

    const buyQty = Number(quantity);
    if (buyQty > crop.quantity) {
      return res.status(400).json({ message: `Only ${crop.quantity} kg available. Requested: ${buyQty} kg` });
    }

    const totalCost = crop.price * buyQty;

    // Verify buyer has enough wallet balance
    const buyer = await dbManager.users.findById(buyerId);
    if (buyer.walletBalance < totalCost) {
      return res.status(400).json({ message: `Insufficient wallet balance. You need at least Rs ${totalCost}` });
    }

    const farmerId = crop.farmer._id;
    const farmer = await dbManager.users.findById(farmerId);

    // Deduct from buyer, credit to farmer
    await dbManager.users.findByIdAndUpdate(buyerId, { walletBalance: buyer.walletBalance - totalCost });
    await dbManager.users.findByIdAndUpdate(farmerId, { walletBalance: farmer.walletBalance + totalCost });

    // Deduct crop inventory
    const remainingQty = crop.quantity - buyQty;
    const newStatus = remainingQty === 0 ? 'sold' : 'available';
    await dbManager.crops.findByIdAndUpdate(cropId, { quantity: remainingQty, status: newStatus });

    // Create Order
    const order = await dbManager.orders.create({
      buyer: buyerId,
      farmer: farmerId,
      crop: cropId,
      quantity: buyQty,
      totalAmount: totalCost,
      paymentStatus: 'paid',
      paymentId: `PAY-DIR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      deliveryStatus: 'processing',
      subscriptionDetails: {
        isSubscription: !!isSubscription,
        frequency: frequency || 'weekly'
      },
      logistics: {
        partnerName: 'AgriExpress Logistics',
        vehicleNumber: 'KA-04-MH-7001',
        driverName: 'Manjunath Gowda',
        driverPhone: '+91 99012 34567',
        estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 3).toISOString() // 3 days
      }
    });

    res.status(201).json({
      message: 'Order purchased successfully',
      orderId: order._id,
      totalAmount: totalCost,
      remainingCropQty: remainingQty
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.buyer = req.user._id;
    } else if (req.user.role === 'farmer') {
      query.farmer = req.user._id;
    }
    // Admin gets all orders

    const orders = await dbManager.orders.find(query);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order delivery status
// @route   PUT /api/orders/:id/delivery
// @access  Private
const updateDeliveryStatus = async (req, res) => {
  const { status, description } = req.body; // status: 'dispatched' | 'in-transit' | 'delivered'

  try {
    const order = await dbManager.orders.find({ _id: req.params.id });
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' });
    const targetOrder = order[0];

    const timelineItem = {
      status,
      description: description || `Order delivery status updated to ${status}.`,
      timestamp: new Date().toISOString()
    };

    const updated = await dbManager.orders.findByIdAndUpdate(req.params.id, {
      deliveryStatus: status,
      $push: { trackingTimeline: timelineItem }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a review for an order (re-calculates farmer Smart Farming Score)
// @route   POST /api/orders/:id/review
// @access  Private/Buyer
const addOrderReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const order = await dbManager.orders.find({ _id: req.params.id });
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' });
    const targetOrder = order[0];

    if (targetOrder.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this order' });
    }

    // Save review
    const reviewData = {
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    await dbManager.orders.findByIdAndUpdate(req.params.id, { review: reviewData });

    // RE-CALCULATE FARMER SMART FARMING SCORE
    // Retrieve all orders of this farmer that have a review
    const farmerOrders = await dbManager.orders.find({ farmer: targetOrder.farmer._id });
    const reviewedOrders = farmerOrders.filter(o => o.review && o.review.rating);

    if (reviewedOrders.length > 0) {
      const avgRating = reviewedOrders.reduce((sum, o) => sum + o.review.rating, 0) / reviewedOrders.length;
      
      // Load farmer
      const farmer = await dbManager.users.findById(targetOrder.farmer._id);
      if (farmer) {
        const score = farmer.smartFarmingScore || { quality: 4.5, deliveryReliability: 4.5, sustainablePractices: 4.5, priceFairness: 4.5 };
        
        // Slightly nudge the farmer scores based on buyer review rating
        score.quality = parseFloat(((score.quality + avgRating) / 2).toFixed(1));
        score.deliveryReliability = parseFloat(((score.deliveryReliability + (reviewData.rating >= 4 ? 4.9 : 4.0)) / 2).toFixed(1));
        
        const overallScore = parseFloat(((score.quality + score.deliveryReliability + score.sustainablePractices + score.priceFairness) / 4).toFixed(1));
        
        await dbManager.users.findByIdAndUpdate(targetOrder.farmer._id, {
          smartFarmingScore: {
            ...score,
            overallScore
          },
          hasTrustedBadge: overallScore >= 4.5
        });
      }
    }

    res.json({ message: 'Review submitted. Farmer score updated.', review: reviewData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateDeliveryStatus,
  addOrderReview
};
