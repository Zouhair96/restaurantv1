-- Add Menu Items for PizzaFun Template
-- This script populates the template_items table so items appear in the dashboard

DO $$
DECLARE
    v_template_id INTEGER;
BEGIN
    -- Get the ID of the PizzaFun template
    SELECT id INTO v_template_id FROM templates WHERE template_key = 'pizzaFun';

    -- If template exists, verify and insert items
    IF v_template_id IS NOT NULL THEN
        
        -- Delete existing items to avoid duplicates if re-running
        DELETE FROM template_items WHERE template_id = v_template_id;

        -- Insert Items
        INSERT INTO template_items (template_id, name, description, price, image_url, category, sort_order, is_available, is_deleted)
        VALUES 
            -- Classic Pizzas
            (v_template_id, 'Marinara DOP', 'Blended San Marzano tomatoes, piennolo tomato, oregano, garlic', 9.90, '/pizzas/sicilienne.png', 'Classic', 1, true, false),
            (v_template_id, 'Margherita', 'Blended San Marzano tomatoes, fior di latte, basil, pecorino gran cru', 10.90, '/pizzas/chevre.png', 'Classic', 2, true, false),
            (v_template_id, 'Funghi', 'Blended San Marzano tomatoes, fior di latte, mushrooms, basil, pecorino', 11.90, '/pizzas/calzone.png', 'Classic', 3, true, false),
            (v_template_id, 'Diavola', 'Blended San Marzano tomatoes, fior di latte, Calabrese soppressata, basil', 13.90, '/pizzas/mexicaine.png', 'Classic', 4, true, false),
            (v_template_id, 'Sicilienne', 'Sauce tomate, fromage, poivron, oignons, olives, anchois', 11.90, '/pizzas/sicilienne.png', 'Classic', 5, true, false),
            (v_template_id, 'Calzone', 'Sauce tomate, fromage, jambon, champignons, olives, œuf', 11.90, '/pizzas/calzone.png', 'Classic', 6, true, false),
            (v_template_id, 'Pêcheur', 'Sauce tomate, fromage, thon, saumon, olives, oignon', 12.90, '/pizzas/pecheur.png', 'Classic', 7, true, false),
            (v_template_id, '4 Fromages', 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', 12.90, '/pizzas/4fromages.png', 'Classic', 8, true, false),
            (v_template_id, 'Mexicaine', 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', 14.90, '/pizzas/mexicaine.png', 'Classic', 9, true, false),

            -- Premium Pizzas
            (v_template_id, 'Bufalaina', 'Blended San Marzano tomatoes, mozzarella di bufala, basil, pecorino gran cru', 13.90, '/pizzas/4fromages.png', 'Premium', 10, true, false),
            (v_template_id, 'Salsiccia', 'Blended San Marzano tomatoes, fior di latte, sausage, basil, pecorino gran cru', 13.90, '/pizzas/mexicaine.png', 'Premium', 11, true, false),
            (v_template_id, 'Funghi e Salsiccia', 'Blended San Marzano tomatoes, fior di latte, mushrooms, sausage, basil, pecorino gran cru', 14.90, '/pizzas/calzone.png', 'Premium', 12, true, false),
            (v_template_id, 'Chèvre', 'Crème fraîche, fromage, chèvre, olives, oignon', 13.90, '/pizzas/chevre.png', 'Premium', 13, true, false),
            (v_template_id, 'Chicken', 'Crème fraîche, fromage, poulet fumé, champignons', 13.90, '/pizzas/4fromages.png', 'Premium', 14, true, false),

            -- Special Pizzas
            (v_template_id, 'Puttanesca', 'Blended San Marzano tomatoes, fior di latte, anchovies, black olives, capers, tomatoes, parmigiano reggiano', 12.90, '/pizzas/sicilienne.png', 'Special', 15, true, false),
            (v_template_id, 'Capricciosa', 'Blended San Marzano tomatoes, fior di latte, prosciutto cotto, mushrooms, black olives, artichokes', 14.90, '/pizzas/pecheur.png', 'Special', 16, true, false),
            (v_template_id, 'Bolognaise', 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', 17.90, '/pizzas/mexicaine.png', 'Special', 17, true, false),

            -- Drinks & Desserts
            (v_template_id, 'Coca-Cola', '33cl can chilled', 2.50, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop', 'Drinks', 18, true, false),
            (v_template_id, 'Tiramisu', 'Homemade italian classic', 5.90, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop', 'Desserts', 19, true, false);
            
    ELSE
        RAISE NOTICE 'Template PizzaFun not found. Please run add_pizzafun_template.sql first.';
    END IF;
END $$;
