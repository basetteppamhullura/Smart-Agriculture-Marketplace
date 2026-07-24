const dbManager = require('../utils/dbManager');
const socketManager = require('../utils/socketManager');

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const query = req.user.role === 'buyer' 
      ? { buyer: userId } 
      : { farmer: userId };

    const chats = await dbManager.chats.find(query);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat message history
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chat = await dbManager.chats.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Verify user is participant
    const buyerId = chat.buyer._id ? chat.buyer._id.toString() : chat.buyer.toString();
    const farmerId = chat.farmer._id ? chat.farmer._id.toString() : chat.farmer.toString();
    const userId = req.user._id.toString();

    if (userId !== buyerId && userId !== farmerId) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message or create new room
// @route   POST /api/chats/message
// @access  Private
const sendMessage = async (req, res) => {
  const { recipientId, text } = req.body;
  if (!recipientId || !text.trim()) {
    return res.status(400).json({ message: 'Recipient and message text required' });
  }

  try {
    const userId = req.user._id.toString();
    const role = req.user.role; // 'buyer' or 'farmer'

    const buyerId = role === 'buyer' ? userId : recipientId;
    const farmerId = role === 'farmer' ? userId : recipientId;

    // Check if chat room already exists
    let chat = await dbManager.chats.findOne({ buyer: buyerId, farmer: farmerId });
    if (!chat) {
      chat = await dbManager.chats.create({ buyer: buyerId, farmer: farmerId });
    }

    const messageItem = {
      sender: role,
      text,
      createdAt: new Date().toISOString()
    };

    const updatedChat = await dbManager.chats.findByIdAndUpdate(chat._id, {
      $push: { messages: messageItem }
    });

    // Broadcast the new message to participants over websocket
    socketManager.broadcastToChannel(`chat:${chat._id}`, {
      type: 'chat_msg',
      chatId: chat._id,
      message: messageItem
    });

    // Send a push notification to recipient
    const { createNotification } = require('../utils/notificationHelper');
    await createNotification(
      recipientId,
      `New Message from ${req.user.name}`,
      text.length > 50 ? `${text.substring(0, 47)}...` : text,
      'system',
      chat._id
    );

    res.status(201).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserChats,
  getChatById,
  sendMessage
};
