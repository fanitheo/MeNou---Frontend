import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RecipeCard from '../components/RecipeCard';
import AlertBanner from '../components/AlertBanner';
import ExpirationToastBanner from '../components/ExpirationToastBanner';
import NotificationsModal from '../components/NotificationsModal';
import {
  getForYouRecipes,
  searchHomeRecipes,
  getDiscoveryRecipes
} from '../api/recipesApi';
import { useApp } from '../context/AppContext';
import { SEARCH_FILTER_TAGS } from '../utils/constants';

export default function HomePage() {
  const location = useLocation();
  const { session, kitchenIngredients, favoriteRecipes } = useApp();

  const [activeTab, setActiveTab] = useState(
    location.state?.restoreTab || 'For you'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [infoAlert, setInfoAlert] = useState({
    type: '',
    message: '',
    actionLabel: '',
    actionTo: ''
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isSearching = searchQuery.trim() !== '' || selectedFilters.length > 0;
  const currentSourceLabel = isSearching ? 'Search Results' : activeTab;

  const loadTabContent = useCallback(async () => {
    setLoading(true);
    setInfoAlert({ type: '', message: '', actionLabel: '', actionTo: '' });

    try {
      if (searchQuery.trim() !== '' || selectedFilters.length > 0) {
        const results = await searchHomeRecipes(
          session.userID,
          searchQuery,
          selectedFilters
        );
        setRecipes(results);
        if (results.length === 0) {
          setInfoAlert({
            type: 'warning',
            message: 'No recipes matching your search criteria were found.'
          });
        }
        return;
      }

      if (activeTab === 'Favourites') {
        setRecipes(favoriteRecipes);
        if (favoriteRecipes.length === 0) {
          setInfoAlert({
            type: 'info',
            message:
              'You have not saved any favourite recipes yet. Tap the heart icon on a recipe!'
          });
        }
        return;
      }

      if (activeTab === 'Discovery') {
        const list = await getDiscoveryRecipes(session.kitchenID);
        setRecipes(list);
        if (list.length === 0) {
          setInfoAlert({
            type: 'info',
            message:
              'No community recipes available yet. Be the first to post one!'
          });
        }
        return;
      }

      // AD-9 & User Story S-5 checks for "For you"
      if (!session.hasProfile) {
        setRecipes([]);
        setInfoAlert({
          type: 'error',
          message:
            'No recipes can be suggested due to missing personal information',
          actionLabel: 'Complete Personal Profile',
          actionTo: '/profile'
        });
        return;
      }

      if (kitchenIngredients.length === 0) {
        setRecipes([]);
        setInfoAlert({
          type: 'error',
          message: 'No recipes can be suggested due to lack of ingredients',
          actionLabel: 'Go to My Kitchen',
          actionTo: '/my-kitchen'
        });
        return;
      }

      const recommended = await getForYouRecipes(
        session.userID,
        session.kitchenID
      );
      setRecipes(recommended);
      if (recommended.length === 0) {
        setInfoAlert({
          type: 'warning',
          message:
            'No recipes matching your current profile and inventory were found'
        });
      }
    } catch (err) {
      setRecipes([]);
      setInfoAlert({
        type: 'error',
        message: err.message || 'Unable to load recipes from server'
      });
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    searchQuery,
    selectedFilters,
    session.userID,
    session.kitchenID,
    session.hasProfile,
    kitchenIngredients.length,
    favoriteRecipes
  ]);

  useEffect(() => {
    loadTabContent();
  }, [loadTabContent]);

  const toggleFilterTag = (tag) => {
    setSelectedFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTabContent();
  };

  return (
    <>
      <Header title="Home" onOpenNotifications={() => setIsNotifOpen(true)} />

      <main className="page-content">
        <ExpirationToastBanner onOpenAll={() => setIsNotifOpen(true)} />

        <form
          onSubmit={handleSearchSubmit}
          style={{ position: 'relative', marginBottom: '12px' }}
        >
          <button
            type="button"
            aria-label="Toggle search filters"
            onClick={() => setShowFilterDrawer((prev) => !prev)}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dark)',
              display: 'flex'
            }}
          >
            <Menu size={20} />
          </button>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="input-cream"
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '12px 44px',
              boxShadow: 'var(--shadow-card)'
            }}
          />

          <button
            type="submit"
            aria-label="Search recipes"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dark)',
              display: 'flex'
            }}
          >
            <Search size={20} />
          </button>
        </form>

        {showFilterDrawer && (
          <div
            style={{
              background: 'var(--bg-cream)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              marginBottom: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            {SEARCH_FILTER_TAGS.map((tag) => {
              const active = selectedFilters.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleFilterTag(tag)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--primary-forest)',
                    background: active ? 'var(--primary-forest)' : '#fff',
                    color: active ? '#fff' : 'var(--primary-forest)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          {['Discovery', 'Favourites', 'For you'].map((tab) => {
            const isActive = activeTab === tab && !isSearching;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilters([]);
                  setActiveTab(tab);
                }}
                style={{
                  padding: '9px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: isActive
                    ? 'var(--primary-forest)'
                    : 'var(--bg-cream)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <AlertBanner
          type={infoAlert.type}
          message={infoAlert.message}
          actionLabel={infoAlert.actionLabel}
          actionTo={infoAlert.actionTo}
        />

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              background: 'var(--bg-cream)',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 600
            }}
          >
            Loading recipes...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.recipeID}
                recipe={recipe}
                sourceLabel={currentSourceLabel}
                sourceTab={activeTab}
                onFavoriteError={(msg) =>
                  setInfoAlert({ type: 'error', message: msg })
                }
              />
            ))}
          </div>
        )}
      </main>

      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <BottomNav />
    </>
  );
}