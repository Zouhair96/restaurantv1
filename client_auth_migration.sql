-- Migration to support Public Menu Client Authentication

-- Add registered_at_restaurant_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_at_restaurant_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add customer_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Index for client-restaurant linkage
CREATE INDEX IF NOT EXISTS idx_users_registered_at_restaurant ON users(registered_at_restaurant_id);

-- Index for customer orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
