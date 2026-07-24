const dbManager = require('./dbManager');
const socketManager = require('./socketManager');

const createNotification = async (recipientId, title, msg, type, relatedId = '') => {
  try {
    const notif = await dbManager.notifications.create({
      recipient: recipientId.toString(),
      title,
      msg,
      type,
      relatedId: relatedId ? relatedId.toString() : ''
    });
    
    // Broadcast real-time socket message to user's notifications channel
    socketManager.sendToUser(recipientId.toString(), notif);
    return notif;
  } catch (err) {
    console.error('Failed to create/send notification:', err.message);
  }
};

module.exports = { createNotification };
