-- Migration to add Stripe and Commission tracking fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 4) DEFAULT 0.0200;
ALTER TABLE users ADD COLUMN IF NOT EXISTS owed_commission_balance DECIMAL(12, 2) DEFAULT 0.00;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Update constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'pending_cash'));
    END IF;
END $$;
