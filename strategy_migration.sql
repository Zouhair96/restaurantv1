-- Migration for Unified Restaurant Strategy

-- Update Users Table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='stripe_payment_method_id') THEN
        ALTER TABLE users ADD COLUMN stripe_payment_method_id TEXT;
    END IF;
END $$;

-- Update Orders Table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='accepted_at') THEN
        ALTER TABLE orders ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='is_auto_accepted') THEN
        ALTER TABLE orders ADD COLUMN is_auto_accepted BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='commission_recorded') THEN
        ALTER TABLE orders ADD COLUMN commission_recorded BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
