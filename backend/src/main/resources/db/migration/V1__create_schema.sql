-- Smart Inventory & Order Management: initial schema (MySQL 8, InnoDB, utf8mb4).
-- Default utf8mb4 collation is case-insensitive, so UNIQUE on name/sku/email ignores letter case.

CREATE TABLE roles (
  id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  CONSTRAINT uk_roles_name UNIQUE (name),
  CONSTRAINT ck_roles_name CHECK (name IN ('ADMIN', 'STAFF'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  enabled       TINYINT(1)   NOT NULL DEFAULT 1,
  CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  KEY idx_user_roles_role (role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  CONSTRAINT uk_categories_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(150) NOT NULL,
  sku               VARCHAR(50)  NOT NULL,
  category_id       BIGINT       NOT NULL,
  description       VARCHAR(500) NULL,
  price             DECIMAL(12,2) NOT NULL,
  stock_quantity    INT          NOT NULL,
  reorder_threshold INT          NOT NULL,
  version           BIGINT       NOT NULL DEFAULT 0,
  CONSTRAINT uk_products_sku UNIQUE (sku),
  KEY idx_products_name (name),
  KEY idx_products_category (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT ck_products_price CHECK (price > 0),
  CONSTRAINT ck_products_stock CHECK (stock_quantity >= 0),
  CONSTRAINT ck_products_threshold CHECK (reorder_threshold >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stock_movements (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id      BIGINT       NOT NULL,
  type            VARCHAR(10)  NOT NULL,
  quantity        INT          NOT NULL,
  quantity_before INT          NOT NULL,
  quantity_after  INT          NOT NULL,
  reason          VARCHAR(255) NOT NULL,
  created_at      DATETIME(6)  NOT NULL,
  KEY idx_movements_product (product_id),
  KEY idx_movements_created (created_at),
  CONSTRAINT fk_movements_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT ck_movements_type CHECK (type IN ('IN', 'OUT')),
  CONSTRAINT ck_movements_qty CHECK (quantity > 0),
  CONSTRAINT ck_movements_before CHECK (quantity_before >= 0),
  CONSTRAINT ck_movements_after CHECK (quantity_after >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- active_product_id holds the product id while an alert is open and is NULL once resolved.
-- MySQL allows many NULLs in a UNIQUE index, so this permits one open alert per product and any number of resolved ones.
CREATE TABLE low_stock_alerts (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id        BIGINT      NOT NULL,
  kind              VARCHAR(10) NOT NULL,
  stock_quantity    INT         NOT NULL,
  threshold         INT         NOT NULL,
  created_at        DATETIME(6) NOT NULL,
  resolved_at       DATETIME(6) NULL,
  active_product_id BIGINT      NULL,
  CONSTRAINT uk_alerts_active UNIQUE (active_product_id),
  KEY idx_alerts_product (product_id),
  CONSTRAINT fk_alerts_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT ck_alerts_kind CHECK (kind IN ('LOW', 'OUT')),
  CONSTRAINT ck_alerts_open CHECK ((active_product_id IS NOT NULL AND resolved_at IS NULL)
                                OR (active_product_id IS NULL AND resolved_at IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer details are a snapshot of who placed the order (no separate customers table yet).
CREATE TABLE orders (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_name   VARCHAR(150) NOT NULL,
  customer_phone  VARCHAR(30)  NULL,
  customer_email  VARCHAR(150) NULL,
  status          VARCHAR(20)  NOT NULL,
  total_amount    DECIMAL(12,2) NOT NULL,
  created_at      DATETIME(6)  NOT NULL,
  idempotency_key VARCHAR(64)  NULL,
  version         BIGINT       NOT NULL DEFAULT 0,
  CONSTRAINT uk_orders_idempotency UNIQUE (idempotency_key),
  KEY idx_orders_status (status),
  KEY idx_orders_created (created_at),
  CONSTRAINT ck_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  CONSTRAINT ck_orders_total CHECK (total_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- product_name, sku and unit_price are historical snapshots: later product edits never change old orders.
CREATE TABLE order_items (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT       NOT NULL,
  product_id   BIGINT       NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  sku          VARCHAR(50)  NOT NULL,
  unit_price   DECIMAL(12,2) NOT NULL,
  quantity     INT          NOT NULL,
  line_total   DECIMAL(12,2) NOT NULL,
  CONSTRAINT uk_items_order_product UNIQUE (order_id, product_id),
  KEY idx_items_product (product_id),
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT ck_items_qty CHECK (quantity > 0),
  CONSTRAINT ck_items_price CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_status_history (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id   BIGINT      NOT NULL,
  status     VARCHAR(20) NOT NULL,
  changed_at DATETIME(6) NOT NULL,
  KEY idx_history_order (order_id),
  CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT ck_history_status CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
