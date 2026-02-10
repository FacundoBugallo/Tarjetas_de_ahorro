export const formatCurrency = (value, currencyCode = 'COP') => {
  const locale = currencyCode === 'USD' ? 'en-US' : 'es-CO';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
};

export const clampPercentage = (value) => Math.min(100, Math.max(0, value));
