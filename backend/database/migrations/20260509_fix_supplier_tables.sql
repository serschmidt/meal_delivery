-- supplier_payment_details korrigieren:
-- supplier_id soll CHAR(36) sein und auf suppliers(id) zeigen

ALTER TABLE `supplier_payment_details`
  DROP FOREIGN KEY `FKo4mane77w9y4lyshkwxv0bvxa`;

ALTER TABLE `supplier_payment_details`
  MODIFY COLUMN `supplier_id` CHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `supplier_payment_details`
  DROP INDEX `UKrox3gqhyxmv5083dkm1g6jh4n`;

ALTER TABLE `supplier_payment_details`
  ADD UNIQUE KEY `uk_supplier_payment_supplier` (`supplier_id`);

ALTER TABLE `supplier_payment_details`
  ADD CONSTRAINT `FK_supplier_payment_supplier`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

-- supplier_referrals anlegen, falls noch nicht vorhanden

CREATE TABLE IF NOT EXISTS `supplier_referrals` (
  `id` binary(16) NOT NULL,
  `referrer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_referrals_supplier_id` (`supplier_id`),
  CONSTRAINT `FK_supplier_referrals_supplier`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;