const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/wallet', protect, updateWallet);
router.post('/favorite/:id', protect, toggleFavorite);

// Admin Routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/verify/:id', protect, authorize('admin'), verifyFarmer);

module.exports = router;
