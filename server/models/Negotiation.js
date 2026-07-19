const mongoose = require('mongoose');

const NegotiationSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  initialOffer: {
    type: Number,
    required: true
  },
  currentOffer: {
    type: Number,
    required: true
  },
  lastOfferBy: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Counter'],
    default: 'Pending'
  },
  minPrice: {
    type: Number,
    required: true
  },
  messages: [{
    sender: { type: String, enum: ['buyer', 'seller'], required: true },
    text: { type: String, default: '' },
    offer: { type: Number },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Negotiation || mongoose.model('Negotiation', NegotiationSchema);
