import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { savePersonalInfo, updatePersonalInfo } from '../api/profileApi';
import { calculateBMI } from '../utils/formatters';
import { validateProfileForm } from '../utils/validators';
import AlertBanner from '../components/AlertBanner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { session, updateSession, logout } = useApp();

  const [form, setForm] = useState({
    age: session.profileData?.age ?? '',
    weight: session.profileData?.weight ?? '',
    gender: session.profileData?.gender ?? '',
    height: session.profileData?.height ?? '',
    food_allergies: session.profileData?.food_allergies ?? '',
    bmi: session.profileData?.bmi ?? '',
    body_type_goals: session.profileData?.body_type_goals ?? 'Maintain weight',
    intolerances: session.profileData?.intolerances ?? 'None',
    body_fat: session.profileData?.body_composition?.[0] ?? 20,
    muscle_mass: session.profileData?.body_composition?.[1] ?? 40
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const computed = calculateBMI(form.weight, form.height);
    if (computed !== '') {
      setForm((prev) => ({ ...prev, bmi: computed }));
    }
  }, [form.weight, form.height]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
    setBanner({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateProfileForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors);
      setBanner({ type: 'error', message: validation.message });
      return;
    }

    const rawHeight = Number(form.height);
    const heightFloat =
      rawHeight > 3 ? Number((rawHeight / 100).toFixed(2)) : rawHeight;

    const payload = {
      userID: Number(session.userID),
      age: Number(form.age),
      weight: Math.round(Number(form.weight)),
      gender: form.gender.trim(),
      height: heightFloat,
      food_allergies: form.food_allergies.trim(),
      bmi: Math.round(
        Number(form.bmi || calculateBMI(form.weight, form.height))
      ),
      body_type_goals: form.body_type_goals.trim(),
      intolerances: form.intolerances.trim(),
      body_composition: [
        Number(form.body_fat) || 0,
        Number(form.muscle_mass) || 0
      ]
    };

    setSubmitting(true);
    setFieldErrors({});
    try {
      const response = session.hasProfile
        ? await updatePersonalInfo(session.userID, payload)
        : await savePersonalInfo(session.userID, payload);

      updateSession({
        hasProfile: true,
        profileData: payload
      });

      setBanner({
        type: 'success',
        message: response?.message || 'Profile saved successfully'
      });
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.message || 'Unexpected error saving profile'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-olive-profile)'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-sage)',
          backgroundImage: 'url("/food-pattern.svg")',
          height: '150px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative'
        }}
      >
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate('/home')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--primary-forest)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={26} strokeWidth={2.4} />
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn-cream"
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            display: 'flex',
            gap: '5px',
            alignItems: 'center'
          }}
        >
          <LogOut size={14} /> Switch User (#{session.userID})
        </button>

        <div
          style={{
            position: 'absolute',
            bottom: '-56px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '116px',
            height: '116px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-cream)',
            border: '10px solid #4e7d41',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3a3c42'
          }}
        >
          <User size={62} strokeWidth={2} />
        </div>
      </div>

      <div style={{ padding: '68px 26px 32px', flex: 1 }}>
        <h1
          className="brand-heading"
          style={{
            textAlign: 'center',
            color: '#c8e0ad',
            fontSize: '1.75rem',
            marginBottom: '18px'
          }}
        >
          hi {session.username}!
        </h1>

        <AlertBanner
          type={banner.type}
          message={banner.message}
          actionLabel={
            banner.type === 'success' ? 'Go to For You Recipes' : undefined
          }
          actionTo={banner.type === 'success' ? '/home' : undefined}
        />

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          {[
            { key: 'age', placeholder: 'Age', type: 'number', required: true },
            {
              key: 'weight',
              placeholder: 'Weight (kg)',
              type: 'number',
              required: true
            },
            { key: 'gender', placeholder: 'Gender', type: 'text', required: true },
            {
              key: 'height',
              placeholder: 'Height (m or cm)',
              type: 'number',
              required: true
            },
            {
              key: 'food_allergies',
              placeholder: 'Food Allergies (e.g. None, Nuts)',
              type: 'text',
              required: true
            },
            {
              key: 'bmi',
              placeholder: 'BMI (auto-calculated)',
              type: 'number',
              required: false
            },
            {
              key: 'body_type_goals',
              placeholder: 'Body Goals (e.g. Maintain weight, Muscle gain)',
              type: 'text',
              required: true
            },
            {
              key: 'intolerances',
              placeholder: 'Intolerances (e.g. None, Lactose)',
              type: 'text',
              required: true
            }
          ].map(({ key, placeholder, type, required }) => (
            <div key={key} style={{ position: 'relative' }}>
              {required && (
                <span
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '-14px',
                    color: '#d8ecc2',
                    fontSize: '0.85rem'
                  }}
                >
                  ★
                </span>
              )}
              <input
                type={type}
                step="any"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className={`input-cream ${fieldErrors[key] ? 'input-error' : ''}`}
              />
            </div>
          ))}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}
          >
            <input
              type="number"
              step="0.1"
              value={form.body_fat}
              onChange={(e) => handleChange('body_fat', e.target.value)}
              placeholder="Body Fat %"
              className="input-cream"
            />
            <input
              type="number"
              step="0.1"
              value={form.muscle_mass}
              onChange={(e) => handleChange('muscle_mass', e.target.value)}
              placeholder="Muscle Mass %"
              className="input-cream"
            />
          </div>

          <button
            type="submit"
            className="btn-forest"
            disabled={submitting}
            style={{
              marginTop: '10px',
              padding: '14px',
              fontSize: '1.15rem',
              border: '1px solid #9ec079'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}