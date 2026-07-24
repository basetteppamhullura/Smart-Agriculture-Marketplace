import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, User, MessageSquare, ShieldAlert, Clock } from 'lucide-react';

export default function ChatRooms() {
  const { user, apiUrl } = useAuth();
  const { subscribe } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  
  const token = localStorage.getItem('sam-token');
  const messagesEndRef = useRef(null);

  // Fetch all chat rooms
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await fetch(`${apiUrl}/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [apiUrl]);

  // Handle active room messages selection
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }
    setMessages(selectedRoom.messages || []);
    scrollToBottom();

    // Subscribe to chat channel
    const unsubscribe = subscribe(`chat:${selectedRoom._id}`, (event) => {
      console.log('Received WebSocket chat message:', event);
      if (event.type === 'chat_msg') {
        setMessages(prev => {
          // Avoid duplicate triggers
          const exists = prev.some(m => m.text === event.message.text && m.sender === event.message.sender && Math.abs(new Date(m.createdAt) - new Date(event.message.createdAt)) < 1500);
          if (exists) return prev;
          return [...prev, event.message];
        });
        scrollToBottom();
      }
    });

    return () => unsubscribe();
  }, [selectedRoom]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Submit message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    const otherParticipant = user.role === 'buyer' 
      ? (selectedRoom.farmer?._id || selectedRoom.farmer) 
      : (selectedRoom.buyer?._id || selectedRoom.buyer);

    try {
      const res = await fetch(`${apiUrl}/chats/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: otherParticipant,
          text: inputText
        })
      });

      if (res.ok) {
        const updated = await res.json();
        // Update rooms status
        setRooms(prev => prev.map(r => r._id === selectedRoom._id ? updated : r));
        // Append local state
        setMessages(updated.messages || []);
        setInputText('');
        scrollToBottom();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.chatContainer} className="glass-card">
      {/* Sidebar - Rooms List */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <MessageSquare size={16} />
          <h4 style={{ margin: 0, fontSize: '14px' }}>Wholesale B2B Chat Rooms</h4>
        </div>
        
        <div style={styles.roomsList}>
          {loadingRooms ? (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px' }}>Loading conversations...</div>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              No chat logs found. Go to Catalogs to initiate a chat with farmers.
            </div>
          ) : (
            rooms.map((room) => {
              const otherUser = user.role === 'buyer' ? room.farmer : room.buyer;
              const isSelected = selectedRoom && selectedRoom._id === room._id;
              const lastMsg = room.messages && room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;

              return (
                <div 
                  key={room._id} 
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    ...styles.roomItem,
                    backgroundColor: isSelected ? 'var(--green-glow)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--forest-green)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={styles.avatar}>
                      <User size={14} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px' }}>{otherUser?.name || 'Trade Participant'}</strong>
                      <div style={styles.roomRole}>{otherUser?.role === 'buyer' ? 'Wholesale Buyer' : 'APMC Farmer'}</div>
                    </div>
                  </div>
                  {lastMsg && (
                    <div style={styles.lastMsgText}>
                      {lastMsg.text.length > 35 ? `${lastMsg.text.substring(0, 32)}...` : lastMsg.text}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat window pane */}
      <div style={styles.chatWindow}>
        {selectedRoom ? (
          <>
            {/* Header */}
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={styles.avatar}>
                  <User size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>
                    {user.role === 'buyer' ? selectedRoom.farmer?.name : selectedRoom.buyer?.name}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    APMC B2B Secure Chat Room • Region: {user.role === 'buyer' ? selectedRoom.farmer?.location : selectedRoom.buyer?.location || 'APMC Mandi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div style={styles.messagesBody}>
              {messages.map((msg, index) => {
                const isMine = msg.sender === user.role;
                return (
                  <div 
                    key={index}
                    style={{
                      ...styles.messageRow,
                      justifyContent: isMine ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div 
                      style={{
                        ...styles.msgBubble,
                        backgroundColor: isMine ? 'var(--forest-green)' : 'var(--bg-secondary)',
                        color: isMine ? 'white' : 'var(--text-primary)',
                        borderBottomRightRadius: isMine ? '2px' : '10px',
                        borderBottomLeftRadius: isMine ? '10px' : '2px'
                      }}
                    >
                      <div style={{ fontSize: '13px' }}>{msg.text}</div>
                      <div style={{ ...styles.msgTime, color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={styles.inputForm}>
              <input 
                type="text"
                className="form-input"
                style={{ padding: '10px 14px', fontSize: '13px', borderRadius: '8px' }}
                placeholder="Type your B2B trade proposal message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div style={styles.noChatSelected}>
            <MessageSquare size={36} color="var(--text-secondary)" />
            <h4 style={{ margin: '10px 0 4px 0' }}>B2B Negotiations & Support Chat</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              Select a conversation from the sidebar to chat in real time, negotiate wholesale prices, or ask about logistics cargo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  chatContainer: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    height: '480px',
    overflow: 'hidden',
    padding: 0,
    border: '1px solid var(--border-color)',
    borderRadius: '12px'
  },
  sidebar: {
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.02)'
  },
  sidebarHeader: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--forest-green)',
    fontWeight: 'bold'
  },
  roomsList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  roomItem: {
    padding: '12px',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    transition: 'background-color 0.2s'
  },
  roomRole: {
    fontSize: '10px',
    color: 'var(--text-secondary)'
  },
  lastMsgText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)'
  },
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.01)'
  },
  chatHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)'
  },
  messagesBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  msgBubble: {
    padding: '8px 12px',
    borderRadius: '10px',
    maxWidth: '70%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  msgTime: {
    fontSize: '9px',
    alignSelf: 'flex-end'
  },
  inputForm: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    gap: '8px'
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px'
  }
};
