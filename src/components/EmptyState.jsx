// components/EmptyState.jsx — CampusConnect
export default function EmptyState({ icon = '📭', title = 'Nothing here', message = '', action }) {
  return (
    <div className="empty-state animate-fadeInUp">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
