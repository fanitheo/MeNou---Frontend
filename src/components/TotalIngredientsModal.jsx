import React, { useState } from 'react';
import { X, Trash2, Edit3, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  deleteKitchenIngredient,
  updateKitchenIngredient
} from '../api/kitchenApi';
import { getExpirationBadge } from '../utils/formatters';
import { INGREDIENT_UNITS } from '../utils/constants';
import AlertBanner from './AlertBanner';

export default function TotalIngredientsModal({ isOpen, onClose }) {
  const { session, kitchenIngredients, refreshKitchen } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [busyId, setBusyId] = useState(null);

  if (!isOpen) return null;

  const startEdit = (item) => {
    setEditingId(item.kitchenIngredientID);
    setEditValues({
      kitchenIngredientID: item.kitchenIngredientID,
      ingredientName: item.ingredientName,
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expirationDate || ''
    });
  };

  const handleSaveEdit = async (kitchenIngredientID) => {
    setBusyId(kitchenIngredientID);
    setFeedback({ type: '', message: '' });
    try {
      await updateKitchenIngredient(
        session.userID,
        session.kitchenID,
        kitchenIngredientID,
        editValues
      );
      await refreshKitchen();
      setEditingId(null);
      setFeedback({ type: 'success', message: 'Ingredient updated successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (kitchenIngredientID) => {
    setBusyId(kitchenIngredientID);
    setFeedback({ type: '', message: '' });
    try {
      await deleteKitchenIngredient(
        session.userID,
        session.kitchenID,
        kitchenIngredientID
      );
      await refreshKitchen();
      setFeedback({ type: 'success', message: 'Ingredient deleted successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <h2 className="brand-heading" style={{ fontSize: '1.35rem' }}>
            Total Ingredients ({kitchenIngredients.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <AlertBanner type={feedback.type} message={feedback.message} />

        {kitchenIngredients.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '14px 0' }}>
            Your digital kitchen is currently empty. Select a category or press + to add ingredients.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {kitchenIngredients.map((item) => {
              const isEditing = editingId === item.kitchenIngredientID;
              const badge = getExpirationBadge(item.expirationDate);
              return (
                <div
                  key={item.kitchenIngredientID}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-soft)'
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <strong>{item.ingredientName}</strong>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1.3fr',
                          gap: '6px'
                        }}
                      >
                        <input
                          type="text"
                          value={editValues.quantity}
                          onChange={(e) =>
                            setEditValues((p) => ({ ...p, quantity: e.target.value }))
                          }
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #ccc'
                          }}
                        />
                        <select
                          value={editValues.unit}
                          onChange={(e) =>
                            setEditValues((p) => ({ ...p, unit: e.target.value }))
                          }
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #ccc'
                          }}
                        >
                          {INGREDIENT_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editValues.expirationDate}
                          onChange={(e) =>
                            setEditValues((p) => ({
                              ...p,
                              expirationDate: e.target.value
                            }))
                          }
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #ccc'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-forest"
                        disabled={busyId === item.kitchenIngredientID}
                        onClick={() => handleSaveEdit(item.kitchenIngredientID)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <Check size={16} /> Save Changes
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.ingredientName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {item.quantity} {item.unit}
                          {badge && (
                            <span
                              style={{
                                marginLeft: '8px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background:
                                  badge.tone === 'danger'
                                    ? 'var(--danger-bg)'
                                    : badge.tone === 'warning'
                                    ? 'var(--warning-bg)'
                                    : '#eef2ea',
                                color:
                                  badge.tone === 'danger'
                                    ? 'var(--danger-red)'
                                    : badge.tone === 'warning'
                                    ? 'var(--warning-amber)'
                                    : 'var(--text-muted)'
                              }}
                            >
                              {badge.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          aria-label="Edit ingredient"
                          onClick={() => startEdit(item)}
                          style={{
                            background: '#eef2ea',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: 'var(--primary-forest)'
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete ingredient"
                          disabled={busyId === item.kitchenIngredientID}
                          onClick={() => handleDelete(item.kitchenIngredientID)}
                          style={{
                            background: 'var(--danger-bg)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: 'var(--danger-red)'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}