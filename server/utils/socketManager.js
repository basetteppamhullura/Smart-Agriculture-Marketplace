const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

let wss = null;
const userConnections = new Map(); // userId -> Set(socket)
const channelConnections = new Map(); // channelName -> Set(socket)

const init = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (message) => {
      try {
        const payload = JSON.parse(message);
        console.log('WS Message received:', payload.type, payload.channel || '');

        if (payload.type === 'auth') {
          const { token } = payload;
          if (token) {
            try {
              const decoded = jwt.verify(token, JWT_SECRET);
              const userId = decoded.id;
              ws.userId = userId;

              if (!userConnections.has(userId)) {
                userConnections.set(userId, new Set());
              }
              userConnections.get(userId).add(ws);

              // Auto subscribe to user notifications
              subscribeToChannel(ws, `user:${userId}`);

              ws.send(JSON.stringify({ type: 'authenticated', userId }));
              console.log(`WS User Authenticated: ${userId}`);
            } catch (err) {
              console.error('WS auth error:', err.message);
              ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
            }
          }
        }

        if (payload.type === 'subscribe') {
          subscribeToChannel(ws, payload.channel);
        }

        if (payload.type === 'unsubscribe') {
          unsubscribeFromChannel(ws, payload.channel);
        }

        if (payload.type === 'chat') {
          const { negotiationId, text, sender } = payload;
          broadcastToChannel(`negotiation:${negotiationId}`, {
            type: 'chat',
            negotiationId,
            text,
            sender,
            createdAt: new Date().toISOString()
          }, ws); // exclude sender
        }
      } catch (err) {
        console.error('WS message error:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (ws.userId && userConnections.has(ws.userId)) {
        userConnections.get(ws.userId).delete(ws);
        if (userConnections.get(ws.userId).size === 0) {
          userConnections.delete(ws.userId);
        }
      }

      for (const [channel, sockets] of channelConnections.entries()) {
        if (sockets.has(ws)) {
          sockets.delete(ws);
          if (sockets.size === 0) {
            channelConnections.delete(channel);
          }
        }
      }
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

const subscribeToChannel = (ws, channel) => {
  if (!channel) return;
  if (!channelConnections.has(channel)) {
    channelConnections.set(channel, new Set());
  }
  channelConnections.get(channel).add(ws);
};

const unsubscribeFromChannel = (ws, channel) => {
  if (!channel) return;
  if (channelConnections.has(channel)) {
    channelConnections.get(channel).delete(ws);
    if (channelConnections.get(channel).size === 0) {
      channelConnections.delete(channel);
    }
  }
};

const broadcastToChannel = (channel, data, excludeWs = null) => {
  const sockets = channelConnections.get(channel);
  if (sockets) {
    const payload = JSON.stringify({ channel, data });
    for (const ws of sockets) {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
};

const sendToUser = (userId, data) => {
  const sockets = userConnections.get(userId);
  if (sockets) {
    const payload = JSON.stringify({ channel: `user:${userId}`, data });
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
};

module.exports = {
  init,
  broadcastToChannel,
  sendToUser
};
