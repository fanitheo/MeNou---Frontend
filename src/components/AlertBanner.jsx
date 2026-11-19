import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AlertBanner({
  type = 'info',
  message,
  actionLabel,
  actionTo
}) {
  if (!message) return null;

  const palette = {
    error: {
      bg: 'var(--danger-bg)',
      color: 'var(--danger-red)',
      border: '#f5c2bd',
      Icon: AlertCircle
    },
    success: {
      bg: 'var(--success-bg)',
      color: 'var(--success-green)',
      border: '#b7dfb9',
      Icon: CheckCircle2
    },
    warning: {
      bg: 'var(--warning-bg)',
      color: 'var(--warning-amber)',
      border: '#ffe082',
      Icon: AlertTriangle
    }
  }[type] || {
    bg: 'var(--bg-cream)',
    color: 'var(--text-dark)',
    border: 'var(--border-soft)',
    Icon: AlertCircle
  };

  const { Icon } = palette;

  return (
    <div
      role="alert"
      style={{
        backgroundColor: palette.bg,
        color: palette.color,
        border: `1.5px solid ${palette.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: '0.92rem',
        fontWeight: 600
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={20} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          style={{
            alignSelf: 'flex-start',
            backgroundColor: 'var(--primary-forest)',
            color: '#fff',
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.84rem',
            fontWeight: 700
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}