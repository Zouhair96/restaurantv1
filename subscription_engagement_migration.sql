-- Migration to add subscription engagement end date
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Initialize existing active subscriptions to 1 year engagement if end date is null
UPDATE users 
SET subscription_end_date = subscription_start_date + INTERVAL '1 year'
WHERE subscription_status = 'active' AND subscription_end_date IS NULL;
