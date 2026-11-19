import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import StarRating from './StarRating';
import { useApp } from '../context/AppContext';

const FALLBACK_RECIPE_IMG =
  '[https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80)';

export default function RecipeCard({
  recipe,
  sourceLabel = 'For you',
  sourceTab = 'For you',
  onFavoriteError
}) {
  const navigate = useNavigate();
  const { toggleFavoriteRecipe, isRecipeFavorite } = useApp();

  const recipeID = recipe.recipeID;
  const title = recipe.recipeTitle || 'Untitled Recipe';
  const imageSrc =
    recipe.recipeImage && recipe.recipeImage.startsWith('http')
      ? recipe.recipeImage
      : FALLBACK_RECIPE_IMG;

  const available = recipe.availableIngredientsCount ?? 0;
  const total =
    recipe.totalIngredientsRequired ??
    (Array.isArray(recipe.recipeIngredients) ? recipe.recipeIngredients.length : 0);

  const calories = recipe.calories ?? recipe.recipeCaloricValue ?? '—';
  const cookingTime = recipe.cookingTime ?? '—';
  const rating = recipe.averageRating ?? 0;
  const favorited = isRecipeFavorite(recipeID);

  const handleHeartClick = async (e) => {
    e.stopPropagation();
    try {
      await toggleFavoriteRecipe(recipe);
    } catch (err) {
      if (onFavoriteError) onFavoriteError(err.message);
    }
  };

  return (
    <article
      onClick={() =>
        navigate(`/recipes/${recipeID}`, {
          state: { preview: recipe, sourceLabel, sourceTab }
        })
      }
      style={{
        backgroundColor: 'var(--bg-cream)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease'
      }}
    >
      <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}>
        <img
          src={imageSrc}
          alt={title}
          style={{
            width: '100%',
            height: '215px',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        {total > 0 && (
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'var(--bg-cream)',
              color: 'var(--text-dark)',
              padding: '6px 14px',
              borderTopLeftRadius: '14px',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            {available}/{total} ingredients
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginTop: '10px',
          gap: '8px'
        }}
      >
        <div>
          <h3
            className="brand-heading"
            style={{
              fontSize: '1.22rem',
              color: 'var(--text-dark)',
              marginBottom: '6px'
            }}
          >
            {title}
          </h3>
          <StarRating rating={rating} size={18} />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '6px'
          }}
        >
          <button
            type="button"
            aria-label="Save to favorites"
            onClick={handleHeartClick}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: favorited ? 'var(--danger-red)' : 'var(--text-dark)'
            }}
          >
            <Heart
              size={26}
              fill={favorited ? 'var(--danger-red)' : 'none'}
              strokeWidth={2.2}
            />
          </button>

          <div
            style={{
              textAlign: 'right',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              lineHeight: 1.35
            }}
          >
            <div>Calories: {calories}</div>
            <div>Time: {cookingTime}&apos;</div>
          </div>
        </div>
      </div>
    </article>
  );
}