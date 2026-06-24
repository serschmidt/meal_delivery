ALTER TABLE `suppliers`
    ADD COLUMN `first_name` VARCHAR(120) NULL AFTER `id`,
    ADD COLUMN `last_name` VARCHAR(120) NULL AFTER `first_name`,
    ADD COLUMN `full_name` VARCHAR(255) NULL AFTER `last_name`,
    ADD COLUMN `business_name` VARCHAR(255) NULL AFTER `full_name`,
    ADD COLUMN `website` VARCHAR(255) NULL AFTER `phone`;