import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { addIngredientToKitchen } from '../api/kitchenApi';
import { useApp } from '../context/AppContext';
import { getDefaultExpirationDate } from '../utils/formatters';
import AlertBanner from './AlertBanner';
import IngredientQuantityDateCard from './IngredientQuantityDateCard';

export default function CategoryIngredientsView({
  category,
  onAddedSuccess,
  editingItem,
  setEditingItem
}) {
  const { session, refreshKitchen } = useApp();
  const [selectedMap, setSelectedMap] = useState({});
  const [customDetailsMap, setCustomDetailsMap] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!category) return null;

  const toggleItem = (item) => {
    setErrorMsg('');
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[item.ingredientID]) {
        delete next[item.ingredientID];
      } else {
        const existingDetails = customDetailsMap[item.ingredientID];
        next[item.ingredientID] = {
          ingredientID: item.ingredientID,
          ingredientName: item.ingredientName,
          quantity: existingDetails?.quantity || item.defaultQty || '1',
          unit: existingDetails?.unit || item.defaultUnit || 'gr',
          expirationDate:
            existingDetails?.expirationDate || getDefaultExpirationDate(7)
        };
      }
      return next;
    });
  };

  const handleSaveDetailsFromM5 = (item, details) => {
    setCustomDetailsMap((prev) => ({
      ...prev,
      [item.ingredientID]: details
    }));
    setSelectedMap((prev) => ({
      ...prev,
      [item.ingredientID]: {
        ingredientID: item.ingredientID,
        ingredientName: item.ingredientName,
        ...details
      }
    }));
    setEditingItem(null);
  };

  if (editingItem) {
    const currentDetails =
      selectedMap[editingItem.ingredientID] ||
      customDetailsMap[editingItem.ingredientID] || {
        quantity: editingItem.defaultQty,
        unit: editingItem.defaultUnit,
        expirationDate: ''
      };

    return (
      <IngredientQuantityDateCard
        ingredientName={editingItem.ingredientName}
        initialValues={currentDetails}
        onSave={(details) => handleSaveDetailsFromM5(editingItem, details)}
        onCancel={() => setEditingItem(null)}
      />
    );
  }

  const handleAdd = async () => {
    const selectedItems = Object.values(selectedMap);

    // User Story S-2 & AD-7: No checkbox selected validation
    if (selectedItems.length === 0) {
      setErrorMsg(
        'No ingredients were selected. Please select at least one ingredient.'
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      for (const item of selectedItems) {
        await addIngredientToKitchen(session.userID, session.kitchenID, {
          kitchenID: session.kitchenID,
          ingredientID: item.ingredientID,
          kitchenIngredientID: Date.now() + item.ingredientID,
          quantity: String(item.quantity),
          unit: item.unit,
          expirationDate: item.expirationDate
        });
      }
      await refreshKitchen();
      onAddedSuccess('Items successfully added to My Kitchen');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add ingredients to kitchen');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      style={{
        backgroundColor: 'var(--bg-cream)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 18px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <h2
        className="brand-heading"
        style={{
          fontSize: '1.65rem',
          color: 'var(--primary-forest)',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--border-soft)',
          marginBottom: '14px'
        }}
      >
        {category.pluralTitle || category.name}
      </h2>

      <AlertBanner type="error" message={errorMsg} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxHeight: '420px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {category.items.map((item) => {
          const checked = Boolean(selectedMap[item.ingredientID]);
          const custom = customDetailsMap[item.ingredientID];

          return (
            <div
              key={item.ingredientID}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <button
                type="button"
                aria-label={`Select ${item.ingredientName}`}
                onClick={() => toggleItem(item)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 0 0',
                  cursor: 'pointer',
                  color: 'var(--primary-forest)'
                }}
              >
                {checked ? (
                  <CheckSquare size={22} strokeWidth={2.2} />
                ) : (
                  <Square size={22} strokeWidth={2} />
                )}
              </button>

              <div style={{ flex: 1 }}>
                <div
                  onClick={() => toggleItem(item)}
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 600,
                    color: 'var(--primary-forest)',
                    cursor: 'pointer'
                  }}
                >
                  {item.ingredientName}
                </div>

                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    marginTop: '2px',
                    fontSize: '0.84rem',
                    color: custom ? 'var(--primary-forest)' : 'var(--text-muted)',
                    fontWeight: custom ? 600 : 400,
                    textDecoration: custom ? 'underline' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {custom
                    ? `${custom.quantity} ${custom.unit} • Exp: ${custom.expirationDate}`
                    : 'Set quantity & expiration date'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-forest"
        disabled={submitting}
        onClick={handleAdd}
        style={{ width: '100%', marginTop: '20px', padding: '12px' }}
      >
        {submitting ? 'Adding...' : 'Add'}
      </button>
    </section>
  );
}