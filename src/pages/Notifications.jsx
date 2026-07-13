// pages/Notifications.jsx — CampusConnect
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiTrash2, FiCheck, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useItems } from '../context/ItemContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

import { formatRelativeTime } from '../utils/helpers.js';
import EmptyState from '../components/EmptyState.jsx';
import './Notifications.css';

export default function Notifications() {
  const { currentUser } = useAuth();
  const { notifications, refreshNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useItems();
  const { toast } = useToast();

  const myNotifs = notifications.filter(n => n.toUser === currentUser?.id);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  useEffect(() => {
    // We already fetch in ItemContext but good to refresh on mount
    refreshNotifications();
  }, [refreshNotifications]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(currentUser.id);
    toast.success('All notifications marked as read.');
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
  };

  return (
    <div className="page-wrapper notifications-page">
      <div className="container-sm">
        <div className="notif-header animate-fadeInDown">
          <div>
            <h1>Notifications</h1>
            <p>You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              <FiCheck /> Mark all as read
            </button>
          )}
        </div>

        <div className="notif-list">
          {myNotifs.length === 0 ? (
            <EmptyState
              icon="📭"
              title="All caught up!"
              message="You don't have any notifications right now."
            />
          ) : (
            myNotifs.map((n, i) => (
              <div
                key={n.id}
                className={`notif-card ${!n.read ? 'unread' : ''} animate-fadeInUp`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="notif-icon">
                  {n.type === 'claim' ? '🤝' : n.type === 'match' ? '💡' : '🔔'}
                </div>
                <div className="notif-content">
                  <p className="notif-msg">{n.message}</p>
                  <div className="notif-meta">
                    {formatRelativeTime(n.createdAt)}
                    {n.itemId && (
                      <>
                        <span className="notif-dot">•</span>
                        <Link to={`/item/${n.itemId}`} className="notif-link" onClick={() => handleMarkRead(n.id)}>
                          View Item
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                <div className="notif-actions">
                  {!n.read && (
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleMarkRead(n.id)}
                      title="Mark as read"
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-icon notif-del"
                    onClick={() => handleDelete(n.id)}
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
