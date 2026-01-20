-- Migration: Add driver fields and update status check
-- 1. Add driver columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_phone TEXT;

-- 2. Update status constraint
-- Postgres requires dropping the constraint and re-adding it to change allowed values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled', 'out_for_delivery'));
