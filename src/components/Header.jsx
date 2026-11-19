import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header({
  title,
  showBack = false,
  backTo = -1,
  onBackClick,
  onOpenNotifications
}) {
  const navigate = useNavigate();
  const { notifications } = useApp();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px 8px',
        background: 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showBack && (
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-forest)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <ArrowLeft size={24} strokeWidth={2.4} />
          </button>
        )}
        {title && (
          <h1 className="brand-heading" style={{ fontSize: '1.65rem' }}>
            {title}
          </h1>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onOpenNotifications && (
          <button
            type="button"
            aria-label="Expiration notifications"
            onClick={onOpenNotifications}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--bg-cream)',
              border: '1.5px solid var(--primary-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-forest)',
              cursor: 'pointer'
            }}
          >
            <Bell size={19} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--danger-red)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '999px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px'
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          aria-label="User profile"
          onClick={() => navigate('/profile')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-cream)',
            border: '1.5px solid var(--primary-forest)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dark)',
            cursor: 'pointer'
          }}
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}