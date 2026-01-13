ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP;
