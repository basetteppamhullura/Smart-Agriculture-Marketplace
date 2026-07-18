const dbManager = require('../utils/dbManager');

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
const getPosts = async (req, res) => {
  try {
    const posts = await dbManager.forumPosts.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a forum post
// @route   POST /api/forum
// @access  Private
const createPost = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const post = await dbManager.forumPosts.create({
      author: req.user._id,
      authorName: req.user.name,
      title,
      content,
      category: category || 'General'
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/forum/:id/comment
// @access  Private
const addComment = async (req, res) => {
  const { content } = req.body;

  try {
    const commentObj = {
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      content,
      createdAt: new Date().toISOString()
    };

    // If an Admin comments, mark the post as Expert Answered
    const isExpert = req.user.role === 'admin';
    const update = {
      $push: { comments: commentObj }
    };
    if (isExpert) {
      update.isExpertAnswered = true;
    }

    const updatedPost = await dbManager.forumPosts.findByIdAndUpdate(req.params.id, update);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote a post
// @route   POST /api/forum/:id/upvote
// @access  Private
const toggleUpvote = async (req, res) => {
  try {
    const post = await dbManager.forumPosts.find({ _id: req.params.id });
    if (post.length === 0) return res.status(404).json({ message: 'Post not found' });
    const targetPost = post[0];

    targetPost.upvotes = targetPost.upvotes || [];
    const index = targetPost.upvotes.indexOf(req.user._id.toString());

    if (index === -1) {
      targetPost.upvotes.push(req.user._id.toString());
    } else {
      targetPost.upvotes.splice(index, 1);
    }

    const updated = await dbManager.forumPosts.findByIdAndUpdate(req.params.id, { upvotes: targetPost.upvotes });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  addComment,
  toggleUpvote
};
