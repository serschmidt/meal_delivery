-- +goose Up
-- +goose StatementBegin

CREATE TABLE supplier_order_counters (
  supplier_id char(36) NOT NULL,
  last_order_number int NOT NULL DEFAULT 1000,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (supplier_id),
  CONSTRAINT fk_supplier_order_counters_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE orders
  ADD COLUMN supplier_order_number int NULL AFTER supplier_id,
  ADD UNIQUE KEY uk_orders_supplier_order_number (supplier_id, supplier_order_number),
  ADD KEY idx_orders_supplier_order_number (supplier_id, supplier_order_number);

INSERT INTO supplier_order_counters (supplier_id, last_order_number)
SELECT s.id, 1000
FROM suppliers s
LEFT JOIN supplier_order_counters soc ON soc.supplier_id = s.id
WHERE soc.supplier_id IS NULL;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

ALTER TABLE orders
  DROP INDEX uk_orders_supplier_order_number,
  DROP INDEX idx_orders_supplier_order_number,
  DROP COLUMN supplier_order_number;

DROP TABLE supplier_order_counters;

-- +goose StatementEnd