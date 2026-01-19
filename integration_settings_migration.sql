-- Database migration for Integration Settings
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

-- Index for fast lookup by restaurant
CREATE INDEX IF NOT EXISTS idx_integration_settings_restaurant_id ON integration_settings(restaurant_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_integration_settings_timestamp
    BEFORE UPDATE ON integration_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_menus_updated_at();
