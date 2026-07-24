const dbManager = require('../utils/dbManager');
const { createNotification } = require('../utils/notificationHelper');
const socketManager = require('../utils/socketManager');

// @desc    Initiate a new price negotiation
// @route   POST /api/negotiations
// @access  Private/Buyer
const startNegotiation = async (req, res) => {
  const { cropId, offerPrice, message } = req.body;
  const buyerId = req.user._id;

  try {
    const crop = await dbManager.crops.findById(cropId);
    if (!crop) return res.status(404).json({ message: 'Crop listing not found' });

    if (crop.listingMode !== 'buynow') {
      return res.status(400).json({ message: 'Negotiation is only supported for Buy Now mode.' });
    }

    const offer = Number(offerPrice);
    const minPrice = crop.minPriceAcceptable || Math.round(crop.price * 0.8);

    // Prevent extremely low/unrealistic offers
    if (offer < minPrice) {
      return res.status(400).json({ 
        message: `Your offer (Rs ${offer}) is below the farmer's minimum acceptable threshold (Rs ${minPrice}). Please offer a fair price.` 
      });
    }

    // Check if negotiation already exists between this buyer and crop
    const existing = await dbManager.negotiations.find({
      crop: cropId,
      buyer: buyerId
    });

    if (existing.length > 0) {
      const activeNeg = existing.find(n => n.status === 'Pending' || n.status === 'Counter');
      if (activeNeg) {
        return res.status(400).json({ 
          message: 'You already have an active negotiation for this crop. Check your dashboard.' 
        });
      }
    }

    const farmerId = crop.farmer._id;
    const farmer = await dbManager.users.findById(farmerId);

    const negotiation = await dbManager.negotiations.create({
      crop: cropId,
      buyer: buyerId,
      buyerName: req.user.name,
      seller: farmerId,
      sellerName: farmer.name,
      initialOffer: offer,
      currentOffer: offer,
      lastOfferBy: 'buyer',
      status: 'Pending',
      minPrice,
      messages: [{
        sender: 'buyer',
        text: message || `Hello! I would like to offer Rs ${offer}/unit for this crop.`,
        offer,
        createdAt: new Date().toISOString()
      }]
    });

    await createNotification(
      farmerId,
      'New Buyer Offer Received',
      `Buyer ${req.user.name} has offered ₹${offer}/Quintal for ${crop.name}.`,
      'negotiation',
      negotiation._id
    );

    res.status(201).json(negotiation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active negotiations for buyer
// @route   GET /api/negotiations/buyer
// @access  Private/Buyer
const getBuyerNegotiations = async (req, res) => {
  try {
    const negotiations = await dbManager.negotiations.find({ buyer: req.user._id.toString() });
    res.json(negotiations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active negotiations for seller (farmer)
// @route   GET /api/negotiations/seller
// @access  Private/Farmer
const getSellerNegotiations = async (req, res) => {
  try {
    const negotiations = await dbManager.negotiations.find({ seller: req.user._id.toString() });
    res.json(negotiations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit counteroffer
// @route   POST /api/negotiations/:id/counter
// @access  Private
const counterOffer = async (req, res) => {
  const { offerPrice, message } = req.body;
  const userId = req.user._id.toString();

  try {
    const negotiation = await dbManager.negotiations.findById(req.params.id);
    if (!negotiation) return res.status(404).json({ message: 'Negotiation record not found' });

    const isBuyer = negotiation.buyer._id.toString() === userId;
    const isSeller = negotiation.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const offer = Number(offerPrice);
    
    // Safety check on counteroffer limits
    if (isBuyer && offer < negotiation.minPrice) {
      return res.status(400).json({ 
        message: `Your offer (Rs ${offer}) is below the farmer's minimum acceptable threshold (Rs ${negotiation.minPrice}).` 
      });
    }

    const senderRole = isBuyer ? 'buyer' : 'seller';
    const recipientId = isBuyer ? negotiation.seller._id : negotiation.buyer._id;
    const recipientName = isBuyer ? negotiation.sellerName : negotiation.buyerName;
    const senderName = isBuyer ? negotiation.buyerName : negotiation.sellerName;

    const updated = await dbManager.negotiations.findByIdAndUpdate(req.params.id, {
      currentOffer: offer,
      lastOfferBy: senderRole,
      status: 'Counter',
      $push: {
        messages: {
          sender: senderRole,
          text: message || `Counteroffer submitted: Rs ${offer}/unit.`,
          offer
        }
      }
    });

    await createNotification(
      recipientId,
      isBuyer ? 'Buyer Sent a Counter Offer' : 'Farmer Sent a Counter Offer',
      `${senderName} submitted a counter-offer of ₹${offer}/Quintal.`,
      'negotiation',
      req.params.id
    );

    socketManager.broadcastToChannel(`negotiation:${req.params.id}`, {
      type: 'counter',
      negotiation: updated
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept bargaining offer
// @route   POST /api/negotiations/:id/accept
// @access  Private
const acceptOffer = async (req, res) => {
  const userId = req.user._id.toString();

  try {
    const negotiation = await dbManager.negotiations.findById(req.params.id);
    if (!negotiation) return res.status(404).json({ message: 'Negotiation record not found' });

    const isBuyer = negotiation.buyer._id.toString() === userId;
    const isSeller = negotiation.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const senderRole = isBuyer ? 'buyer' : 'seller';
    const recipientId = isBuyer ? negotiation.seller._id : negotiation.buyer._id;
    const senderName = isBuyer ? negotiation.buyerName : negotiation.sellerName;

    const updated = await dbManager.negotiations.findByIdAndUpdate(req.params.id, {
      status: 'Accepted',
      $push: {
        messages: {
          sender: senderRole,
          text: `Offer accepted! Agreed final price: Rs ${negotiation.currentOffer}/unit. Proceed to checkout.`,
          offer: negotiation.currentOffer
        }
      }
    });

    await createNotification(
      recipientId,
      isBuyer ? 'Buyer Accepted Counter Offer' : 'Farmer Accepted Your Offer',
      `${senderName} accepted the offer of ₹${negotiation.currentOffer}/Quintal.`,
      'negotiation',
      req.params.id
    );

    socketManager.broadcastToChannel(`negotiation:${req.params.id}`, {
      type: 'accept',
      negotiation: updated
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject bargaining offer
// @route   POST /api/negotiations/:id/reject
// @access  Private
const rejectOffer = async (req, res) => {
  const userId = req.user._id.toString();

  try {
    const negotiation = await dbManager.negotiations.findById(req.params.id);
    if (!negotiation) return res.status(404).json({ message: 'Negotiation record not found' });

    const isBuyer = negotiation.buyer._id.toString() === userId;
    const isSeller = negotiation.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const senderRole = isBuyer ? 'buyer' : 'seller';
    const recipientId = isBuyer ? negotiation.seller._id : negotiation.buyer._id;
    const senderName = isBuyer ? negotiation.buyerName : negotiation.sellerName;

    const updated = await dbManager.negotiations.findByIdAndUpdate(req.params.id, {
      status: 'Rejected',
      $push: {
        messages: {
          sender: senderRole,
          text: `Bargaining rejected.`,
          offer: negotiation.currentOffer
        }
      }
    });

    await createNotification(
      recipientId,
      'Bargain Offer Rejected',
      `${senderName} declined the bargaining proposal.`,
      'negotiation',
      req.params.id
    );

    socketManager.broadcastToChannel(`negotiation:${req.params.id}`, {
      type: 'reject',
      negotiation: updated
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startNegotiation,
  getBuyerNegotiations,
  getSellerNegotiations,
  counterOffer,
  acceptOffer,
  rejectOffer
};
