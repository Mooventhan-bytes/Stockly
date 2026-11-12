// Low stock = at or below the reorder threshold; out of stock = zero.
export const stockStatus = (p) => (p.stock === 0 ? 'out' : p.stock <= p.threshold ? 'low' : 'in');
export const STATUS_LABEL = { in: 'In stock', low: 'Low stock', out: 'Out of stock' };
