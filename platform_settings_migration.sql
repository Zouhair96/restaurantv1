-- Migration to create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO platform_settings (key, value)
VALUES 
    ('stripe_config', '{"commission_rate": 0.02, "currency": "eur"}'::jsonb),
    ('general_config', '{"platform_name": "YumYum", "contact_email": "admin@yumyum.com"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
