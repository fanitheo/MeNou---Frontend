import React from 'react';
import { X, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotificationsModal({ isOpen, onClose }) {
  const { notifications } = useApp();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <h2 className="brand-heading" style={{ fontSize: '1.35rem' }}>
            Expiration Alerts
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {notifications.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '10px 0' }}>
            No expiring ingredients right now. Your kitchen is fresh!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div
                key={n.notificationID}
                style={{
                  background: 'var(--warning-bg)',
                  border: '1px solid #ffe082',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                <Bell
                  size={18}
                  color="var(--warning-amber)"
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                    {n.message}
                  </div>
                  {n.timeSent && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {new Date(n.timeSent).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}