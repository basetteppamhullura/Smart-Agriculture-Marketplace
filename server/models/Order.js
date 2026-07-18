const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  deliveryStatus: {
    type: String,
    enum: ['processing', 'dispatched', 'in-transit', 'delivered'],
    default: 'processing'
  },
  trackingTimeline: [{
    status: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
  }],
  subscriptionDetails: {
    isSubscription: { type: Boolean, default: false },
    frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: 'weekly' }
  },
  logistics: {
    partnerName: { type: String, default: 'AgriExpress Logistics' },
    vehicleNumber: { type: String, default: 'KA-19-MH-4220' },
    driverName: { type: String, default: 'Ramesh Kumar' },
    driverPhone: { type: String, default: '+91 98765 43210' },
    estimatedDelivery: { type: Date }
  },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
