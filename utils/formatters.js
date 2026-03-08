export const formatCurrency = (value, currencyCode = 'ARS') => {
  const localeByCurrency = {
    USD: 'en-US',
    ARS: 'es-AR',
  };
  const locale = localeByCurrency[currencyCode] || 'es-AR';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
};

export const clampPercentage = (value) => Math.min(100, Math.max(0, value));
