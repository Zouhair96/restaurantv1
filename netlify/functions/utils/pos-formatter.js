/**
 * Formats a raw order for POS integration.
 * Converts the complex selections object into a standardized items array.
 */
export const formatOrderForPOS = (order, selections) => {
    const items = [];

    // Add Base Item (Size)
    if (selections.size) {
        const sizeName = typeof selections.size === 'string' ? selections.size : (selections.size.size || 'Standard');
        const sizePrice = typeof selections.size === 'object' ? parseFloat(selections.size.price || 0) : 0;

        items.push({
            name: `Pizza (${sizeName})`,
            price: sizePrice,
            quantity: 1,
            type: 'main'
        });
    }

    // Add Chicken/Protein
    if (selections.chicken && selections.chicken.length > 0) {
        selections.chicken.forEach(c => {
            items.push({
                name: `├─ ${c}`,
                price: 0,
                quantity: 1,
                type: 'modifier'
            });
        });
    }

    // Add Fries info
    if (selections.friesType && selections.friesType !== 'sans') {
        items.push({
            name: `├─ Fries: ${selections.friesType} (${selections.friesPlacement || 'standard'})`,
            price: 0,
            quantity: 1,
            type: 'modifier'
        });
    }

    // Add Sauces
    if (selections.sauce && selections.sauce.length > 0) {
        selections.sauce.forEach(s => {
            items.push({
                name: `├─ Sauce: ${s}`,
                price: 0,
                quantity: 1,
                type: 'modifier'
            });
        });
    }

    // Add Drink
    if (selections.drink) {
        items.push({
            name: `├─ Drink: ${selections.drink}`,
            price: 0,
            quantity: 1,
            type: 'modifier'
        });
    }

    // Add Extras
    if (selections.extras && selections.extras.length > 0) {
        selections.extras.forEach(e => {
            items.push({
                name: `├─ Extra: ${e}`,
                price: 0, // In this template extras are usually included or priced in size, adjust if needed
                quantity: 1,
                type: 'modifier'
            });
        });
    }

    // Fallback: If no structured items were added, or to ensure everything is included
    if (items.length === 1 && items[0].type === 'main') {
        // Just the pizza was added, let's make sure we didn't miss anything
        // This is a safety check
    }

    return {
        ...order,
        items: items.length > 0 ? items : [{ name: "Order Items", details: selections }]
    };
};
