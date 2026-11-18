export function calculateBMI(weightKg, heightInput) {
  const weight = Number(weightKg);
  const rawHeight = Number(heightInput);
  if (!weight || !rawHeight || weight <= 0 || rawHeight <= 0) {
    return '';
  }
  const heightMeters = rawHeight > 3 ? rawHeight / 100 : rawHeight;
  const bmi = weight / (heightMeters * heightMeters);
  return Math.round(bmi);
}

export function getDefaultExpirationDate(daysFromNow = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export function getExpirationBadge(expirationDate) {
  if (!expirationDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expirationDate);
  if (Number.isNaN(exp.getTime())) return null;
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Expired', tone: 'danger' };
  }
  if (diffDays <= 3) {
    return {
      label: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      tone: 'warning'
    };
  }
  return { label: expirationDate, tone: 'neutral' };
}