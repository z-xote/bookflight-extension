'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function Modal({ isOpen, onClose, onConfirm }: ModalProps) {
  return (
    <div 
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </div>
        <h3 className="modal-title">Start New Booking?</h3>
        <p className="modal-message">
          This will clear the current session and all conversation history. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            Reset Session
          </button>
        </div>
      </div>
    </div>
  );
}
