const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbManager = require('../utils/dbManager');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, location, language } = req.body;

  try {
    const userExists = await dbManager.users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Dynamic initial farming score for farmers
    const initialScore = role === 'farmer' ? {
      quality: 4.5,
      deliveryReliability: 4.5,
      sustainablePractices: 4.5,
      priceFairness: 4.5,
      overallScore: 4.5
    } : undefined;

    const user = await dbManager.users.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'buyer',
      location: location || 'Karnataka, India',
      language: language || 'en',
      smartFarmingScore: initialScore,
      hasTrustedBadge: role === 'farmer' ? true : false,
      walletBalance: role === 'buyer' ? 25000 : 5000 // Give buyers more starting credits to bid/buy
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance,
      language: user.language,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await dbManager.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance,
      language: user.language,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await dbManager.users.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify farmer (Admin only)
// @route   PUT /api/auth/verify/:id
// @access  Private/Admin
const verifyFarmer = async (req, res) => {
  try {
    const farmer = await dbManager.users.findByIdAndUpdate(req.params.id, { isVerified: true });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json({ message: 'Farmer profile verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Top-up / Withdraw from digital wallet
// @route   POST /api/auth/wallet
// @access  Private
const updateWallet = async (req, res) => {
  const { amount, type } = req.body; // type: 'deposit' | 'withdraw'

  try {
    const user = await dbManager.users.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let newBalance = user.walletBalance;
    if (type === 'deposit') {
      newBalance += Number(amount);
    } else if (type === 'withdraw') {
      if (user.walletBalance < Number(amount)) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      newBalance -= Number(amount);
    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const updatedUser = await dbManager.users.findByIdAndUpdate(req.user._id, { walletBalance: newBalance });
    res.json({ walletBalance: updatedUser.walletBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add / Remove farmer from buyer's favorites list
// @route   POST /api/auth/favorite/:id
// @access  Private/Buyer
const toggleFavorite = async (req, res) => {
  try {
    const buyer = await dbManager.users.findById(req.user._id);
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

    buyer.favoriteFarmers = buyer.favoriteFarmers || [];
    const index = buyer.favoriteFarmers.indexOf(req.params.id);

    if (index === -1) {
      // Add favorite
      await dbManager.users.findByIdAndUpdate(req.user._id, { $push: { favoriteFarmers: req.params.id } });
      res.json({ message: 'Farmer added to favorites', action: 'added' });
    } else {
      // Remove favorite
      buyer.favoriteFarmers.splice(index, 1);
      await dbManager.users.findByIdAndUpdate(req.user._id, { favoriteFarmers: buyer.favoriteFarmers });
      res.json({ message: 'Farmer removed from favorites', action: 'removed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await dbManager.users.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// In-memory store for OTPs: { email: { otp: '123456', expiresAt: timestamp } }
const otpStore = {};

// @desc    Request Forgot Password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email address is required' });

  try {
    const user = await dbManager.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No registered user found with this email address' });
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase().trim()] = {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    };

    console.log(`Forgot Password OTP for ${email}: ${generatedOtp}`);

    res.json({
      success: true,
      message: 'OTP verification code has been dispatched to your email address.',
      otp: generatedOtp // Returned for dev testing convenience
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP Code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP code are required' });

  const record = otpStore[email.toLowerCase().trim()];
  if (!record) {
    return res.status(400).json({ message: 'No active OTP request found. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email.toLowerCase().trim()];
    return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
  }

  res.json({
    success: true,
    message: 'OTP verified successfully. Proceed to set your new password.'
  });
};

// @desc    Reset Password with verified OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  const record = otpStore[email.toLowerCase().trim()];
  if (!record || record.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Invalid or expired OTP session' });
  }

  try {
    const user = await dbManager.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await dbManager.users.findByIdAndUpdate(user._id, { password: hashedPassword });
    delete otpStore[email.toLowerCase().trim()];

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  verifyFarmer,
  updateWallet,
  toggleFavorite,
  getAllUsers,
  forgotPassword,
  verifyOtp,
  resetPassword
};
