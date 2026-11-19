import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { INGREDIENT_UNITS } from '../utils/constants';
import AlertBanner from './AlertBanner';

export default function IngredientQuantityDateCard({
  ingredientName,
  initialValues,
  onSave,
  onCancel
}) {
  const parseInitialDate = (isoDate) => {
    if (!isoDate || !isoDate.includes('-')) return { dd: '', mm: '', yyyy: '' };
    const [yyyy, mm, dd] = isoDate.split('-');
    return { dd: dd || '', mm: mm || '', yyyy: yyyy || '' };
  };

  const initDate = parseInitialDate(initialValues?.expirationDate);

  const [dd, setDd] = useState(initDate.dd);
  const [mm, setMm] = useState(initDate.mm);
  const [yyyy, setYyyy] = useState(initDate.yyyy);
  const [quantity, setQuantity] = useState(initialValues?.quantity || '');
  const [unit, setUnit] = useState(initialValues?.unit || 'gr');
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const dayNum = Number(dd);
    const monthNum = Number(mm);
    const yearNum = Number(yyyy);

    if (
      !dd ||
      !mm ||
      !yyyy ||
      dayNum < 1 ||
      dayNum > 31 ||
      monthNum < 1 ||
      monthNum > 12 ||
      yyyy.length !== 4 ||
      yearNum < 2024
    ) {
      setError('Please enter a valid Expiration Date (DD / MM / YYYY).');
      return;
    }

    if (!quantity || Number(quantity) <= 0 || Number.isNaN(Number(quantity))) {
      setError('Please enter a valid Quantity value.');
      return;
    }

    const formattedDate = `${yyyy}-${String(monthNum).padStart(2, '0')}-${String(
      dayNum
    ).padStart(2, '0')}`;

    onSave({
      quantity: String(quantity).trim(),
      unit,
      expirationDate: formattedDate
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-cream)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 20px',
        boxShadow: 'var(--shadow-card)',
        marginTop: '10px'
      }}
    >
      {ingredientName && (
        <div
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--primary-forest)',
            marginBottom: '12px'
          }}
        >
          Item: {ingredientName}
        </div>
      )}

      <AlertBanner type="error" message={error} />

      <form onSubmit={handleSave}>
        <label
          className="brand-heading"
          style={{
            display: 'block',
            fontSize: '1.15rem',
            color: 'var(--text-dark)',
            marginBottom: '10px'
          }}
        >
          Expiration Date:
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.25fr',
            gap: '10px',
            marginBottom: '22px'
          }}
        >
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={dd}
            onChange={(e) => {
              setError('');
              setDd(e.target.value.replace(/\D/g, ''));
            }}
            placeholder="DD"
            style={{
              backgroundColor: 'var(--bg-field-sage)',
              border: '1px solid #d2dcc1',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
              fontSize: '1rem',
              color: 'var(--text-dark)',
              outline: 'none'
            }}
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={mm}
            onChange={(e) => {
              setError('');
              setMm(e.target.value.replace(/\D/g, ''));
            }}
            placeholder="MM"
            style={{
              backgroundColor: 'var(--bg-field-sage)',
              border: '1px solid #d2dcc1',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
              fontSize: '1rem',
              color: 'var(--text-dark)',
              outline: 'none'
            }}
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={yyyy}
            onChange={(e) => {
              setError('');
              setYyyy(e.target.value.replace(/\D/g, ''));
            }}
            placeholder="YYYY"
            style={{
              backgroundColor: 'var(--bg-field-sage)',
              border: '1px solid #d2dcc1',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
              fontSize: '1rem',
              color: 'var(--text-dark)',
              outline: 'none'
            }}
          />
        </div>

        <label
          className="brand-heading"
          style={{
            display: 'block',
            fontSize: '1.15rem',
            color: 'var(--text-dark)',
            marginBottom: '10px'
          }}
        >
          Quantity:
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.65fr 1fr',
            gap: '10px',
            marginBottom: '26px',
            position: 'relative'
          }}
        >
          <input
            type="number"
            step="any"
            min="0.01"
            value={quantity}
            onChange={(e) => {
              setError('');
              setQuantity(e.target.value);
            }}
            placeholder="Value"
            style={{
              backgroundColor: 'var(--bg-field-sage)',
              border: '1px solid #d2dcc1',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '1rem',
              color: 'var(--text-dark)',
              outline: 'none'
            }}
          />

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsUnitOpen((p) => !p)}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--bg-field-sage)',
                border: '1px solid #d2dcc1',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--primary-forest)',
                cursor: 'pointer'
              }}
            >
              <span>{unit}</span>
              <ChevronDown size={20} strokeWidth={2.5} />
            </button>

            {isUnitOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  maxHeight: '165px',
                  overflowY: 'auto',
                  backgroundColor: '#e7eddc',
                  border: '1px solid #c3d1ae',
                  borderRadius: '10px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.14)',
                  zIndex: 30
                }}
              >
                {INGREDIENT_UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      setUnit(u);
                      setIsUnitOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      background: unit === u ? '#d6e3c2' : 'transparent',
                      border: 'none',
                      fontSize: '0.96rem',
                      fontWeight: unit === u ? 700 : 500,
                      color: 'var(--primary-forest)',
                      cursor: 'pointer'
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onCancel && (
            <button
              type="button"
              className="btn-cream"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-forest"
            style={{ flex: 2, padding: '12px', fontSize: '1.05rem' }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}