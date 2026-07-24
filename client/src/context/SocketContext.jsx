import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, apiUrl } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  const listeners = useRef({});
  const wsRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('sam-token');
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Connect WebSocket
  useEffect(() => {
    if (!user) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Determine ws url
    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProto}://localhost:5000`; // standard port for our backend
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      console.log('Connected to agricultural B2B WebSocket');
      const token = localStorage.getItem('sam-token');
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { channel, data: messageData } = data;

        // 1. Check if it is a personal notification
        if (channel === `user:${user._id}`) {
          setNotifications(prev => {
            const list = [messageData, ...prev];
            setUnreadCount(list.filter(n => !n.read).length);
            return list;
          });
        }

        // 2. Call registered listeners
        if (channel && listeners.current[channel]) {
          listeners.current[channel].forEach(callback => {
            callback(messageData);
          });
        }
      } catch (err) {
        console.error('Error handling websocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from B2B WebSocket');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [user, apiUrl]);

  // Subscribe to channel pub/sub helper
  const subscribe = (channel, callback) => {
    if (!listeners.current[channel]) {
      listeners.current[channel] = [];
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
      }
    }
    listeners.current[channel].push(callback);

    // Return unsubscribe callback
    return () => {
      if (listeners.current[channel]) {
        listeners.current[channel] = listeners.current[channel].filter(cb => cb !== callback);
        if (listeners.current[channel].length === 0) {
          delete listeners.current[channel];
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
          }
        }
      }
    };
  };

  // Mark notification read
  const markAsRead = async (id) => {
    const token = localStorage.getItem('sam-token');
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem('sam-token');
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send direct message on active channel
  const sendChatMessage = (negotiationId, text, sender) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        negotiationId,
        text,
        sender
      }));
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, subscribe, markAsRead, markAllAsRead, sendChatMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
