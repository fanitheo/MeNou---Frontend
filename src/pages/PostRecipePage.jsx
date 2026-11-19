import React, { useState, useRef } from 'react';
import { ChevronDown, Image as ImageIcon, X, Plus } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AlertBanner from '../components/AlertBanner';
import { submitNewRecipe } from '../api/recipesApi';
import { KITCHEN_CATEGORIES } from '../utils/constants';
import { validatePostRecipeForm } from '../utils/validators';
import { useApp } from '../context/AppContext';

export default function PostRecipePage() {
  const { session } = useApp();
  const fileInputRef = useRef(null);

  const [recipeTitle, setRecipeTitle] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [customIngInput, setCustomIngInput] = useState('');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [recipeInstructions, setRecipeInstructions] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const toggleIngredient = (ingName) => {
    setFieldErrors((p) => ({ ...p, recipeIngredients: false }));
    setSelectedIngredients((prev) =>
      prev.includes(ingName)
        ? prev.filter((item) => item !== ingName)
        : [...prev, ingName]
    );
  };

  const handleAddCustomIngredientChip = () => {
    const val = customIngInput.trim();
    if (!val) return;
    if (!selectedIngredients.includes(val)) {
      setSelectedIngredients((prev) => [...prev, val]);
    }
    setCustomIngInput('');
    setFieldErrors((p) => ({ ...p, recipeIngredients: false }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setFieldErrors({});

    const payload = {
      userID: Number(session.userID),
      recipeTitle: recipeTitle.trim(),
      recipeImage: imagePreview || undefined,
      recipeIngredients: selectedIngredients,
      recipeInstructions: recipeInstructions.trim()
    };

    const validation = validatePostRecipeForm(payload);
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors);
      setFeedback({ type: 'error', message: validation.message });
      return;
    }

    setSubmitting(true);
    try {
      await submitNewRecipe(session.userID, payload);

      setRecipeTitle('');
      setSelectedIngredients([]);
      setCustomIngInput('');
      setRecipeInstructions('');
      setImagePreview('');
      setIsCatDropdownOpen(false);
      setExpandedCategory(null);
      setFeedback({
        type: 'success',
        message: 'Recipe submitted successfully and added to Discovery!'
      });
    } catch (err) {
      const msg = err.message || 'Failed to submit recipe';
      const lower = msg.toLowerCase();

      if (lower.includes('ingredient')) {
        setFieldErrors({ recipeIngredients: true });
      } else if (lower.includes('language') || lower.includes('offensive')) {
        setFieldErrors({ recipeTitle: true, recipeInstructions: true });
      }

      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Post" showBack backTo="/home" />

      <main className="page-content">
        <div
          style={{
            backgroundColor: 'var(--bg-cream)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 18px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <AlertBanner type={feedback.type} message={feedback.message} />

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label
                style={{
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.98rem'
                }}
              >
                Recipe Title
              </label>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => {
                  setRecipeTitle(e.target.value);
                  setFieldErrors((p) => ({ ...p, recipeTitle: false }));
                }}
                placeholder="Value"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: fieldErrors.recipeTitle
                    ? '2px solid var(--danger-red)'
                    : '1px solid #d2dcc1',
                  backgroundColor: fieldErrors.recipeTitle
                    ? '#fff6f5'
                    : 'var(--bg-field-sage)',
                  fontSize: '0.96rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label
                style={{
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.98rem'
                }}
              >
                Ingredients
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsCatDropdownOpen((prev) => !prev);
                  if (isCatDropdownOpen) setExpandedCategory(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: fieldErrors.recipeIngredients
                    ? '2px solid var(--danger-red)'
                    : '1px solid #d2dcc1',
                  backgroundColor: fieldErrors.recipeIngredients
                    ? '#fff6f5'
                    : 'var(--bg-field-sage)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: 'var(--primary-forest)',
                  fontSize: '0.94rem'
                }}
              >
                <span>
                  {selectedIngredients.length > 0
                    ? `${selectedIngredients.length} ingredient(s) selected`
                    : ''}
                </span>
                <ChevronDown size={22} strokeWidth={2.5} />
              </button>

              {selectedIngredients.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '8px'
                  }}
                >
                  {selectedIngredients.map((ing) => (
                    <span
                      key={ing}
                      style={{
                        backgroundColor: 'var(--primary-forest)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {ing}
                      <X
                        size={13}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleIngredient(ing)}
                      />
                    </span>
                  ))}
                </div>
              )}

              {isCatDropdownOpen && (
                <div
                  style={{
                    marginTop: '4px',
                    backgroundColor: '#e7eddc',
                    border: '1.5px solid var(--primary-forest)',
                    borderRadius: '10px',
                    maxHeight: '235px',
                    overflowY: 'auto',
                    position: 'relative',
                    zIndex: 25
                  }}
                >
                  {KITCHEN_CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategory?.name === cat.name;
                    return (
                      <div key={cat.name}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCategory(isExpanded ? null : cat)
                          }
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            backgroundColor: isExpanded
                              ? '#d6e3c2'
                              : 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'var(--primary-forest)',
                            fontWeight: isExpanded ? 700 : 500,
                            fontSize: '0.96rem',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{cat.name}</span>
                          <ChevronDown
                            size={19}
                            strokeWidth={2.4}
                            style={{
                              opacity: isExpanded ? 1 : 0.55,
                              transform: isExpanded ? 'rotate(180deg)' : 'none'
                            }}
                          />
                        </button>

                        {isExpanded && (
                          <div
                            style={{
                              margin: '0 12px 8px 18px',
                              backgroundColor: 'var(--bg-cream)',
                              border: '1.5px solid var(--primary-forest)',
                              borderRadius: '8px',
                              maxHeight: '170px',
                              overflowY: 'auto'
                            }}
                          >
                            {cat.items.map((item) => {
                              const picked = selectedIngredients.includes(
                                item.ingredientName
                              );
                              return (
                                <button
                                  key={item.ingredientID}
                                  type="button"
                                  onClick={() =>
                                    toggleIngredient(item.ingredientName)
                                  }
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '9px 14px',
                                    backgroundColor: picked
                                      ? '#dce8cb'
                                      : 'transparent',
                                    border: 'none',
                                    color: 'var(--primary-forest)',
                                    fontWeight: picked ? 700 : 500,
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <span>{item.ingredientName}</span>
                                  {picked && <span>✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      padding: '8px 12px',
                      borderTop: '1px solid #c9d5b6'
                    }}
                  >
                    <input
                      type="text"
                      value={customIngInput}
                      onChange={(e) => setCustomIngInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomIngredientChip();
                        }
                      }}
                      placeholder="Or type ingredient name..."
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid #b8c6a2',
                        fontSize: '0.85rem',
                        background: '#fff'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomIngredientChip}
                      className="btn-forest"
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.98rem'
                }}
              >
                Cooking Instructions
              </label>
              <textarea
                rows={4}
                value={recipeInstructions}
                onChange={(e) => {
                  setRecipeInstructions(e.target.value);
                  setFieldErrors((p) => ({ ...p, recipeInstructions: false }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: fieldErrors.recipeInstructions
                    ? '2px solid var(--danger-red)'
                    : '1px solid #d2dcc1',
                  backgroundColor: fieldErrors.recipeInstructions
                    ? '#fff6f5'
                    : 'var(--bg-field-sage)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.98rem'
                }}
              >
                Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  height: '165px',
                  borderRadius: '10px',
                  border: '1px solid #d2dcc1',
                  backgroundColor: 'var(--bg-field-sage)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <ImageIcon size={46} color="#444842" strokeWidth={1.8} />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-forest"
              disabled={submitting}
              style={{ width: '100%', padding: '13px', marginTop: '4px' }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </main>

      <BottomNav />
    </>
  );
}