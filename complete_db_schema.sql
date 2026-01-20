-- Complete Database Schema for Restaurant Application
-- Run this script to initialize or update your database

-- Function to update updated_at timestamp (Must be defined first)
CREATE OR REPLACE FUNCTION update_generated_menus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

    -- Client Auth fields
    registered_at_restaurant_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled', 'out_for_delivery')),

    -- Driver Details
    driver_name TEXT,
    driver_phone TEXT,

    -- External Integrations
    external_id TEXT,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Integration Settings Table
CREATE TABLE IF NOT EXISTS integration_settings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- POS Settings
    pos_provider VARCHAR(50) DEFAULT 'custom',
    pos_enabled BOOLEAN DEFAULT false,
    pos_webhook_url TEXT,
    pos_api_key TEXT,
    
    -- Stock Settings
    stock_provider VARCHAR(50) DEFAULT 'custom',
    stock_enabled BOOLEAN DEFAULT false,
    stock_sync_url TEXT,
    stock_api_key TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated Menus Tables
CREATE TABLE IF NOT EXISTS generated_menus (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    menu_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    original_photos TEXT[],
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_menu_items (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES generated_menus(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    price_small DECIMAL(10,2),
    price_medium DECIMAL(10,2),
    price_large DECIMAL(10,2),
    image_url TEXT,
    badge VARCHAR(50),
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_integration_settings_restaurant_id ON integration_settings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_generated_menus_user_id ON generated_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_menus_slug ON generated_menus(slug);
CREATE INDEX IF NOT EXISTS idx_generated_menu_items_menu_id ON generated_menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_generated_menu_items_category ON generated_menu_items(category);

-- Triggers
-- Integration Settings Trigger
DROP TRIGGER IF EXISTS update_integration_settings_timestamp ON integration_settings;
CREATE TRIGGER update_integration_settings_timestamp
    BEFORE UPDATE ON integration_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_menus_updated_at();

-- Generated Menus Trigger
DROP TRIGGER IF EXISTS update_generated_menus_timestamp ON generated_menus;
CREATE TRIGGER update_generated_menus_timestamp
    BEFORE UPDATE ON generated_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_menus_updated_at();

-- Generated Menu Items Trigger
DROP TRIGGER IF EXISTS update_generated_menu_items_timestamp ON generated_menu_items;
CREATE TRIGGER update_generated_menu_items_timestamp
    BEFORE UPDATE ON generated_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_menus_updated_at();
