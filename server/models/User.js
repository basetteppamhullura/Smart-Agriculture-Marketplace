const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    default: 'buyer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    default: 'Karnataka, India'
  },
  walletBalance: {
    type: Number,
    default: 5000 // Free trial balance
  },
  language: {
    type: String,
    default: 'en'
  },
  smartFarmingScore: {
    quality: { type: Number, default: 4.5 },
    deliveryReliability: { type: Number, default: 4.8 },
    sustainablePractices: { type: Number, default: 4.2 },
    priceFairness: { type: Number, default: 4.6 },
    overallScore: { type: Number, default: 4.5 }
  },
  hasTrustedBadge: {
    type: Boolean,
    default: false
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  favoriteFarmers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto calculate score and award trusted badge
UserSchema.pre('save', function(next) {
  if (this.role === 'farmer') {
    const s = this.smartFarmingScore;
    s.overallScore = parseFloat(((s.quality + s.deliveryReliability + s.sustainablePractices + s.priceFairness) / 4).toFixed(1));
    this.hasTrustedBadge = s.overallScore >= 4.5;
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
