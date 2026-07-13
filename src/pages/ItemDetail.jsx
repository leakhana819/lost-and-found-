// pages/ItemDetail.jsx — CampusConnect
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiPhone, FiUser,
  FiEdit2, FiTrash2, FiCheckCircle, FiMessageCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getCategoryInfo, formatDate, formatRelativeTime, getInitials } from '../utils/helpers.js';
import './ItemDetail.css';

export default function ItemDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { editItem, removeItem, sendClaimRequest, getItemById } = useItems();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Fetch item from Supabase when page mounts
  useEffect(() => {
    getItemById(id).then(fresh => {
      if (!fresh) navigate('/browse');
      else setItem(fresh);
    });
  }, [id, navigate, getItemById]);

  if (!item) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <EmptyState icon="🔍" title="Item not found" message="This item may have been deleted." />
        </div>
      </div>
    );
  }

  const category = getCategoryInfo(item.category);
  const isOwner = currentUser?.id === item.reportedBy;
  const hasAlreadyClaimed = item.claimRequests?.includes(currentUser?.id);

  // ─── CLAIM ───────────────────────────────
  const handleClaim = async () => {
    if (!claimMsg.trim()) { toast.error('Please add a message describing how you can verify ownership.'); return; }
    await sendClaimRequest(item.id, currentUser.id, currentUser.name, claimMsg, item.reportedBy);
    const updated = await getItemById(id);
    setItem(updated);
    setClaimOpen(false);
    setClaimMsg('');
    toast.success('Claim request sent! The owner will be notified. 📣');
  };

  // ─── DELETE ──────────────────────────────
  const handleDelete = async () => {
    await removeItem(item.id);
    toast.success('Item deleted successfully.');
    navigate('/my-posts');
  };

  // ─── RESOLVE ─────────────────────────────
  const handleResolve = async () => {
    await editItem(item.id, { resolved: true });
    const updated = await getItemById(id);
    setItem(updated);
    toast.success('Item marked as resolved! 🎉');
  };

  // ─── COMMENTS ────────────────────────────
  const handleComment = async () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: crypto.randomUUID(),
      text: commentText.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...(item.comments || []), newComment];
    await editItem(id, { comments: updatedComments });
    setItem(prev => ({ ...prev, comments: updatedComments }));
    setCommentText('');
    toast.success('Comment added!');
  };

  return (
    <div className="page-wrapper item-detail-page">
      <div className="container">
        {/* Back */}
        <Link to="/browse" className="back-link animate-fadeInDown">
          <FiArrowLeft /> Back to Browse
        </Link>

        <div className="item-detail-layout">
          {/* ─── LEFT: Images ─── */}
          <div className="item-detail-media animate-slideLeft">
            {item.images?.length > 0 ? (
              <>
                <div className="main-image-wrap">
                  <img src={item.images[activeImage]} alt={item.title} className="main-image" />
                  <div className={`detail-type-badge type-${item.type}`}>
                    {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
                  </div>
                  {item.resolved && (
                    <div className="detail-resolved-badge">✓ Resolved</div>
                  )}
                </div>
                {item.images.length > 1 && (
                  <div className="thumbnails">
                    {item.images.map((img, i) => (
                      <button
                        key={i}
                        className={`thumb-btn ${activeImage === i ? 'active' : ''}`}
                        onClick={() => setActiveImage(i)}
                      >
                        <img src={img} alt={`Thumb ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="detail-placeholder"
                style={{ background: `linear-gradient(135deg, ${category.color}33, ${category.color}11)` }}
              >
                <span className="detail-placeholder-icon animate-float">{category.icon}</span>
                <div className={`detail-type-badge type-${item.type}`}>
                  {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
                </div>
                {item.resolved && (
                  <div className="detail-resolved-badge">✓ Resolved</div>
                )}
              </div>
            )}
          </div>

          {/* ─── RIGHT: Info ─── */}
          <div className="item-detail-info animate-slideRight">
            {/* Category */}
            <div className="detail-category" style={{ color: category.color }}>
              {category.icon} {category.label}
            </div>

            {/* Title */}
            <h1 className="detail-title">{item.title}</h1>

            {/* Meta chips */}
            <div className="detail-meta">
              <span className="detail-chip">
                <FiMapPin size={13} /> {item.location}
              </span>
              <span className="detail-chip">
                <FiCalendar size={13} /> {formatDate(item.date)}
              </span>
              <span className="detail-chip">
                <FiCalendar size={13} /> Posted {formatRelativeTime(item.createdAt)}
              </span>
            </div>

            {/* Description */}
            <div className="detail-section">
              <h3 className="detail-section-title">Description</h3>
              <p className="detail-desc">{item.description}</p>
            </div>

            {/* Reporter */}
            <div className="detail-section reporter-card card-glass card">
              <div className="reporter-info">
                <div className="avatar">{getInitials(item.reportedByName)}</div>
                <div>
                  <p className="reporter-name">{item.reportedByName || 'Anonymous'}</p>
                  <p className="reporter-label">Posted this {item.type} item</p>
                </div>
              </div>
              {item.contactInfo && (
                <div className="reporter-contact">
                  <FiPhone size={14} /> <span>{item.contactInfo}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="detail-actions">
              {isOwner ? (
                <>
                  <Link to={`/edit-item/${item.id}`} className="btn btn-secondary">
                    <FiEdit2 /> Edit Item
                  </Link>
                  {!item.resolved && (
                    <button className="btn btn-success" onClick={handleResolve}>
                      <FiCheckCircle /> Mark Resolved
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
                    <FiTrash2 /> Delete
                  </button>
                </>
              ) : (
                <>
                  {!item.resolved ? (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => setClaimOpen(true)}
                      disabled={hasAlreadyClaimed}
                    >
                      {hasAlreadyClaimed ? '✅ Claim Sent' : '🤝 Send Claim Request'}
                    </button>
                  ) : (
                    <div className="resolved-notice">
                      ✓ This item has been resolved and returned to its owner.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── COMMENTS ─── */}
        <div className="comments-section card animate-fadeInUp">
          <h3 className="comments-title">
            <FiMessageCircle /> Questions & Updates
            {item.comments?.length > 0 && <span className="comment-count">{item.comments.length}</span>}
          </h3>

          <div className="comment-input-row">
            <div className="avatar avatar-sm">{getInitials(currentUser?.name)}</div>
            <input
              type="text"
              className="form-input comment-input"
              placeholder="Ask a question or add an update…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
              maxLength={200}
            />
            <button className="btn btn-primary btn-sm" onClick={handleComment} disabled={!commentText.trim()}>
              Post
            </button>
          </div>

          <div className="comments-list">
            {(!item.comments || item.comments.length === 0) ? (
              <p className="no-comments">No comments yet. Be the first to ask!</p>
            ) : (
              item.comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="avatar avatar-sm">{getInitials(c.authorName)}</div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <strong className="comment-author">{c.authorName}</strong>
                      <span className="comment-time">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── CLAIM MODAL ─── */}
      <Modal isOpen={claimOpen} onClose={() => setClaimOpen(false)} title="🤝 Send Claim Request">
        <div className="claim-modal">
          <p className="claim-desc">
            Describe how you can verify this is your item — include any specific details only the owner would know.
          </p>
          <div className="form-group">
            <label className="form-label">Your Message *</label>
            <textarea
              className="form-input form-textarea"
              placeholder="e.g. The wallet has a photo inside and a scratch on the back…"
              value={claimMsg}
              onChange={e => setClaimMsg(e.target.value)}
              rows={4}
              maxLength={300}
            />
            <div className="char-count" style={{ textAlign: 'right', marginTop: 4 }}>{claimMsg.length}/300</div>
          </div>
          <div className="modal-footer-btns">
            <button className="btn btn-secondary" onClick={() => setClaimOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleClaim}>Send Request 📬</button>
          </div>
        </div>
      </Modal>

      {/* ─── DELETE MODAL ─── */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Item" size="sm">
        <div className="delete-confirm">
          <p>Are you sure you want to delete <strong>"{item.title}"</strong>? This action cannot be undone.</p>
          <div className="modal-footer-btns" style={{ marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={() => setDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete Item</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
