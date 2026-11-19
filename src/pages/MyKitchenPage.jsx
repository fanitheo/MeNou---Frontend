import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AlertBanner from '../components/AlertBanner';
import ExpirationToastBanner from '../components/ExpirationToastBanner';
import CategoryIngredientsView from '../components/CategoryIngredientsView';
import ManualIngredientView from '../components/ManualIngredientView';
import TotalIngredientsModal from '../components/TotalIngredientsModal';
import NotificationsModal from '../components/NotificationsModal';
import { KITCHEN_CATEGORIES } from '../utils/constants';
import { searchIngredients } from '../api/kitchenApi';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';

export default function MyKitchenPage() {
  const navigate = useNavigate();
  const { session, kitchenIngredients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // 'GRID' (M-2) | 'CATEGORY' (M-4/M-5) | 'MANUAL' (M-3)
  const [viewMode, setViewMode] = useState('GRID');
  const [activeCategory, setActiveCategory] = useState(null);
  const [editingItemM5, setEditingItemM5] = useState(null);

  const [isTotalOpen, setIsTotalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function runSearch() {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const list = await searchIngredients(
          session.userID,
          session.kitchenID,
          debouncedSearch.trim()
        );
        if (active) setSearchResults(list);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }
    runSearch();
    return () => {
      active = false;
    };
  }, [debouncedSearch, session.userID, session.kitchenID]);

  const handleHeaderBack = () => {
    if (editingItemM5) {
      setEditingItemM5(null);
      return;
    }
    if (viewMode === 'CATEGORY' || viewMode === 'MANUAL') {
      setViewMode('GRID');
      setActiveCategory(null);
      return;
    }
    navigate('/home');
  };

  return (
    <>
      <Header
        title="My Kitchen"
        showBack
        onBackClick={handleHeaderBack}
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      <main className="page-content">
        <ExpirationToastBanner onOpenAll={() => setIsNotifOpen(true)} />
        <AlertBanner type="success" message={successMessage} />

        {viewMode === 'CATEGORY' && activeCategory && (
          <CategoryIngredientsView
            category={activeCategory}
            editingItem={editingItemM5}
            setEditingItem={setEditingItemM5}
            onAddedSuccess={(msg) => {
              setSuccessMessage(msg);
              setViewMode('GRID');
              setActiveCategory(null);
            }}
          />
        )}

        {viewMode === 'MANUAL' && (
          <ManualIngredientView
            onSuccess={(msg) => {
              setSuccessMessage(msg);
              setViewMode('GRID');
            }}
          />
        )}

        {viewMode === 'GRID' && (
          <>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="input-cream"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  padding: '12px 44px 12px 18px',
                  boxShadow: 'var(--shadow-card)'
                }}
              />
              <Search
                size={20}
                color="var(--text-dark)"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>

            {searchTerm.trim() !== '' && (
              <div
                style={{
                  background: 'var(--bg-cream)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginBottom: '14px',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  {searching
                    ? 'Searching ingredients...'
                    : `Search Results (${searchResults.length})`}
                </div>
                {!searching && searchResults.length === 0 ? (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    No matching ingredients found. Press + below to add it manually.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {searchResults.map((ing) => (
                      <div
                        key={ing.ingredientID || ing.ingredientName}
                        style={{
                          background: '#fff',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {ing.ingredientName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {ing.ingredientCategory}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <section
              style={{
                backgroundColor: 'var(--bg-cream)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px',
                boxShadow: 'var(--shadow-card)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}
            >
              {KITCHEN_CATEGORIES.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => {
                    setSuccessMessage('');
                    setActiveCategory(category);
                    setViewMode('CATEGORY');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    style={{
                      width: '100%',
                      height: '92px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      display: 'block'
                    }}
                  />
                  <span
                    className="brand-heading"
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      fontSize: '0.96rem',
                      color: 'var(--text-dark)'
                    }}
                  >
                    {category.name}
                  </span>
                </button>
              ))}
            </section>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginTop: '14px'
              }}
            >
              <button
                type="button"
                className="btn-forest"
                onClick={() => setIsTotalOpen(true)}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  fontSize: '1.08rem',
                  fontWeight: 500,
                  border: '1.5px solid #dce8cf'
                }}
              >
                Total Ingredients: &nbsp;
                <strong>{kitchenIngredients.length}</strong>
              </button>

              <button
                type="button"
                aria-label="Add ingredient manually"
                onClick={() => {
                  setSuccessMessage('');
                  setViewMode('MANUAL');
                }}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-forest)',
                  color: '#fff',
                  border: '2px solid #dce8cf',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <Plus size={28} strokeWidth={2.4} />
              </button>
            </div>
          </>
        )}
      </main>

      <TotalIngredientsModal
        isOpen={isTotalOpen}
        onClose={() => setIsTotalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <BottomNav />
    </>
  );
}