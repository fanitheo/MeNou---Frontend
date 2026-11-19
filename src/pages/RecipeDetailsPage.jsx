import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Pencil, CheckSquare, Square, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import StarRating from '../components/StarRating';
import AlertBanner from '../components/AlertBanner';
import {
  getFullRecipe,
  getRecipeAlternatives,
  submitRecipeRating
} from '../api/recipesApi';
import { useApp } from '../context/AppContext';

const FALLBACK_IMG =
  '[https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80)';

export default function RecipeDetailsPage() {
  const { recipeID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, kitchenIngredients } = useApp();

  const preview = location.state?.preview || null;
  const sourceLabel = location.state?.sourceLabel || 'For you';
  const sourceTab = location.state?.sourceTab || 'For you';

  const [recipe, setRecipe] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailableError, setUnavailableError] = useState(false);

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [userRating, setUserRating] = useState(4);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    let active = true;
    async function loadDetails() {
      setLoading(true);
      setUnavailableError(false);
      try {
        const data = await getFullRecipe(
          session.userID,
          recipeID,
          session.kitchenID
        );
        if (!data || !data.recipeTitle) {
          throw new Error('Recipe description currently unavailable.');
        }
        if (active) setRecipe(data);

        try {
          const alts = await getRecipeAlternatives(
            session.userID,
            recipeID,
            session.kitchenID
          );
          if (active) setAlternatives(alts);
        } catch {
          // Optional if backend has no alternatives for this recipe
        }
      } catch {
        if (active) setUnavailableError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDetails();
    return () => {
      active = false;
    };
  }, [recipeID, session.userID, session.kitchenID]);

  const handleRatingSubmit = async (stars) => {
    setUserRating(stars);
    try {
      const res = await submitRecipeRating(session.userID, recipeID, stars);
      setFeedback({
        type: 'success',
        message: res?.message || 'Rating uploaded successfully'
      });
      setIsRatingOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const hasIngredientInKitchen = (ingredientLine) => {
    const lowerLine = ingredientLine.toLowerCase();
    return kitchenIngredients.some(
      (k) =>
        k.ingredientName &&
        lowerLine.includes(k.ingredientName.toLowerCase())
    );
  };

  if (loading) {
    return (
      <>
        <Header
          showBack
          onBackClick={() =>
            navigate('/home', { state: { restoreTab: sourceTab } })
          }
        />
        <main className="page-content">
          <div
            style={{
              background: 'var(--bg-cream)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              textAlign: 'center',
              fontWeight: 600
            }}
          >
            Loading recipe details...
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  // AD-3, AD-4, AD-5 & User Stories S-6, S-8, S-9 failure flow
  if (unavailableError || !recipe) {
    return (
      <>
        <Header
          showBack
          onBackClick={() =>
            navigate('/home', { state: { restoreTab: sourceTab } })
          }
        />
        <main className="page-content">
          <div
            style={{
              background: 'var(--bg-cream)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <AlertBanner
              type="error"
              message="Recipe description currently unavailable."
            />
            <button
              type="button"
              className="btn-forest"
              onClick={() =>
                navigate('/home', { state: { restoreTab: sourceTab } })
              }
            >
              Return to {sourceLabel} Screen
            </button>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const ingredientsList = Array.isArray(recipe.recipeIngredients)
    ? recipe.recipeIngredients
    : [];
  const matchedCount =
    preview?.availableIngredientsCount ??
    ingredientsList.filter(hasIngredientInKitchen).length;
  const totalCount =
    preview?.totalIngredientsRequired ?? ingredientsList.length;

  const imageSrc =
    recipe.recipeImage && recipe.recipeImage.startsWith('http')
      ? recipe.recipeImage
      : preview?.recipeImage && preview.recipeImage.startsWith('http')
      ? preview.recipeImage
      : FALLBACK_IMG;

  return (
    <>
      <Header
        showBack
        onBackClick={() =>
          navigate('/home', { state: { restoreTab: sourceTab } })
        }
      />

      <main className="page-content">
        <AlertBanner type={feedback.type} message={feedback.message} />

        <article
          style={{
            backgroundColor: 'var(--bg-cream)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <h1
              className="brand-heading"
              style={{ fontSize: '1.55rem', color: 'var(--text-dark)' }}
            >
              {recipe.recipeTitle}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StarRating rating={recipe.averageRating} size={18} />
              <button
                type="button"
                aria-label="Rate recipe"
                onClick={() => setIsRatingOpen((p) => !p)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-dark)',
                  display: 'flex'
                }}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {isRatingOpen && (
            <div
              style={{
                background: '#fff',
                border: '1px solid var(--border-soft)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Rate this recipe:
              </span>
              <StarRating
                rating={userRating}
                size={22}
                interactive
                onSelect={handleRatingSubmit}
              />
            </div>
          )}

          <div
            style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}
          >
            <img
              src={imageSrc}
              alt={recipe.recipeTitle}
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--bg-cream)',
                padding: '8px 14px',
                borderTopLeftRadius: '16px',
                textAlign: 'right',
                fontSize: '0.84rem',
                lineHeight: 1.35
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {matchedCount}/{totalCount} ingredients
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Calories: {recipe.recipeCaloricValue}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Time: {recipe.cookingTime}&apos;
              </div>
            </div>
          </div>

          <section style={{ marginTop: '16px' }}>
            <h2
              style={{
                fontSize: '1.18rem',
                fontWeight: 700,
                marginBottom: '10px'
              }}
            >
              Ingredients
            </h2>

            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {ingredientsList.map((item, idx) => {
                const available = hasIngredientInKitchen(item);
                return (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '1rem'
                    }}
                  >
                    {available ? (
                      <CheckSquare size={20} color="var(--primary-forest)" />
                    ) : (
                      <Square size={20} color="var(--primary-forest)" />
                    )}
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {alternatives.length > 0 && (
            <section
              style={{
                marginTop: '16px',
                background: '#eef4e7',
                borderRadius: '12px',
                padding: '12px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: 'var(--primary-forest)'
                }}
              >
                <RefreshCw size={16} />
                <span>Suggested Ingredient Alternatives</span>
              </div>
              {alternatives.map((alt, i) => (
                <div key={i} style={{ fontSize: '0.88rem' }}>
                  Missing Ingredient #{alt.missingIngredientID} → Alternative #
                  {alt.altIngredientID}
                </div>
              ))}
            </section>
          )}

          <section style={{ marginTop: '18px' }}>
            <h2
              style={{
                fontSize: '1.18rem',
                fontWeight: 700,
                marginBottom: '8px'
              }}
            >
              Instructions
            </h2>
            <p
              style={{
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
                fontSize: '0.96rem',
                color: 'var(--text-dark)'
              }}
            >
              {recipe.recipeInstructions}
            </p>
          </section>

          {Array.isArray(recipe.recipeMacronutrients) &&
            recipe.recipeMacronutrients.length > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-soft)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)'
                }}
              >
                {recipe.difficulty && (
                  <span>Difficulty: {recipe.difficulty}</span>
                )}
                <span>
                  Macros (P/C/F): {recipe.recipeMacronutrients.join('g / ')}g
                </span>
              </div>
            )}
        </article>
      </main>

      <BottomNav />
    </>
  );
}