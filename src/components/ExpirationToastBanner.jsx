import React, { useState, useEffect } from 'react';
import { X, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ExpirationToastBanner({ onOpenAll }) {
  const { notifications } = useApp();
  const [dismissedId, setDismissedId] = useState(null);

  const latestAlert = notifications.length > 0 ? notifications[0] : null;

  useEffect(() => {
    setDismissedId(null);
  }, [latestAlert?.notificationID]);

  if (!latestAlert || dismissedId === latestAlert.notificationID) {
    return null;
  }

  return (
    <div
      onClick={onOpenAll}
      role="status"
      style={{
        background: 'rgba(247, 244, 239, 0.96)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid var(--primary-forest)',
        borderRadius: '18px',
        padding: '10px 14px',
        marginBottom: '12px',
        boxShadow: '0 6px 18px rgba(34, 63, 28, 0.16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#e5f0d8',
            border: '1px solid var(--primary-forest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-forest)',
            flexShrink: 0
          }}
        >
          <Utensils size={18} />
        </div>
        <div>
          <div
            className="brand-heading"
            style={{ fontSize: '0.88rem', color: 'var(--primary-forest)' }}
          >
            MeNou
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-dark)' }}>
            {latestAlert.message}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Dismiss alert"
        onClick={(e) => {
          e.stopPropagation();
          setDismissedId(latestAlert.notificationID);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}