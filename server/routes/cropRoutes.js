const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getCrops);
router.get('/farmer/dashboard', protect, authorize('farmer'), getFarmerDashboard);
router.post('/', protect, authorize('farmer'), uploadCrop);
router.get('/:id', getCropById);
router.put('/:id', protect, authorize('farmer'), editCrop);
router.delete('/:id', protect, authorize('farmer'), deleteCrop);
router.put('/:id/inventory', protect, authorize('farmer'), updateInventory);

// Reviews & Q&A
router.get('/:id/reviews', getCropReviews);
router.post('/:id/reviews', protect, postCropReview);
router.post('/:id/reviews/:reviewId/like', protect, toggleReviewLike);
router.get('/:id/questions', getCropQuestions);
router.post('/:id/questions', protect, askCropQuestion);
router.post('/:id/questions/:questionId/answers', protect, answerCropQuestion);

module.exports = router;
