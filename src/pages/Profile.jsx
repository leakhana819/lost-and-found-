// pages/Profile.jsx — CampusConnect
import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiBook, FiAward, FiEdit3, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { updateUserById } from '../utils/localStorage.js';
import { getInitials, DEPARTMENTS } from '../utils/helpers.js';
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
  });

  const myItems = items.filter(i => i.reportedBy === currentUser?.id);
  const resolvedCount = myItems.filter(i => i.resolved).length;

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty.'); return; }
    
    updateUserById(currentUser.id, {
      name: form.name,
      phone: form.phone,
      department: form.department,
      year: form.year,
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
            <div className="avatar avatar-xl animate-fadeInDown">
              {getInitials(currentUser?.name)}
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

        </div>
      </div>
    </div>
  );
}
