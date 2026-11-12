// API functions for every page. Each one converts the backend's JSON into the shape the pages already use.
// (The file keeps its old name so no page imports had to change.)
import { api } from './client.js';

export const ORDER_FLOW = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['SHIPPED', 'CANCELLED'], SHIPPED: ['DELIVERED'], DELIVERED: [], CANCELLED: [] };

// ---- Products ----
const toProduct = (p) => ({ id: p.id, name: p.name, sku: p.sku, category: p.categoryName, categoryId: p.categoryId,
  description: p.description || '', price: Number(p.price), stock: p.stockQuantity, threshold: p.reorderThreshold });

export const listProducts = async () => (await api('/api/products?size=100&sort=name')).content.map(toProduct);
export const getCategories = async () => (await listCategories()).map((c) => c.name);

export async function saveProduct(p) {
  const c = (await listCategories()).find((x) => x.name === p.category);
  if (!c) throw new Error('Choose a category.');
  const body = { name: p.name, sku: p.sku, categoryId: c.id, description: p.description || null,
    price: p.price, stockQuantity: p.stock, reorderThreshold: p.threshold };
  return toProduct(p.id ? await api(`/api/products/${p.id}`, { method: 'PUT', body }) : await api('/api/products', { method: 'POST', body }));
}
export const deleteProduct = (id) => api(`/api/products/${id}`, { method: 'DELETE' });

// ---- Categories ----
export const listCategories = () => api('/api/categories');
export const saveCategory = (c) => {
  const body = { name: c.name, description: c.description || null };
  return c.id ? api(`/api/categories/${c.id}`, { method: 'PUT', body }) : api('/api/categories', { method: 'POST', body });
};
export const deleteCategory = (id) => api(`/api/categories/${id}`, { method: 'DELETE' });

// ---- Inventory ----
const toMovement = (m) => ({ id: m.id, productId: m.productId, productName: m.productName, sku: m.sku, type: m.type,
  quantity: m.quantity, before: m.quantityBefore, after: m.quantityAfter, reason: m.reason, createdAt: m.createdAt });

export const listMovements = async () => (await api('/api/inventory/movements?size=50')).content.map(toMovement);
export const adjustStock = (id, { type, quantity, reason, note }) =>
  api(`/api/inventory/products/${id}/adjust`, { method: 'POST',
    body: { type, quantity: Number(quantity), reason: note?.trim() ? `${reason}: ${note.trim()}` : reason } });

// ---- Orders (the pages show "ORD-1005"; the backend id is that number minus 1000) ----
const apiOrderId = (id) => Number(String(id).replace('ORD-', '')) - 1000;
const toOrder = (o) => ({
  id: o.orderNumber,
  customer: { name: o.customerName, phone: o.customerPhone || '', email: o.customerEmail || '' },
  lines: o.items.map((i) => ({ productId: i.productId, name: i.productName, sku: i.sku, unitPrice: Number(i.unitPrice), quantity: i.quantity, lineTotal: Number(i.lineTotal) })),
  total: Number(o.totalAmount), status: o.status, createdAt: o.createdAt,
  history: o.history.map((h) => ({ status: h.status, at: h.changedAt })),
});

export const listOrders = async () => (await api('/api/orders?size=100')).content.map(toOrder);
export const getOrder = async (id) => toOrder(await api(`/api/orders/${apiOrderId(id)}`));
export async function createOrder({ customer, lines, key }) {
  const items = lines.filter((l) => l.productId).map((l) => ({ productId: Number(l.productId), quantity: Number(l.quantity) }));
  if (!items.length) throw new Error('Add at least one product.');
  if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) throw new Error('Quantities must be whole numbers above 0.');
  return toOrder(await api('/api/orders', { method: 'POST', headers: { 'Idempotency-Key': key },
    body: { customerName: customer.name, customerPhone: customer.phone || null, customerEmail: customer.email || null, items } }));
}
export const updateOrderStatus = async (id, next) =>
  toOrder(await api(`/api/orders/${apiOrderId(id)}/status`, { method: 'PUT', body: { status: next } }));

// ---- Alerts and dashboard ----
const toAlert = (a) => ({ id: a.id, productId: a.productId, productName: a.productName, sku: a.sku, kind: a.kind,
  stock: a.stockQuantity, threshold: a.threshold, createdAt: a.createdAt, resolvedAt: a.resolvedAt });

export async function listAlerts() {
  const [open, closed] = await Promise.all([api('/api/alerts?active=true'), api('/api/alerts?active=false')]);
  return [...open, ...closed].map(toAlert);
}
export const getAlertCounts = async () => (await api('/api/alerts/count')).active;
export const getDashboardSummary = () => api('/api/dashboard/summary');

// ---- Users (ADMIN only) ----
export const listUsers = () => api('/api/users');
export const createUser = (u) => api('/api/users', { method: 'POST', body: { fullName: u.fullName, email: u.email, password: u.password, role: u.role } });
export const updateUser = (id, u) => api(`/api/users/${id}`, { method: 'PUT', body: { fullName: u.fullName, role: u.role, enabled: u.enabled, newPassword: u.password || null } });
