-- Add PizzaFun Template to Database
-- Run this SQL script in your database to make the pizzaFun template appear in /dashboard/menu

INSERT INTO templates (
    name, 
    template_key, 
    icon, 
    allowed_plans, 
    config, 
    base_layout, 
    status, 
    created_at, 
    updated_at,
    description
)
VALUES (
    'Pizza Fun',                                                    -- Template display name
    'pizzaFun',                                                     -- Template key (matches component routing)
    '🎉',                                                           -- Fun emoji icon
    '["free", "starter", "pro", "enterprise"]'::jsonb,             -- Available for all plans
    '{}'::jsonb,                                                    -- Default empty config
    'grid',                                                         -- Base layout type
    'active',                                                       -- Status
    NOW(),                                                          -- Created timestamp
    NOW(),                                                          -- Updated timestamp
    'Fun and playful pizza menu with vibrant gradients and animations'  -- Description
)
ON CONFLICT (template_key) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    allowed_plans = EXCLUDED.allowed_plans,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Verify the template was added
SELECT id, name, template_key, icon, status, allowed_plans 
FROM templates 
WHERE template_key = 'pizzaFun';
