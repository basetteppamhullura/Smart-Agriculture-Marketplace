import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Star, ThumbsUp, CheckCircle, Image, HelpCircle, MessageCircle, AlertCircle } from 'lucide-react';

export default function ProductReviewsSection({ cropId }) {
  const { user, apiUrl } = useAuth();
  const { t, language } = useThemeLanguage();

  const token = localStorage.getItem('sam-token');

  // Review states
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Form states (Submit Review)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [sentiment, setSentiment] = useState('Good');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [reviewImageUrl, setReviewImageUrl] = useState('');
  const [reviewImagesList, setReviewImagesList] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Filters state
  const [filterType, setFilterType] = useState('all'); // 'all' | '5-star' | 'recent' | 'with-images' | 'positive' | 'negative'

  // Q&A states
  const [questions, setQuestions] = useState([]);
  const [qnaLoading, setQnaLoading] = useState(true);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [answerInputs, setAnswerInputs] = useState({}); // questionId -> answer text

  // Load reviews & Q&A
  const loadReviewsAndQnA = async () => {
    try {
      const revRes = await fetch(`${apiUrl}/crops/${cropId}/reviews`);
      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
        setTotalReviews(revData.totalReviews || 0);
        setAverageRating(revData.averageRating || 0);
      }

      const qnaRes = await fetch(`${apiUrl}/crops/${cropId}/questions`);
      if (qnaRes.ok) {
        const qnaData = await qnaRes.json();
        setQuestions(qnaData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
      setQnaLoading(false);
    }
  };

  // Check verified buyer eligibility
  const checkEligibility = async () => {
    if (!user || user.role !== 'buyer') {
      setIsEligible(false);
      setEligibilityChecked(true);
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const orders = await res.json();
        // Check if user has purchased this crop and completed payment
        const hasPurchased = orders.some(o => o.crop?._id === cropId && o.paymentStatus === 'paid');
        setIsEligible(hasPurchased);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEligibilityChecked(true);
    }
  };

  useEffect(() => {
    loadReviewsAndQnA();
    checkEligibility();
  }, [cropId, apiUrl]);

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (comment.trim().length < 10) {
      setReviewError('Please write a detailed comment (at least 10 characters).');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/crops/${cropId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          sentiment,
          comment,
          recommend,
          images: reviewImagesList
        })
      });

      if (res.ok) {
        alert('Review submitted successfully!');
        setComment('');
        setReviewImageUrl('');
        setReviewImagesList([]);
        setShowReviewForm(false);
        loadReviewsAndQnA();
      } else {
        const errData = await res.json();
        setReviewError(errData.message || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewError('Network error. Try again.');
    }
  };

  // Helper to add review image to temp list
  const handleAddReviewImage = () => {
    if (reviewImageUrl.trim()) {
      setReviewImagesList(prev => [...prev, reviewImageUrl.trim()]);
      setReviewImageUrl('');
    }
  };

  // Quick attach mock images
  const handleAttachSamplePhoto = (type) => {
    const samples = {
      product: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80",
      packaging: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80",
      delivery: "https://images.unsplash.com/photo-1599934254399-b87987ceb72a?auto=format&fit=crop&w=300&q=80"
    };
    setReviewImagesList(prev => [...prev, samples[type]]);
  };

  // Toggle Review Like Helpful Button
  const handleToggleLike = async (reviewId) => {
    if (!user) {
      alert('Please login to rate reviews.');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/crops/${cropId}/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadReviewsAndQnA();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Question
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/crops/${cropId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questionText: newQuestionText })
      });
      if (res.ok) {
        setNewQuestionText('');
        loadReviewsAndQnA();
        alert('Question submitted to community!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Answer
  const handleAnswerQuestion = async (questionId) => {
    const answerText = answerInputs[questionId];
    if (!answerText || !answerText.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/crops/${cropId}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answerText })
      });
      if (res.ok) {
        setAnswerInputs(prev => ({ ...prev, [questionId]: '' }));
        loadReviewsAndQnA();
        alert('Your response has been published!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering reviews calculations
  const filteredReviews = reviews.filter(rev => {
    if (filterType === '5-star') return rev.rating === 5;
    if (filterType === 'with-images') return rev.images && rev.images.length > 0;
    if (filterType === 'positive') return rev.rating >= 4 || rev.sentiment === 'Good';
    if (filterType === 'negative') return rev.rating <= 2 || rev.sentiment === 'Bad';
    return true; // 'all' or 'recent'
  }).sort((a, b) => {
    if (filterType === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0; // retain default DB sorting
  });

  return (
    <div style={styles.container}>
      {/* SECTION HEADER & RATING BREAKDOWN */}
      <h3 style={styles.sectionHeader}>{language === 'kn' ? 'ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆ' : 'Customer Reviews & Feedback'}</h3>
      
      <div style={styles.ratingSummaryRow}>
        <div style={styles.avgBox}>
          <div style={styles.bigRating}>{averageRating}</div>
          <div style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={16} 
                fill={s <= Math.round(averageRating) ? "var(--amber-gold)" : "none"} 
                color="var(--amber-gold)" 
              />
            ))}
          </div>
          <div style={styles.totalReviewsText}>{totalReviews} total reviews</div>
        </div>

        <div style={styles.filtersGroup}>
          <button 
            onClick={() => setFilterType('all')} 
            style={{...styles.filterBtn, ...(filterType === 'all' && styles.activeFilter)}}
          >
            All Reviews
          </button>
          <button 
            onClick={() => setFilterType('5-star')} 
            style={{...styles.filterBtn, ...(filterType === '5-star' && styles.activeFilter)}}
          >
            5 Star
          </button>
          <button 
            onClick={() => setFilterType('recent')} 
            style={{...styles.filterBtn, ...(filterType === 'recent' && styles.activeFilter)}}
          >
            Most Recent
          </button>
          <button 
            onClick={() => setFilterType('with-images')} 
            style={{...styles.filterBtn, ...(filterType === 'with-images' && styles.activeFilter)}}
          >
            With Images
          </button>
          <button 
            onClick={() => setFilterType('positive')} 
            style={{...styles.filterBtn, ...(filterType === 'positive' && styles.activeFilter)}}
          >
            Positive
          </button>
          <button 
            onClick={() => setFilterType('negative')} 
            style={{...styles.filterBtn, ...(filterType === 'negative' && styles.activeFilter)}}
          >
            Negative
          </button>
        </div>
      </div>

      {/* VERIFIED BUYER REVIEW ACTION ALERT */}
      {eligibilityChecked && (
        <div style={styles.writeReviewBanner}>
          {isEligible ? (
            <div style={styles.eligibleRow}>
              <CheckCircle size={18} color="var(--emerald)" />
              <span>You purchased this crop! Share your rating, packaging quality, and freshness details with other buyers.</span>
              <button 
                onClick={() => setShowReviewForm(prev => !prev)} 
                className="btn btn-primary"
                style={{ padding: '6px 16px', fontSize: '12px' }}
              >
                {showReviewForm ? 'Cancel Form' : 'Write Review'}
              </button>
            </div>
          ) : (
            <div style={styles.ineligibleRow}>
              <AlertCircle size={18} color="var(--text-secondary)" />
              <span>Only verified buyers of this product can submit ratings and image reviews.</span>
            </div>
          )}
        </div>
      )}

      {/* WRITE REVIEW FORM */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
          {reviewError && <div style={styles.errAlert}>{reviewError}</div>}
          
          <div style={styles.formRowGrid}>
            <div className="form-group">
              <label>Overall Star Rating</label>
              <select className="form-input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value={5}>5 Stars - Outstanding</option>
                <option value={4}>4 Stars - Good</option>
                <option value={3}>3 Stars - Average</option>
                <option value={2}>2 Stars - Substandard</option>
                <option value={1}>1 Star - Bad</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sentiment Grade</label>
              <select className="form-input" value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
                <option value="Good">Good Quality & Freshness</option>
                <option value="Average">Average / Acceptable</option>
                <option value="Bad">Bad / Substandard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Would you recommend this crop to others?</label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" checked={recommend} onChange={() => setRecommend(true)} /> Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" checked={!recommend} onChange={() => setRecommend(false)} /> No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Comments (freshness, packaging, delivery details)</label>
            <textarea
              className="form-input"
              style={{ height: '70px', resize: 'none' }}
              placeholder="How was the delivery condition? Is the packaging moisture-sealed? Is the crop fresh?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {/* Photo uploads mapping */}
          <div className="form-group">
            <label>Attach Reviews Photo Gallery (optional)</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input 
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Paste review image URL"
                value={reviewImageUrl}
                onChange={(e) => setReviewImageUrl(e.target.value)}
              />
              <button 
                type="button" 
                onClick={handleAddReviewImage}
                className="btn btn-outline"
                style={{ padding: '8px 16px' }}
              >
                Add Link
              </button>
            </div>

            {/* Quick attach preset buttons for testing */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button type="button" onClick={() => handleAttachSamplePhoto('product')} style={styles.attachPresetBtn}>
                <Image size={12} /> Crop Sample Photo
              </button>
              <button type="button" onClick={() => handleAttachSamplePhoto('packaging')} style={styles.attachPresetBtn}>
                <Image size={12} /> Packaging Photo
              </button>
              <button type="button" onClick={() => handleAttachSamplePhoto('delivery')} style={styles.attachPresetBtn}>
                <Image size={12} /> Delivery Photo
              </button>
            </div>

            {reviewImagesList.length > 0 && (
              <div style={styles.formReviewGallery}>
                {reviewImagesList.map((img, i) => (
                  <img key={i} src={img} alt="review upload" style={styles.thumbnailImg} />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Submit Review & Rating
          </button>
        </form>
      )}

      {/* COMMENTS LIST */}
      <div style={styles.reviewsListContainer}>
        {reviewsLoading ? (
          <div>Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div style={styles.emptyText}>No matching customer reviews found for this crop.</div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev._id} style={styles.reviewCard}>
              <div style={styles.reviewHeaderRow}>
                <div style={styles.buyerMeta}>
                  <strong style={{ fontSize: '13px' }}>{rev.buyerName}</strong>
                  <span style={styles.verifiedBadge}>
                    <CheckCircle size={10} fill="var(--emerald)" color="white" />
                    Verified Buyer
                  </span>
                </div>
                <div style={styles.reviewDate}>
                  Purchased on: {new Date(rev.purchaseDate).toLocaleDateString()}
                </div>
              </div>

              {/* Stars & sentiment tag */}
              <div style={styles.starsSentimentLine}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={12} 
                      fill={s <= rev.rating ? "var(--amber-gold)" : "none"} 
                      color="var(--amber-gold)" 
                    />
                  ))}
                </div>
                <span className={`badge ${rev.sentiment === 'Good' ? 'badge-verified' : rev.sentiment === 'Average' ? 'badge-pending' : 'badge-auction'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                  {rev.sentiment} Quality
                </span>
                {rev.recommend && (
                  <span style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: '600' }}>✔ Recommends this product</span>
                )}
              </div>

              {/* Comment text */}
              <p style={styles.reviewText}>{rev.comment}</p>

              {/* Uploaded images gallery */}
              {rev.images && rev.images.length > 0 && (
                <div style={styles.galleryWrapper}>
                  {rev.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt="buyer upload" style={styles.galleryImg} />
                    </a>
                  ))}
                </div>
              )}

              {/* Helpful Like action button */}
              <div style={styles.actionLine}>
                <button 
                  onClick={() => handleToggleLike(rev._id)} 
                  style={{
                    ...styles.helpfulBtn,
                    borderColor: rev.likes && rev.likes.includes(user?._id) ? 'var(--forest-green)' : 'var(--border-color)',
                    color: rev.likes && rev.likes.includes(user?._id) ? 'var(--forest-green)' : 'var(--text-secondary)'
                  }}
                >
                  <ThumbsUp size={12} />
                  <span>Helpful ({rev.likes ? rev.likes.length : 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <hr style={styles.hr} />

      {/* COMMUNITY Q&A SECTION */}
      <h3 style={styles.sectionHeader}>
        <HelpCircle size={18} color="var(--forest-green)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
        Ask Previous Buyers
      </h3>

      <form onSubmit={handleAskQuestion} style={styles.qnaForm}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            placeholder="Have a question about this crop? Ask previous verified buyers..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            required
            disabled={!user}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!user || !newQuestionText.trim()}
          >
            Ask Question
          </button>
        </div>
        {!user && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Log in to ask questions.</span>}
      </form>

      {/* Q&A LIST */}
      <div style={styles.qnaListContainer}>
        {qnaLoading ? (
          <div>Loading Q&A...</div>
        ) : questions.length === 0 ? (
          <div style={styles.emptyText}>No questions have been asked yet. Be the first to ask!</div>
        ) : (
          questions.map((q) => (
            <div key={q._id} style={styles.qnaCard}>
              <div style={styles.questionTextLine}>
                <strong>Q: {q.questionText}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Asked by {q.askerName}</span>
              </div>

              {/* Answers block */}
              <div style={styles.answersContainer}>
                {q.answers && q.answers.length > 0 ? (
                  q.answers.map((ans, aIdx) => (
                    <div key={aIdx} style={styles.answerCard}>
                      <div style={styles.answerHeader}>
                        <MessageCircle size={12} color="var(--text-secondary)" />
                        <span style={{ fontWeight: '600' }}>{ans.responderName}</span>
                        {ans.isVerifiedBuyer && (
                          <span style={styles.miniVerifiedBadge}>Verified Buyer</span>
                        )}
                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                          answered on {new Date(ans.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={styles.answerText}>{ans.answerText}</p>
                    </div>
                  ))
                ) : (
                  <div style={styles.noAnswerText}>No answers yet.</div>
                )}
              </div>

              {/* Answer submission form */}
              {user && (
                <div style={styles.submitAnswerBox}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
                    placeholder="Write an answer..."
                    value={answerInputs[q._id] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnswerInputs(prev => ({ ...prev, [q._id]: val }));
                    }}
                  />
                  <button 
                    onClick={() => handleAnswerQuestion(q._id)}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '11px' }}
                    disabled={!(answerInputs[q._id] || '').trim()}
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '25px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '25px',
    textAlign: 'left'
  },
  sectionHeader: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '5px'
  },
  ratingSummaryRow: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'var(--bg-secondary)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  },
  avgBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    paddingRight: '30px',
    borderRight: '1px solid var(--border-color)'
  },
  bigRating: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  starsRow: {
    display: 'flex',
    gap: '2px'
  },
  totalReviewsText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  },
  filtersGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    flex: 1
  },
  filterBtn: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeFilter: {
    backgroundColor: 'var(--forest-green)',
    color: 'white',
    borderColor: 'var(--forest-green)'
  },
  writeReviewBanner: {
    padding: '12px 16px',
    backgroundColor: 'var(--green-glow)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px'
  },
  eligibleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: '500'
  },
  ineligibleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  reviewForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '20px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    animation: 'fadeIn 0.2s'
  },
  formRowGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  errAlert: {
    padding: '10px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '6px'
  },
  attachPresetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  formReviewGallery: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  thumbnailImg: {
    width: '60px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  reviewsListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '10px'
  },
  emptyText: {
    padding: '25px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    fontSize: '13px'
  },
  reviewCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  reviewHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  buyerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  verifiedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--emerald)',
    backgroundColor: 'var(--green-glow)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  reviewDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  starsSentimentLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  reviewText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    margin: 0
  },
  galleryWrapper: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '5px'
  },
  galleryImg: {
    width: '90px',
    height: '75px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    cursor: 'zoom-in',
    transition: 'transform 0.2s'
  },
  actionLine: {
    display: 'flex',
    marginTop: '5px'
  },
  helpfulBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    padding: '5px 12px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  hr: {
    border: 'none',
    borderTop: '1px solid var(--border-color)',
    margin: '15px 0'
  },
  qnaForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  qnaListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '10px'
  },
  qnaCard: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  questionTextLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text-primary)',
    flexWrap: 'wrap',
    gap: '8px'
  },
  answersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '15px',
    borderLeft: '2px solid var(--border-color)'
  },
  answerCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  answerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-primary)',
    flexWrap: 'wrap'
  },
  miniVerifiedBadge: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'var(--forest-green)',
    padding: '1px 5px',
    borderRadius: '3px'
  },
  answerText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: 0
  },
  noAnswerText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic'
  },
  submitAnswerBox: {
    display: 'flex',
    gap: '10px',
    marginTop: '5px'
  }
};
