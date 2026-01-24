-- Migration: Remove POS Tables
DROP TABLE IF EXISTS integration_settings CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;

-- Drop trigger function if no longer needed (check if used elsewhere)
-- DROP FUNCTION IF EXISTS update_generated_menus_updated_at; 
-- (Keeping the function as it might be used by other triggers)

-- Remove POS columns from orders if any (checking schema first)
ALTER TABLE orders DROP COLUMN IF EXISTS external_id;
-- checkout_session_id is keeping for Stripe so we don't drop that.
