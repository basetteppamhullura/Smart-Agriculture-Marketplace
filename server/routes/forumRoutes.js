const express = require('express');
const router = express.Router();
const { 
  getPosts, 
  createPost, 
  addComment, 
  toggleUpvote 
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.post('/:id/comment', protect, addComment);
router.post('/:id/upvote', protect, toggleUpvote);

module.exports = router;
