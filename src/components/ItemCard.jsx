// components/ItemCard.jsx — CampusConnect
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiTag } from 'react-icons/fi';
import { formatRelativeTime, getCategoryInfo, truncate } from '../utils/helpers.js';

// Placeholder gradient thumbnails when no image uploaded
const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#6366f1)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#14b8a6,#6366f1)',
];

const getGradient = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

export default function ItemCard({ item }) {
  const category = getCategoryInfo(item.category);
  const gradient = getGradient(item.id);

  return (
    <Link to={`/item/${item.id}`} className="item-card animate-fadeInUp">
      {/* Image / Thumbnail */}
      <div className="item-card-thumb">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="item-card-img" />
        ) : (
          <div className="item-card-placeholder" style={{ background: gradient }}>
            <span className="item-card-placeholder-icon">{category.icon}</span>
          </div>
        )}

        {/* Status badge overlay */}
        <div className={`item-type-badge item-type-${item.type}`}>
          {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
        </div>

        {/* Resolved ribbon */}
        {item.resolved && (
          <div className="item-resolved-badge">Resolved</div>
        )}
      </div>

      {/* Content */}
      <div className="item-card-body">
        <div className="item-card-category">
          <span style={{ marginRight: 4 }}>{category.icon}</span>
          {category.label}
        </div>

        <h3 className="item-card-title">{truncate(item.title, 50)}</h3>

        <p className="item-card-desc">{truncate(item.description, 90)}</p>

        <div className="item-card-meta">
          <span className="item-meta-chip">
            <FiMapPin size={12} />
            {item.location}
          </span>
          <span className="item-meta-chip">
            <FiClock size={12} />
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        <div className="item-card-footer">
          <span className="item-reporter">
            Posted by <strong>{item.reportedByName || 'Anonymous'}</strong>
          </span>
          <span className="item-card-cta">View →</span>
        </div>
      </div>
    </Link>
  );
}
