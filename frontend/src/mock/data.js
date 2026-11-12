// Sample data for the visual preview only. Replaced by API calls in Stage 5.
export const summary = { products: 248, units: 12840, low: 14, out: 5, pending: 23 };
export const stockStatus = { inStock: 229, low: 14, out: 5 };
export const categoryShare = [
  { name: 'Electronics', pct: 45, tone: 'lav' },
  { name: 'Accessories', pct: 30, tone: 'dark' },
  { name: 'Stationery', pct: 25, tone: 'lime' },
];
export const monthly = [
  { m: 'May', in: 820, out: 640 }, { m: 'Jun', in: 960, out: 710 }, { m: 'Jul', in: 700, out: 820 },
  { m: 'Aug', in: 1100, out: 900 }, { m: 'Sep', in: 1240, out: 1010 }, { m: 'Oct', in: 1650, out: 1180 },
];
export const recentOrders = [
  { id: 'ORD-1042', customer: 'Anitha Traders', total: 48250, status: 'PENDING' },
  { id: 'ORD-1041', customer: 'Karthik Stores', total: 12900, status: 'SHIPPED' },
  { id: 'ORD-1040', customer: 'Meena Retail', total: 76400, status: 'CONFIRMED' },
  { id: 'ORD-1039', customer: 'Ravi Electronics', total: 5300, status: 'DELIVERED' },
];
export const alerts = [
  { sku: 'KB-204', name: 'Wireless Keyboard', stock: 4, threshold: 15 },
  { sku: 'MS-118', name: 'Optical Mouse', stock: 0, threshold: 20 },
  { sku: 'NB-032', name: 'A5 Notebook (pack of 10)', stock: 9, threshold: 25 },
];
