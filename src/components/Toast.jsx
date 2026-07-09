// components/Toast.jsx — CampusConnect
import { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';

const ICONS = {
  success: <FiCheckCircle />,
  error:   <FiAlertCircle />,
  info:    <FiInfo />,
  warning: <FiAlertTriangle />,
};

function ToastItem({ id, message, type = 'info' }) {
  const { removeToast } = useToast();

  return (
    <div className={`toast toast-${type} animate-slideRight`}>
      <span className="toast-icon">{ICONS[type]}</span>
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={() => removeToast(id)}>
        <FiX />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
}
