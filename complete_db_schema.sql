-- Complete Database Schema for Restaurant Application
-- Run this script to initialize or update your database

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'admin' or 'user'
    restaurant_name TEXT,     -- "restaurant name"
    address TEXT,             -- "location/address"
    phone_number TEXT,        -- "phone number"
    
    -- Subscription fields
    subscription_plan TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menus Table
CREATE TABLE IF NOT EXISTS menus (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
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

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
