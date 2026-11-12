export const CURRENCY = 'INR'; // change here to switch currency everywhere
export const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(n);
export const num = (n) => new Intl.NumberFormat('en-IN').format(n);
