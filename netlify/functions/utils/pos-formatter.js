/**
 * Formats a raw order for POS integration.
 * Converts the complex selections object into a standardized items array.
 */
export const formatOrderForPOS = (order, selections) => {
    const items = [];

    // Add Base Item (Size)
    if (selections.size) {
        items.push({
            name: `Pizza (${selections.size.size})`,
            price: parseFloat(selections.size.price),
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

    return {
        ...order,
        items: items.length > 0 ? items : order.items // Fallback to original items if transformation yielded nothing
    };
};
