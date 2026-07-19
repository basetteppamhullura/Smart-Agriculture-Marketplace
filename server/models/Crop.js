const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  localName: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: [
      'Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 
      'Flowers', 'Seeds', 'Organic products', 'Dairy products', 
      'Agricultural equipment', 'Fertilizers', 'Other farm-related products',
      'Oil Seeds', 'Commercial Crops'
    ],
    default: 'Grains'
  },
  quantity: {
    type: Number, // in kg or units
    required: true
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'Premium'],
    default: 'A'
  },
  harvestDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  district: {
    type: String,
    default: 'Mandya'
  },
  village: {
    type: String,
    default: ''
  },
  listingMode: {
    type: String,
    enum: ['auction', 'buynow'],
    required: true
  },
  price: {
    type: Number, // Buy Now price or starting bid price
    required: true
  },
  minPriceAcceptable: {
    type: Number,
    default: 0
  },
  aiPriceRecommended: {
    type: Number
  },
  imageUrl: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  stockStatus: {
    type: String,
    enum: ['in-stock', 'out-of-stock', 'sold-out'],
    default: 'in-stock'
  },
  deliveryOption: {
    type: String,
    enum: ['farm-pickup', 'logistics-delivery'],
    default: 'logistics-delivery'
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  analytics: {
    views: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Crop || mongoose.model('Crop', CropSchema);
