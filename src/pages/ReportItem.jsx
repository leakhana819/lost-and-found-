// pages/ReportItem.jsx — CampusConnect
import { useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiX, FiMapPin, FiCalendar, FiPhone } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CATEGORIES, LOCATIONS } from '../utils/helpers.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import './ReportItem.css';

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 2;

export default function ReportItem() {
  const { currentUser } = useAuth();
  const { addItem } = useItems();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultType = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [type, setType] = useState(defaultType);
  const [images, setImages] = useState([]);       // base64 strings
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactInfo: currentUser?.phone || '',
  });

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  // ─── IMAGE HANDLING ──────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > MAX_IMAGES) {
      toast.warning(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    files.forEach(file => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds ${MAX_SIZE_MB}MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target.result]);
        setImagePreviews(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });

    // reset input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ─── VALIDATION ──────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.description.trim() || form.description.length < 20)
      e.description = 'Add at least 20 characters of description';
    if (!form.location) e.location = 'Please select a location';
    if (!form.date) e.date = 'Date is required';
    if (!form.contactInfo.trim()) {
      e.contactInfo = 'Contact number is required';
    } else if (!/^\d{10}$/.test(form.contactInfo.trim())) {
      e.contactInfo = 'Please enter a valid 10-digit phone number';
    }
    return e;
  };

  // ─── SUBMIT ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const item = await addItem({
      ...form,
      type,
      images,
      reportedBy: currentUser.id,
      reportedByName: currentUser.name,
    });

    setLoading(false);
    toast.success(`${type === 'lost' ? 'Lost' : 'Found'} item reported successfully! ✅`);
    navigate(`/item/${item.id}`);
  };

  return (
    <div className="page-wrapper report-page">
      <div className="container-sm">
        {/* Back */}
        <Link to="/dashboard" className="back-link">
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="report-header animate-fadeInDown">
          <h1>Report an Item</h1>
          <p>Fill in the details below to help others find or return your item.</p>
        </div>

        {/* Type Toggle */}
        <div className="type-toggle-wrap animate-fadeInUp">
          <button
            className={`type-btn ${type === 'lost' ? 'type-lost-active' : ''}`}
            onClick={() => setType('lost')}
            type="button"
          >
            🔍 I Lost Something
          </button>
          <button
            className={`type-btn ${type === 'found' ? 'type-found-active' : ''}`}
            onClick={() => setType('found')}
            type="button"
          >
            ✅ I Found Something
          </button>
        </div>

        {/* Form */}
        <form className="report-form card animate-fadeInUp" onSubmit={handleSubmit} noValidate>
          {/* Item Title */}
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder={type === 'lost' ? 'e.g. Apple AirPods Pro' : 'e.g. Blue Wallet Found Near Library'}
              value={form.title}
              onChange={set('title')}
              maxLength={100}
            />
            {errors.title && <span className="form-error">⚠ {errors.title}</span>}
          </div>

          {/* Category & Location */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className={`form-input form-select ${errors.category ? 'error' : ''}`}
                value={form.category}
                onChange={set('category')}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
              {errors.category && <span className="form-error">⚠ {errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label"><FiMapPin size={13} /> Location *</label>
              <select
                className={`form-input form-select ${errors.location ? 'error' : ''}`}
                value={form.location}
                onChange={set('location')}
              >
                <option value="">Where was it {type === 'lost' ? 'lost' : 'found'}?</option>
                {LOCATIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.location && <span className="form-error">⚠ {errors.location}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
              placeholder={`Describe the item in detail — color, brand, distinguishing features, where exactly you ${type === 'lost' ? 'lost' : 'found'} it…`}
              value={form.description}
              onChange={set('description')}
              rows={4}
              maxLength={500}
            />
            <div className="char-count">{form.description.length}/500</div>
            {errors.description && <span className="form-error">⚠ {errors.description}</span>}
          </div>

          {/* Date & Contact */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label"><FiCalendar size={13} /> Date *</label>
              <input
                type="date"
                className={`form-input ${errors.date ? 'error' : ''}`}
                value={form.date}
                onChange={set('date')}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <span className="form-error">⚠ {errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label"><FiPhone size={13} /> Contact Number *</label>
              <input
                type="tel"
                className={`form-input ${errors.contactInfo ? 'error' : ''}`}
                placeholder="10-digit mobile number"
                value={form.contactInfo}
                onChange={set('contactInfo')}
              />
              {errors.contactInfo && <span className="form-error">⚠ {errors.contactInfo}</span>}
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Photos (Optional, up to {MAX_IMAGES})</label>
            <div
              className="image-upload-area"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const dt = e.dataTransfer;
                handleImageChange({ target: { files: dt.files }, preventDefault: () => {} });
              }}
            >
              <FiUpload size={28} className="upload-icon" />
              <p className="upload-text">Click or drag & drop images here</p>
              <p className="upload-sub">PNG, JPG up to {MAX_SIZE_MB}MB each</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="upload-input"
                onChange={handleImageChange}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="image-preview-item">
                    <img src={src} alt={`Preview ${i + 1}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeImage(i)}
                      aria-label="Remove image"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="report-actions">
            <Link to="/dashboard" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading
                ? <><LoadingSpinner size="sm" /> Posting…</>
                : `🚀 Post ${type === 'lost' ? 'Lost' : 'Found'} Item`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
