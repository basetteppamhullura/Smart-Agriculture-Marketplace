import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { MessageSquare, ArrowUp, Send, CheckCircle, Award } from 'lucide-react';

export default function CommunityForum() {
  const { user, apiUrl } = useAuth();
  const { t } = useThemeLanguage();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter category
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form states (new post)
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Organic Farming');
  const [newContent, setNewContent] = useState('');

  // Comment input state (mapped by post ID)
  const [commentInputs, setCommentInputs] = useState({});

  const token = localStorage.getItem('sam-token');

  const loadPosts = async () => {
    try {
      const res = await fetch(`${apiUrl}/forum`);
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [apiUrl]);

  // Create post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to participate in discussion forums.');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setShowCreate(false);
        await loadPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upvote post
  const handleUpvote = async (postId) => {
    if (!token) {
      alert('Please log in to upvote posts.');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/forum/${postId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit comment
  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    if (!token) {
      alert('Please log in to submit comments.');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/forum/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });

      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        await loadPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Community Forum...</div>;
  }

  // Filter posts
  const filteredPosts = categoryFilter === 'All' 
    ? posts 
    : posts.filter(p => p.category === categoryFilter);

  const categories = ['All', 'Organic Farming', 'Pest Control', 'Government Subsidy', 'Market Trends', 'Irrigation'];

  return (
    <div className="fade-in" style={styles.container}>
      {/* Title */}
      <div className="glass-card" style={styles.header}>
        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '22px' }}>{t('navForum')}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Ask peer farmers for organic pesticide recipes, discuss monsoon cropping cycles, or read advice verified by certified agri-advisors.
            </p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
              {showCreate ? 'Back to Feed' : 'Start New Topic'}
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Scroller */}
      {!showCreate && (
        <div style={styles.categoriesBar}>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setCategoryFilter(cat)}
              style={{
                ...styles.categoryTab,
                backgroundColor: categoryFilter === cat ? 'var(--forest-green)' : 'var(--bg-secondary)',
                color: categoryFilter === cat ? 'white' : 'var(--text-primary)',
                borderColor: categoryFilter === cat ? 'var(--forest-green)' : 'var(--border-color)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* NEW POST FORM */}
      {showCreate ? (
        <div className="glass-card" style={styles.createCard}>
          <h3 style={{ marginBottom: '15px' }}>Ask the Farming Community</h3>
          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label>Topic Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="What is your farming query?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category Tag</label>
              <select className="form-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                <option value="Organic Farming">Organic Farming</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Government Subsidy">Government Subsidy</option>
                <option value="Market Trends">Market Trends</option>
                <option value="Irrigation">Irrigation</option>
                <option value="General">General Questions</option>
              </select>
            </div>

            <div className="form-group">
              <label>Detailed Query Description</label>
              <textarea
                className="form-input"
                style={{ height: '120px', resize: 'none' }}
                placeholder="Describe plant symptoms, soil metrics, or subsidy conditions you have questions on..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              Publish Topic
            </button>
          </form>
        </div>
      ) : (
        /* POSTS LIST */
        <div style={styles.feed}>
          {filteredPosts.length === 0 ? (
            <div style={styles.empty}>No topics found in this category. Be the first to start a discussion!</div>
          ) : (
            filteredPosts.map((post) => {
              const isUpvoted = user && post.upvotes && post.upvotes.includes(user._id);
              return (
                <div key={post._id} className="glass-card" style={styles.postCard}>
                  {/* Post Main Body */}
                  <div style={styles.postHeader}>
                    <div>
                      <span className="badge badge-verified" style={{ marginBottom: '8px' }}>{post.category}</span>
                      <h3 style={{ fontSize: '18px', marginTop: '4px' }}>{post.title}</h3>
                      <p style={styles.authorLine}>
                        by {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Upvotes */}
                    <button 
                      onClick={() => handleUpvote(post._id)}
                      style={{
                        ...styles.upvoteBtn,
                        backgroundColor: isUpvoted ? 'var(--green-glow)' : 'transparent',
                        borderColor: isUpvoted ? 'var(--forest-green)' : 'var(--border-color)',
                        color: isUpvoted ? 'var(--forest-green)' : 'var(--text-secondary)'
                      }}
                    >
                      <ArrowUp size={16} />
                      <span>{post.upvotes ? post.upvotes.length : 0}</span>
                    </button>
                  </div>

                  <p style={styles.postContent}>{post.content}</p>

                  {/* Expert Answer indicator */}
                  {post.isExpertAnswered && (
                    <div style={styles.expertAlert}>
                      <CheckCircle size={14} color="var(--emerald)" />
                      <span>Contains verified Expert Consultation advisor response</span>
                    </div>
                  )}

                  {/* Comments log */}
                  <div style={styles.commentsSection}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                      Comments & Replies ({post.comments ? post.comments.length : 0})
                    </div>
                    
                    {post.comments && post.comments.map((c, cIdx) => (
                      <div key={cIdx} style={styles.commentRow}>
                        <div style={styles.commentMeta}>
                          <strong>{c.authorName}</strong>
                          {c.authorRole === 'admin' && (
                            <span className="badge badge-trusted" style={{ fontSize: '8px', padding: '1px 5px' }}>
                              Agri Expert
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={styles.commentText}>{c.content}</p>
                      </div>
                    ))}

                    {/* Comment Input */}
                    {user && (
                      <form 
                        onSubmit={(e) => handleAddComment(e, post._id)} 
                        style={styles.commentForm}
                      >
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Reply to this topic..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                        />
                        <button type="submit" style={styles.commentSendBtn}>
                          <Send size={14} color="white" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '50px'
  },
  header: {
    padding: '20px'
  },
  categoriesBar: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '8px'
  },
  categoryTab: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)'
  },
  postCard: {
    padding: '24px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px'
  },
  authorLine: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  },
  upvoteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  postContent: {
    fontSize: '14px',
    marginTop: '12px',
    lineHeight: '1.6',
    color: 'var(--text-primary)'
  },
  expertAlert: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '6px',
    color: 'var(--forest-green)',
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '15px'
  },
  commentsSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  commentRow: {
    padding: '12px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  commentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px'
  },
  commentText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  commentForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px'
  },
  commentSendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50px',
    backgroundColor: 'var(--forest-green)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  createCard: {
    animation: 'fadeIn 0.3s ease-out'
  }
};
