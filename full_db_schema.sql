-- Complete Schema for 'users' table

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    restaurant_name TEXT,     -- "restaurant name"
    address TEXT,             -- "location/address"
    phone_number TEXT,        -- "phone number"
    
    -- Subscription fields (from previous updates)
    subscription_plan TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_start_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
