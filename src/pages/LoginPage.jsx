import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/AlertBanner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, updateSession } = useApp();

  const [username, setUsername] = useState(session.username || '');
  const [userID, setUserID] = useState(String(session.userID || 1));
  const [kitchenID, setKitchenID] = useState(String(session.kitchenID || 1));
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const parsedUser = Number(userID);
    const parsedKitchen = Number(kitchenID);

    if (
      !username.trim() ||
      !parsedUser ||
      parsedUser < 1 ||
      !parsedKitchen ||
      parsedKitchen < 1
    ) {
      setError('Please enter a valid username, userID, and kitchenID.');
      return;
    }

    updateSession({
      isAuthenticated: true,
      username: username.trim(),
      userID: parsedUser,
      kitchenID: parsedKitchen
    });
    navigate('/home');
  };

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          background: 'var(--bg-cream)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 22px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <h1
          className="brand-heading"
          style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '6px' }}
        >
          MeNou
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '18px'
          }}
        >
          Smart Kitchen &amp; Personalized Meal Assistant
        </p>

        <AlertBanner type="error" message={error} />

        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Ismini"
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '11px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-soft)',
                background: '#fff'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.88rem' }}>User ID</label>
              <input
                type="number"
                min="1"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-soft)',
                  background: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Kitchen ID</label>
              <input
                type="number"
                min="1"
                value={kitchenID}
                onChange={(e) => setKitchenID(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-soft)',
                  background: '#fff'
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn-forest" style={{ marginTop: '8px' }}>
            Enter Kitchen
          </button>
        </form>
      </div>
    </main>
  );
}