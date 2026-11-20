import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AlertBanner from '../components/AlertBanner';
import RecipeCard from '../components/RecipeCard';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import {
  getDiscoveryRecipes,
  getForYouRecipes,
  getRecipePreview,
  searchHomeRecipes
} from '../api/recipesApi';

const FILTER_GROUPS = [
  {
    label: 'Cooking Time',
    options: [
      { label: '≤ 15 min', value: 'maxTime:15' },
      { label: '≤ 20 min', value: 'maxTime:20' },
      { label: '≤ 30 min', value: 'maxTime:30' }
    ]
  },
  {
    label: 'Meal Type',
    options: [
      { label: 'Breakfast', value: 'breakfast' },
      { label: 'Brunch', value: 'brunch' },
      { label: 'Main dish', value: 'main dish' },
      { label: 'Salads', value: 'salads' },
      { label: 'Side dishes', value: 'side dishes' },
      { label: 'Snacks', value: 'snacks' },
      { label: 'Desserts', value: 'desserts' }
    ]
  },
  {
    label: 'Equipment',
    options: [
      { label: 'Frying pan', value: 'frying pan' },
      { label: 'Pot', value: 'pot' },
      { label: 'Oven', value: 'oven' },
      { label: 'Air fryer', value: 'air fryer' },
      { label: 'Wok', value: 'wok' },
      { label: 'Pressure cooker', value: 'pressure cooker' },
      { label: 'No-mixer', value: 'no-mixer' }
    ]
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const {
    userID,
    kitchenID,
    favorites,
    isRecipeFavorite,
    toggleFavoriteRecipe,
    syncFavoritesFromRecipes
  } = useApp();

  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const [activeTab, setActiveTab] = useState('for-you');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 350);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionRedirect, setActionRedirect] = useState('');

  const isSearchingOrFiltering =
    debouncedQuery.trim().length > 0 || selectedFilters.length > 0;

  const toggleFilter = (value) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const enrichRecipesWithPreview = useCallback(
    async (rawList) => {
      if (!Array.isArray(rawList) || rawList.length === 0) return [];

      const enriched = await Promise.all(
        rawList.map(async (item) => {
          const hasCalories = item.calories !== undefined && item.calories !== null;
          const hasTime = item.cookingTime !== undefined && item.cookingTime !== null;

          if (hasCalories && hasTime) {
            return item;
          }

          try {
            const preview = await getRecipePreview(userID, kitchenID, item.recipeID);
            return {
              ...item,
              ...preview,
              calories:
                preview?.calories ??
                item.calories ??
                item.recipeCaloricValue ??
                0,
              cookingTime:
                preview?.cookingTime ??
                item.cookingTime ??
                0
            };
          } catch {
            return {
              ...item,
              calories: item.calories ?? item.recipeCaloricValue ?? 0,
              cookingTime: item.cookingTime ?? 0
            };
          }
        })
      );

      return enriched;
    },
    [userID, kitchenID]
  );

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    setActionRedirect('');

    try {
      let data = [];

      if (isSearchingOrFiltering) {
        data = await searchHomeRecipes(userID, debouncedQuery.trim(), selectedFilters);
      } else if (activeTab === 'for-you') {
        data = await getForYouRecipes(userID, kitchenID);
      } else if (activeTab === 'discovery') {
        const rawDiscovery = await getDiscoveryRecipes(kitchenID);
        data = await enrichRecipesWithPreview(rawDiscovery);
      } else if (activeTab === 'favourites') {
        const [forYouRes, discoveryRes, allRes] = await Promise.allSettled([
          getForYouRecipes(userID, kitchenID),
          getDiscoveryRecipes(kitchenID),
          searchHomeRecipes(userID, '', [])
        ]);

        const mergedMap = new Map();
        if (forYouRes.status === 'fulfilled' && Array.isArray(forYouRes.value)) {
          forYouRes.value.forEach((r) => mergedMap.set(Number(r.recipeID), r));
        }
        if (allRes.status === 'fulfilled' && Array.isArray(allRes.value)) {
          allRes.value.forEach((r) => {
            if (!mergedMap.has(Number(r.recipeID))) {
              mergedMap.set(Number(r.recipeID), r);
            }
          });
        }
        if (discoveryRes.status === 'fulfilled' && Array.isArray(discoveryRes.value)) {
          const enrichedDiscovery = await enrichRecipesWithPreview(discoveryRes.value);
          enrichedDiscovery.forEach((r) => {
            if (!mergedMap.has(Number(r.recipeID))) {
              mergedMap.set(Number(r.recipeID), r);
            }
          });
        }

        const allMerged = Array.from(mergedMap.values());
        syncFavoritesFromRecipes(allMerged);

        const storedFavRaw = localStorage.getItem(`menou_favorites_${userID}`);
        let currentFavs = favoritesRef.current || [];
        if (storedFavRaw) {
          try {
            currentFavs = JSON.parse(storedFavRaw);
          } catch {
            // keep currentFavs
          }
        }

        data = allMerged.filter((r) => currentFavs.includes(Number(r.recipeID)));
      }

      const safeList = Array.isArray(data) ? data : [];
      if (activeTab !== 'favourites') {
        syncFavoritesFromRecipes(safeList);
      }
      setRecipes(safeList);
    } catch (err) {
      setRecipes([]);
      const msg = err?.message || 'Unable to load recipes from server.';
      setErrorMsg(msg);

      if (msg.toLowerCase().includes('personal information') || msg.toLowerCase().includes('profile')) {
        setActionRedirect('/profile');
      } else if (msg.toLowerCase().includes('lack of ingredients') || msg.toLowerCase().includes('kitchen')) {
        setActionRedirect('/my-kitchen');
      }
    } finally {
      setLoading(false);
    }
  }, [
    userID,
    kitchenID,
    activeTab,
    isSearchingOrFiltering,
    debouncedQuery,
    selectedFilters,
    enrichRecipesWithPreview,
    syncFavoritesFromRecipes
  ]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const displayedRecipes =
    !isSearchingOrFiltering && activeTab === 'favourites'
      ? recipes.filter((r) => isRecipeFavorite(r))
      : recipes;

  return (
    <>
      <Header title="Home" showBack={false} />
      <main className="page-content">
        {/* Unified Search Pill matching M-8.png */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: 'var(--bg-cream)',
            borderRadius: 'var(--radius-pill)',
            height: 48,
            padding: '0 18px',
            marginBottom: 14,
            boxShadow: '0 2px 8px rgba(29, 43, 26, 0.08)'
          }}
        >
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-label="Toggle filters"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: '#2c3529'
            }}
          >
            <Menu size={22} strokeWidth={2.2} />
            {selectedFilters.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-forest)'
                }}
              />
            )}
          </button>

          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.98rem',
              color: 'var(--text-dark)',
              fontFamily: 'inherit'
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={17} />
            </button>
          )}

          <Search size={21} color="#2c3529" strokeWidth={2.2} style={{ flexShrink: 0 }} />
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div
            style={{
              backgroundColor: 'var(--bg-cream)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 14,
              boxShadow: 'var(--shadow-card)',
              display: 'grid',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--primary-forest)', fontSize: '0.95rem' }}>
                Filter Recipes
              </strong>
              {selectedFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFilters([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger-red)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <X size={14} /> Clear all
                </button>
              )}
            </div>

            {FILTER_GROUPS.map((group) => (
              <div key={group.label}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}
                >
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {group.options.map((opt) => {
                    const active = selectedFilters.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleFilter(opt.value)}
                        style={{
                          padding: '5px 11px',
                          borderRadius: '8px',
                          border: '1px solid var(--primary-forest)',
                          backgroundColor: active ? 'var(--primary-forest)' : '#ffffff',
                          color: active ? '#ffffff' : 'var(--primary-forest)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Tabs matching M-8.png */}
        {!isSearchingOrFiltering && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginBottom: 16
            }}
          >
            {[
              { key: 'discovery', label: 'Discovery' },
              { key: 'favourites', label: 'Favourites' },
              { key: 'for-you', label: 'For you' }
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--primary-forest)' : 'var(--bg-cream)',
                    color: isActive ? '#ffffff' : '#6c7368',
                    boxShadow: '0 2px 6px rgba(29, 43, 26, 0.08)',
                    transition: 'background-color 0.18s ease, color 0.18s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Error / Redirect Banner */}
        {errorMsg && (
          <AlertBanner
            type="warning"
            message={errorMsg}
            actionLabel={
              actionRedirect === '/profile'
                ? 'Complete Profile'
                : actionRedirect === '/my-kitchen'
                  ? 'Go to My Kitchen'
                  : undefined
            }
            onAction={actionRedirect ? () => navigate(actionRedirect) : undefined}
          />
        )}

        {/* Recipes Feed */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: 24, fontWeight: 600, color: 'var(--primary-forest)' }}>
            Loading recipes...
          </p>
        ) : displayedRecipes.length === 0 && !errorMsg ? (
          <div
            style={{
              backgroundColor: 'var(--bg-cream)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              textAlign: 'center',
              color: 'var(--text-muted)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            No recipes found for this selection.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayedRecipes.map((recipe) => {
              const liked = isRecipeFavorite(recipe);
              return (
                <RecipeCard
                  key={recipe.recipeID}
                  recipe={{
                    ...recipe,
                    heartIcon: liked ? 'filled' : 'outline'
                  }}
                  isFavorite={liked}
                  onToggleFavorite={toggleFavoriteRecipe}
                />
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}