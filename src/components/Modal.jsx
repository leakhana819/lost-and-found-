// components/Modal.jsx — CampusConnect
import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const sizeMap = { sm: '420px', md: '560px', lg: '720px' };

  return (
    <div className="modal-overlay animate-fadeIn" ref={overlayRef} onClick={handleOverlayClick}>
      <div
        className="modal-box animate-scaleIn"
        style={{ maxWidth: sizeMap[size] || sizeMap.md }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <div className="modal-header">
            <h3 id="modal-title" className="modal-title">{title}</h3>
            <button className="modal-close btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
              <FiX size={18} />
            </button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
