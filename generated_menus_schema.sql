-- Generated Menus Schema
-- This stores menus created from uploaded photos

-- Menus table
CREATE TABLE IF NOT EXISTS generated_menus (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    menu_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    original_photos TEXT[], -- Array of uploaded photo URLs
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items table
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_menus_user_id ON generated_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_menus_slug ON generated_menus(slug);
CREATE INDEX IF NOT EXISTS idx_generated_menu_items_menu_id ON generated_menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_generated_menu_items_category ON generated_menu_items(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_generated_menus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for generated_menus
CREATE TRIGGER update_generated_menus_timestamp
    BEFORE UPDATE ON generated_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_menus_updated_at();

-- Trigger for generated_menu_items
CREATE TRIGGER update_generated_menu_items_timestamp
    BEFORE UPDATE ON generated_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_menus_updated_at();
