-- Orders Table Schema
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Order Details
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'take_out')),
    table_number TEXT,
    delivery_address TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'cash')),
    
    -- Order Items (stored as JSONB)
    items JSONB NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Status Management
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
