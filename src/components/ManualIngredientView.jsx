import React, { useState } from 'react';
import { ChevronDown, CheckSquare, Square } from 'lucide-react';
import { KITCHEN_CATEGORIES } from '../utils/constants';
import { validateManualIngredient } from '../utils/validators';
import { createManualIngredient } from '../api/kitchenApi';
import { useApp } from '../context/AppContext';
import AlertBanner from './AlertBanner';

export default function ManualIngredientView({ onSuccess }) {
  const { session, refreshKitchen } = useApp();
  const [ingredientName, setIngredientName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toggleCategory = (catName) => {
    setErrorMsg('');
    setFieldErrors({});
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      userID: session.userID,
      ingredientName: ingredientName.trim(),
      ingredient_category: selectedCategories
    };

    // Activity Diagram 2 & User Story S-3 validation
    const validation = validateManualIngredient(payload);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      setFieldErrors(validation.fieldErrors);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setFieldErrors({});
    try {
      await createManualIngredient(session.userID, session.kitchenID, payload);
      await refreshKitchen();
      setIngredientName('');
      setSelectedCategories([]);
      onSuccess('Custom ingredient added successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Could not add custom ingredient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2
        className="brand-heading"
        style={{
          textAlign: 'center',
          fontSize: '2.15rem',
          lineHeight: 1.05,
          textTransform: 'uppercase',
          margin: '6px 0 20px',
          color: 'var(--primary-forest)'
        }}
      >
        ADD
        <br />
        MANUALLY
      </h2>

      <div
        style={{
          backgroundColor: 'var(--bg-cream)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 18px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <AlertBanner type="error" message={errorMsg} />

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.98rem',
                color: 'var(--primary-forest)',
                marginBottom: '6px'
              }}
            >
              Ingredient
            </label>
            <input
              type="text"
              value={ingredientName}
              onChange={(e) => {
                setIngredientName(e.target.value);
                setErrorMsg('');
                setFieldErrors({});
              }}
              placeholder="Value"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: fieldErrors.ingredientName
                  ? '#fff6f5'
                  : 'var(--bg-field-sage)',
                border: fieldErrors.ingredientName
                  ? '2px solid var(--danger-red)'
                  : '1px solid #d2dcc1',
                fontSize: '0.98rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.98rem',
                color: 'var(--primary-forest)',
                marginBottom: '6px'
              }}
            >
              Category
            </label>

            <button
              type="button"
              onClick={() => setDropdownOpen((p) => !p)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: fieldErrors.ingredient_category
                  ? '#fff6f5'
                  : 'var(--bg-field-sage)',
                border: fieldErrors.ingredient_category
                  ? '2px solid var(--danger-red)'
                  : '1px solid #d2dcc1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: 'var(--primary-forest)',
                cursor: 'pointer'
              }}
            >
              <span>
                {selectedCategories.length > 0
                  ? selectedCategories.join(', ')
                  : ''}
              </span>
              <ChevronDown
                size={22}
                strokeWidth={2.5}
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  marginTop: '4px',
                  backgroundColor: '#e7eddc',
                  borderRadius: '10px',
                  border: '1px solid #cfd9be',
                  maxHeight: '215px',
                  overflowY: 'auto',
                  padding: '6px 0'
                }}
              >
                {KITCHEN_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.name);
                  return (
                    <div
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        color: 'var(--primary-forest)',
                        fontWeight: isChecked ? 700 : 500
                      }}
                    >
                      <span>{cat.name}</span>
                      {isChecked ? (
                        <CheckSquare size={20} strokeWidth={2.2} />
                      ) : (
                        <Square size={20} strokeWidth={2} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-forest"
            disabled={submitting}
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {submitting ? 'Saving...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
}