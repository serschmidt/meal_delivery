-- +goose Up

CREATE TABLE `meals` (
  `id` binary(16) NOT NULL,
  `available` tinyint(1) NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `weekly_menus` (
  `id` binary(16) NOT NULL,
  `calendar_week` int NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_date` date NOT NULL,
  `image_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `weekly_menu_entries` (
  `id` binary(16) NOT NULL,
  `day_of_week` enum('FRIDAY','MONDAY','SATURDAY','SUNDAY','THURSDAY','TUESDAY','WEDNESDAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_date` date NOT NULL,
  `position` int DEFAULT NULL,
  `meal_id` binary(16) NOT NULL,
  `weekly_menu_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_weekly_menu_entries_meal` (`meal_id`),
  KEY `FK_weekly_menu_entries_menu` (`weekly_menu_id`),
  CONSTRAINT `FK_weekly_menu_entries_meal`
    FOREIGN KEY (`meal_id`) REFERENCES `meals` (`id`),
  CONSTRAINT `FK_weekly_menu_entries_menu`
    FOREIGN KEY (`weekly_menu_id`) REFERENCES `weekly_menus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `suppliers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `house_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_suppliers_email` (`email`),
  KEY `idx_suppliers_postal_code` (`postal_code`),
  KEY `idx_suppliers_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `supplier_referrals` (
  `id` binary(16) NOT NULL,
  `referrer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_referrals_supplier_id` (`supplier_id`),
  CONSTRAINT `FK_supplier_referrals_supplier`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `supplier_payment_details` (
  `id` binary(16) NOT NULL,
  `account_holder` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paypal_link` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_payment_supplier` (`supplier_id`),
  CONSTRAINT `FK_supplier_payment_supplier`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `addresses` (
  `id` binary(16) NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `house_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `street` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admins` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `house_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customers_postal_code` (`postal_code`),
  KEY `idx_customers_city` (`city`),
  KEY `idx_customers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `status` enum('CANCELLED','CONFIRMED','DELIVERED','PENDING','PREPARED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `billing_address_id` binary(16) NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivery_address_id` binary(16) NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weekly_menu_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_orders_billing_address` (`billing_address_id`),
  KEY `FK_orders_customer` (`customer_id`),
  KEY `FK_orders_delivery_address` (`delivery_address_id`),
  KEY `FK_orders_supplier` (`supplier_id`),
  KEY `FK_orders_weekly_menu` (`weekly_menu_id`),
  CONSTRAINT `FK_orders_billing_address`
    FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`),
  CONSTRAINT `FK_orders_delivery_address`
    FOREIGN KEY (`delivery_address_id`) REFERENCES `addresses` (`id`),
  CONSTRAINT `FK_orders_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `FK_orders_supplier`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `FK_orders_weekly_menu`
    FOREIGN KEY (`weekly_menu_id`) REFERENCES `weekly_menus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` binary(16) NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `order_id` binary(16) NOT NULL,
  `weekly_menu_entry_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_order_items_order` (`order_id`),
  KEY `FK_order_items_weekly_menu_entry` (`weekly_menu_entry_id`),
  CONSTRAINT `FK_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK_order_items_weekly_menu_entry`
    FOREIGN KEY (`weekly_menu_entry_id`) REFERENCES `weekly_menu_entries` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- +goose Down

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `supplier_payment_details`;
DROP TABLE IF EXISTS `supplier_referrals`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `weekly_menu_entries`;
DROP TABLE IF EXISTS `weekly_menus`;
DROP TABLE IF EXISTS `meals`;

