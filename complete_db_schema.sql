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
    role TEXT DEFAULT 'OWNER',         -- 'ADMIN', 'OWNER', 'STAFF'
    login_type TEXT DEFAULT 'EMAIL',   -- 'EMAIL', 'PIN'
    pin_hash TEXT,                     -- For STAFF login
    is_active BOOLEAN DEFAULT true,
    restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Links STAFF to OWNER

    restaurant_name TEXT,     -- "restaurant name"
    address TEXT,             -- "location/address"
    phone_number TEXT,        -- "phone number"
    
    -- Subscription fields
    subscription_plan TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP WITH TIME ZONE,

    -- Stripe Connect fields
    stripe_account_id TEXT,
    stripe_customer_id TEXT,
    stripe_payment_method_id TEXT,
    stripe_onboarding_complete BOOLEAN DEFAULT false,
    commission_rate DECIMAL(5, 4) DEFAULT 0.0200, -- Default 2%
    owed_commission_balance DECIMAL(12, 2) DEFAULT 0.00,

    -- Client Auth fields
    registered_at_restaurant_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Loyalty System Config
    loyalty_config JSONB DEFAULT '{"isAutoPromoOn": true, "recoveryConfig": {"type": "discount", "value": "20", "active": true, "delay": "21", "frequency": "30"}}',

    -- Order Numbering Config
    order_number_config JSONB DEFAULT '{"starting_number": 1, "current_number": 1, "reset_period": "never", "weekly_start_day": 1, "last_reset_date": null}',

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
    commission_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Per-Restaurant Order Number
    order_number INTEGER,
    
    -- Payment Details
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'pending_cash')),
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    
    -- Status Management
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled', 'out_for_delivery')),

    -- Driver Details
    driver_name TEXT,
    driver_phone TEXT,

    -- External Integrations
    external_id TEXT,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Loyalty and Promo Tracking
    loyalty_discount_applied BOOLEAN DEFAULT FALSE,
    loyalty_discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    loyalty_gift_item TEXT,

    -- Timestamps and Status Extensions
    accepted_at TIMESTAMP WITH TIME ZONE,
    is_auto_accepted BOOLEAN DEFAULT FALSE,
    commission_recorded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Visitor Events tracking (For Loyalty analytics)
CREATE TABLE IF NOT EXISTS visitor_events (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visitor_uuid TEXT NOT NULL,
    event_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Integrations and Platform Settings
CREATE TABLE IF NOT EXISTS integration_settings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    pos_provider VARCHAR(50) DEFAULT 'custom',
    pos_enabled BOOLEAN DEFAULT false,
    pos_webhook_url TEXT,
    pos_api_key TEXT,
    stock_provider VARCHAR(50) DEFAULT 'custom',
    stock_enabled BOOLEAN DEFAULT false,
    stock_sync_url TEXT,
    stock_api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template Management
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    template_key TEXT UNIQUE NOT NULL,
    icon TEXT,
    image_url TEXT,
    description TEXT,
    allowed_plans JSONB DEFAULT '[]',
    config JSONB DEFAULT '{}',
    base_layout TEXT DEFAULT 'grid',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant_templates (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
    subscription_tier TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, template_id)
);

CREATE TABLE IF NOT EXISTS template_items (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
    category TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_overrides (
    id SERIAL PRIMARY KEY,
    restaurant_template_id INTEGER REFERENCES restaurant_templates(id) ON DELETE CASCADE,
    restaurant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_item_id INTEGER REFERENCES template_items(id) ON DELETE CASCADE,
    name_override TEXT,
    description_override TEXT,
    price_override DECIMAL(10, 2),
    image_override TEXT,
    category_override TEXT,
    is_hidden BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, template_item_id)
);

-- Generated Menus
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up generic triggers for all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;
