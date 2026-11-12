export const ORDER_LABEL = { PENDING: 'Pending', CONFIRMED: 'Confirmed', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
export const ACTION_LABEL = { CONFIRMED: 'Confirm order', SHIPPED: 'Mark as shipped', DELIVERED: 'Mark as delivered', CANCELLED: 'Cancel order' };
export const when = (iso) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
