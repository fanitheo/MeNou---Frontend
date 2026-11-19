import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Home, Upload } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { to: '/my-kitchen', label: 'My Kitchen', icon: BookOpen },
    { to: '/home', label: 'Home', icon: Home },
    { to: '/post', label: 'Post', icon: Upload }
  ];

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '680px',
        backgroundColor: 'var(--bg-cream)',
        borderTop: '1px solid var(--border-soft)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        padding: '8px 12px 10px',
        zIndex: 50
      }}
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'var(--primary-forest)' : 'var(--text-muted)',
            fontWeight: isActive ? 700 : 500,
            fontSize: '0.78rem'
          })}
        >
          {({ isActive }) => (
            <>
              <span
                style={{
                  backgroundColor: isActive ? 'var(--primary-forest)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--primary-forest)',
                  padding: '5px 20px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}