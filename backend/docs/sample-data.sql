-- OPTIONAL development data. Run once, after the app has started at least once and created the schema.
-- Stock is entered as "Opening stock" movements and open alerts are created, so the data follows the same rules as real use.
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Computing and audio gear'),
  ('Accessories', 'Cables, stands and cases'),
  ('Stationery', 'Paper and writing supplies');

INSERT INTO products (name, sku, category_id, description, price, stock_quantity, reorder_threshold) VALUES
  ('Wireless Keyboard', 'KB-204', (SELECT id FROM categories WHERE name = 'Electronics'), 'Compact 2.4 GHz keyboard', 1499.00, 4, 15),
  ('Optical Mouse', 'MS-118', (SELECT id FROM categories WHERE name = 'Electronics'), 'USB wired mouse', 599.00, 0, 20),
  ('27" Monitor', 'MN-270', (SELECT id FROM categories WHERE name = 'Electronics'), NULL, 14999.00, 18, 5),
  ('Webcam 1080p', 'WC-108', (SELECT id FROM categories WHERE name = 'Electronics'), NULL, 2499.00, 31, 8),
  ('USB-C Cable 1m', 'CB-410', (SELECT id FROM categories WHERE name = 'Accessories'), NULL, 299.00, 120, 30),
  ('Laptop Sleeve 15"', 'LS-150', (SELECT id FROM categories WHERE name = 'Accessories'), NULL, 799.00, 42, 10),
  ('A5 Notebook (pack of 10)', 'NB-032', (SELECT id FROM categories WHERE name = 'Stationery'), NULL, 450.00, 9, 25),
  ('Gel Pen (box of 12)', 'GP-012', (SELECT id FROM categories WHERE name = 'Stationery'), NULL, 240.00, 200, 40);

INSERT INTO stock_movements (product_id, type, quantity, quantity_before, quantity_after, reason, created_at)
  SELECT id, 'IN', stock_quantity, 0, stock_quantity, 'Opening stock', NOW(6) FROM products WHERE stock_quantity > 0;

INSERT INTO low_stock_alerts (product_id, kind, stock_quantity, threshold, created_at, active_product_id)
  SELECT id, IF(stock_quantity = 0, 'OUT', 'LOW'), stock_quantity, reorder_threshold, NOW(6), id
  FROM products WHERE stock_quantity <= reorder_threshold;
