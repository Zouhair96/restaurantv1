-- Migration: Optimize Loyalty Performance for High Traffic
-- This ensures that lookups for loyalty status and order history stay fast even with thousands of visitors.

-- 1. Index for fast visitor lookup
CREATE INDEX IF NOT EXISTS idx_loyalty_visitors_v2 
ON loyalty_visitors (restaurant_id, device_id);

-- 2. Index for fast status finalization (checking previous completed orders)
CREATE INDEX IF NOT EXISTS idx_orders_loyalty_lookup
ON orders (restaurant_id, loyalty_id, status, created_at);

-- 3. Index for recovery offer logic
CREATE INDEX IF NOT EXISTS idx_loyalty_visitors_recovery
ON loyalty_visitors (restaurant_id, last_session_at);
