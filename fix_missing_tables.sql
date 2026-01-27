-- COMPREHENSIVE FIX for "relation does not exist" and missing table errors
-- Run this in your Supabase SQL Editor or PostgreSQL tool

DO $$ 
BEGIN 
    -- 1. Platform Settings Table
    CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Templates Table
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

    -- 3. Restaurant Templates Table
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

    -- 4. Template Items Table
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

    -- 5. Item Overrides Table
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

    -- SEEDING DEFAULT DATA
    -- Default Platform Settings
    INSERT INTO platform_settings (key, value)
    VALUES 
        ('stripe_config', '{"commission_rate": 0.02, "currency": "eur"}'::jsonb),
        ('general_config', '{"platform_name": "YumYum", "contact_email": "admin@yumyum.com"}'::jsonb)
    ON CONFLICT (key) DO NOTHING;

    -- Default Templates
    INSERT INTO templates (name, template_key, icon, image_url, description, allowed_plans)
    VALUES (
        'Pizza Time', 
        'pizza1', 
        '🍕', 
        'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1000', 
        'Clean & Modern Pizza Display', 
        '["starter", "pro", "enterprise"]'
    )
    ON CONFLICT (template_key) DO NOTHING;

END $$;

-- 6. Generic Trigger Function for updated_at (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up generic triggers for all tables with updated_at column
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
