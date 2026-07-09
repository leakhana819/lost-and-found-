// pages/MyPosts.jsx — CampusConnect
import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import ItemCard from '../components/ItemCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Link } from 'react-router-dom';

export default function MyPosts() {
  const { currentUser } = useAuth();
  const { items } = useItems();
  const [activeTab, setActiveTab] = useState('all'); // all | active | resolved

  const myItems = useMemo(() => {
    return items.filter(i => i.reportedBy === currentUser?.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, currentUser]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'active') return myItems.filter(i => !i.resolved);
    if (activeTab === 'resolved') return myItems.filter(i => i.resolved);
    return myItems;
  }, [myItems, activeTab]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="section-header animate-fadeInDown" style={{ textAlign: 'left', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>My Posts</h1>
          <p>Manage all your reported lost and found items.</p>
        </div>

        {myItems.length > 0 && (
          <div className="tabs animate-fadeInDown" style={{ marginBottom: 'var(--space-6)', display: 'inline-flex' }}>
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({myItems.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({myItems.filter(i => !i.resolved).length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({myItems.filter(i => i.resolved).length})
            </button>
          </div>
        )}

        <div className="items-grid" style={{ paddingBottom: 'var(--space-10)' }}>
          {filteredItems.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <EmptyState
                icon="📝"
                title={myItems.length === 0 ? "You haven't posted anything" : "No items found in this tab"}
                message={myItems.length === 0 ? "Items you report as lost or found will appear here." : ""}
                action={myItems.length === 0 ? { label: "Report an Item", onClick: () => window.location.href = '/report' } : null}
              />
            </div>
          ) : (
            filteredItems.map((item, i) => (
              <div
                key={item.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <ItemCard item={item} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
