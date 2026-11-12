# REST API reference

Base URL `http://localhost:8080`. All endpoints except `POST /api/auth/login` need the header `Authorization: Bearer <token>`.
"ADMIN" rows are refused with 403 for STAFF users. Money values are decimals; times are ISO-8601 UTC.

## Errors (same shape everywhere)
```json
{ "timestamp": "2026-10-18T10:15:30Z", "status": 400, "message": "Please correct the highlighted fields.",
  "fieldErrors": { "price": "Price must be above 0." } }
```
`400` invalid input, `401` not signed in or wrong credentials, `403` not allowed, `404` not found, `409` business-rule conflict (duplicate SKU, not enough stock, invalid status change, category in use).

## Auth
| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/login | public |
| GET | /api/auth/me | current user |
```json
// POST /api/auth/login
{ "email": "admin@example.com", "password": "secret-password" }
// 200
{ "token": "eyJhbGciOi...", "user": { "id": 1, "fullName": "Administrator", "email": "admin@example.com", "role": "ADMIN", "enabled": true } }
```

## Categories
| Method | Path | Notes |
|---|---|---|
| GET | /api/categories | with productCount |
| POST | /api/categories | 201 |
| PUT | /api/categories/{id} | |
| DELETE | /api/categories/{id} | ADMIN, 409 if products use it, 204 |
```json
// POST body            // response
{ "name": "Electronics", "description": "Gadgets" }
{ "id": 1, "name": "Electronics", "description": "Gadgets", "productCount": 0 }
```

## Products
| Method | Path | Notes |
|---|---|---|
| GET | /api/products | `q`, `categoryId`, `status` (IN/LOW/OUT), `page`, `size`, `sort` (name, category, price, stock), `dir` (asc/desc) |
| GET | /api/products/{id} | |
| POST | /api/products | 201; `stockQuantity` is the opening stock |
| PUT | /api/products/{id} | does not change stock |
| DELETE | /api/products/{id} | ADMIN, 409 if on an order, 204 |
```json
// POST body
{ "name": "Keyboard", "sku": "kb-1", "categoryId": 1, "description": null, "price": 1500, "stockQuantity": 10, "reorderThreshold": 5 }
// response
{ "id": 1, "name": "Keyboard", "sku": "KB-1", "categoryId": 1, "categoryName": "Electronics", "description": null,
  "price": 1500.00, "stockQuantity": 10, "reorderThreshold": 5, "status": "IN" }
// GET list response
{ "content": [ { "...": "product" } ], "page": 0, "size": 10, "totalElements": 1, "totalPages": 1 }
```

## Inventory
| Method | Path | Notes |
|---|---|---|
| POST | /api/inventory/products/{id}/adjust | 201; 409 if stock would go below 0 |
| GET | /api/inventory/movements | `productId`, `page`, `size`; newest first |
```json
// POST body
{ "type": "IN", "quantity": 20, "reason": "Restock received" }
// response
{ "id": 4, "productId": 2, "productName": "Mouse", "sku": "MS-1", "type": "IN", "quantity": 20,
  "quantityBefore": 3, "quantityAfter": 23, "reason": "Restock received", "createdAt": "2026-10-18T10:15:30Z" }
```

## Orders
| Method | Path | Notes |
|---|---|---|
| GET | /api/orders | `q` (customer name), `status`, `page`, `size` |
| GET | /api/orders/{id} | with items and status history |
| POST | /api/orders | 201; optional header `Idempotency-Key`; prices and totals are calculated by the server |
| PUT | /api/orders/{id}/status | 409 for a status change that is not allowed |

Allowed changes: PENDING to CONFIRMED or CANCELLED, CONFIRMED to SHIPPED or CANCELLED, SHIPPED to DELIVERED. Stock is deducted when the order is created and returned when it is cancelled. Order number is `ORD-` plus (1000 + id).
```json
// POST body
{ "customerName": "Test Customer", "customerPhone": null, "customerEmail": null, "items": [ { "productId": 1, "quantity": 2 } ] }
// response
{ "id": 1, "orderNumber": "ORD-1001", "customerName": "Test Customer", "customerPhone": null, "customerEmail": null,
  "status": "PENDING", "totalAmount": 3000.00, "createdAt": "2026-10-18T10:15:30Z",
  "items": [ { "productId": 1, "productName": "Keyboard", "sku": "KB-1", "unitPrice": 1500.00, "quantity": 2, "lineTotal": 3000.00 } ],
  "history": [ { "status": "PENDING", "changedAt": "2026-10-18T10:15:30Z" } ] }
// PUT /api/orders/1/status body
{ "status": "CONFIRMED" }
```

## Alerts and dashboard
| Method | Path | Notes |
|---|---|---|
| GET | /api/alerts?active=true | `false` returns resolved alerts |
| GET | /api/alerts/count | `{ "active": 1 }` |
| GET | /api/dashboard/summary | |
```json
{ "totalProducts": 2, "totalUnits": 33, "lowStock": 1, "outOfStock": 0, "pendingOrders": 1, "activeAlerts": 1 }
```

## Users (ADMIN only)
| Method | Path | Notes |
|---|---|---|
| GET | /api/users | |
| POST | /api/users | 201; password 8 to 72 characters |
| PUT | /api/users/{id} | `newPassword` optional; you cannot disable yourself or remove your own admin role |
```json
{ "fullName": "Staff Tester", "email": "staff@example.com", "password": "StaffPass123", "role": "STAFF" }
```
