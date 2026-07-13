// pages/Profile.jsx — CampusConnect
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiBook, FiAward, FiEdit3, FiSave, FiMapPin, FiCalendar, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { updateUserById } from '../utils/localStorage.js';
import { getInitials, DEPARTMENTS, getCategoryInfo, formatRelativeTime } from '../utils/helpers.js';
import './Profile.css';

export default function Profile() {
  const { currentUser, refreshUser } = useAuth();
  const { items } = useItems();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    year: currentUser?.year || '',
    profilePhoto: currentUser?.profilePhoto || '',
  });

  const myItems = items.filter(i => i.reportedBy === currentUser?.id);
  const resolvedCount = myItems.filter(i => i.resolved).length;
  const [itemTab, setItemTab] = useState('all'); // 'all' | 'lost' | 'found'

  const filteredMyItems = myItems.filter(i => {
    if (itemTab === 'lost') return i.type === 'lost';
    if (itemTab === 'found') return i.type === 'found';
    return true;
  });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty.'); return; }
    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) { 
      toast.error('Phone number must be exactly 10 digits.'); 
      return; 
    }
    
    updateUserById(currentUser.id, {
      name: form.name,
      phone: form.phone,
      department: form.department,
      year: form.year,
      profilePhoto: form.profilePhoto,
    });
    
    refreshUser();
    setIsEditing(false);
    toast.success('Profile updated successfully! 🎉');
  };

  return (
    <div className="page-wrapper profile-page">
      <div className="container-sm">
        <div className="profile-card card">
          {/* Header / Avatar */}
          <div className="profile-header">
            <div className="avatar avatar-xl animate-fadeInDown" style={{ position: 'relative', overflow: 'hidden' }}>
              {form.profilePhoto || currentUser?.profilePhoto ? (
                <img 
                  src={form.profilePhoto || currentUser.profilePhoto} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                getInitials(currentUser?.name)
              )}
              {isEditing && (
                <label className="profile-photo-upload" style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'rgba(0,0,0,0.5)', color: 'white',
                  fontSize: '12px', textAlign: 'center', cursor: 'pointer', padding: '4px 0'
                }}>
                  Change
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setForm(f => ({ ...f, profilePhoto: e.target.result }));
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              )}
            </div>
            <div className="profile-header-info animate-fadeInUp">
              {isEditing ? (
                <input
                  type="text"
                  className="form-input profile-name-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              ) : (
                <h1 className="profile-name">{currentUser?.name}</h1>
              )}
              <p className="profile-email"><FiMail size={14} /> {currentUser?.email}</p>
            </div>
            
            <button 
              className="btn btn-secondary profile-edit-btn animate-fadeInRight"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? <><FiSave /> Save</> : <><FiEdit3 /> Edit Profile</>}
            </button>
          </div>

          <div className="divider" />

          {/* Details */}
          <div className="profile-details animate-fadeInUp">
            <h3 className="section-subtitle">Account Details</h3>
            <div className="details-grid">
              
              <div className="detail-item">
                <span className="detail-label"><FiBook /> Department</span>
                {isEditing ? (
                  <select 
                    className="form-input form-select"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <span className="detail-value">{currentUser?.department || 'Not set'}</span>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label"><FiAward /> Year</span>
                {isEditing ? (
                  <select 
                    className="form-input form-select"
                    value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  >
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                ) : (
                  <span className="detail-value">{currentUser?.year || 'Not set'}</span>
                )}
              </div>

              <div className="detail-item">
                <span className="detail-label"><FiPhone /> Phone</span>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-input"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                ) : (
                  <span className="detail-value">{currentUser?.phone || 'Not set'}</span>
                )}
              </div>

            </div>
          </div>

          <div className="divider" />

          {/* Stats */}
          <div className="profile-stats animate-fadeInUp">
            <h3 className="section-subtitle">Activity Stats</h3>
            <div className="stats-row">
              <div className="p-stat">
                <div className="p-stat-val">{myItems.length}</div>
                <div className="p-stat-lbl">Items Reported</div>
              </div>
              <div className="p-stat">
                <div className="p-stat-val">{resolvedCount}</div>
                <div className="p-stat-lbl">Items Resolved</div>
              </div>
              <div className="p-stat">
                <div className="p-stat-val">{new Date(currentUser?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                <div className="p-stat-lbl">Joined</div>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* My Items */}
          <div className="profile-my-items animate-fadeInUp">
            <div className="profile-my-items-header">
              <h3 className="section-subtitle" style={{ marginBottom: 0 }}>My Reported Items</h3>
              <div className="profile-item-tabs">
                {['all', 'lost', 'found'].map(tab => (
                  <button
                    key={tab}
                    className={`profile-item-tab ${itemTab === tab ? 'active' : ''}`}
                    onClick={() => setItemTab(tab)}
                  >
                    {tab === 'all' ? `All (${myItems.length})` : tab === 'lost' ? `Lost (${myItems.filter(i => i.type === 'lost').length})` : `Found (${myItems.filter(i => i.type === 'found').length})`}
                  </button>
                ))}
              </div>
            </div>

            {filteredMyItems.length === 0 ? (
              <div className="profile-empty-items">
                <FiPackage size={36} className="profile-empty-icon" />
                <p>No {itemTab === 'all' ? '' : itemTab + ' '}items reported yet.</p>
              </div>
            ) : (
              <div className="profile-items-list">
                {filteredMyItems.map(item => {
                  const catInfo = getCategoryInfo(item.category);
                  return (
                    <Link to={`/item/${item.id}`} key={item.id} className="profile-item-card">
                      <div className="profile-item-thumb">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.title} />
                        ) : (
                          <span className="profile-item-thumb-icon">{catInfo.icon}</span>
                        )}
                      </div>
                      <div className="profile-item-info">
                        <div className="profile-item-title-row">
                          <span className="profile-item-title">{item.title}</span>
                          <div className="profile-item-badges">
                            <span className={`badge badge-${item.type}`}>
                              {item.type === 'lost' ? '🔍 Lost' : '✅ Found'}
                            </span>
                            {item.resolved && (
                              <span className="badge badge-resolved">Resolved</span>
                            )}
                          </div>
                        </div>
                        <div className="profile-item-meta">
                          <span><FiMapPin size={12} /> {item.location}</span>
                          <span><FiCalendar size={12} /> {formatRelativeTime(item.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
