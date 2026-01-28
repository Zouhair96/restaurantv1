
// Mock promoUtils functions locally to match exactly what's in src/utils/promoUtils.js
const isPromoActive = (promo) => {
    if (!promo.isActive) return false;
    if (promo.schedule.alwaysActive) return true;
    const now = new Date();
    if (promo.schedule.startDate && new Date(promo.schedule.startDate) > now) return false;
    if (promo.schedule.endDate && new Date(promo.schedule.endDate) < now) return false;
    // recurring logic omitted for brevity as "alwaysActive" is the main focus
    return true;
};

const calculateDiscount = (promo, price) => {
    const numericPrice = parseFloat(price) || 0;
    const numericDiscountValue = parseFloat(promo.discountValue) || 0;

    if (promo.discountType === 'percentage') {
        return (numericPrice * numericDiscountValue) / 100;
    } else {
        return Math.min(numericDiscountValue, numericPrice);
    }
};

const calculateOrderDiscount = (promotions, orderTotal) => {
    const orderPromos = promotions.filter(promo =>
        isPromoActive(promo) && promo.scope.type === 'order'
    );

    if (orderPromos.length === 0) return { discount: 0, promo: null };

    let bestPromo = orderPromos[0];
    let bestDiscount = calculateDiscount(bestPromo, orderTotal);

    for (let i = 1; i < orderPromos.length; i++) {
        const discount = calculateDiscount(orderPromos[i], orderTotal);
        if (discount > bestDiscount) {
            bestDiscount = discount;
            bestPromo = orderPromos[i];
        }
    }

    return { discount: bestDiscount, promo: bestPromo };
};

// --- TEST CASE ---

// 1. Mock Promotion Data (Order Level - Percentage)
const orderPromo20Percent = {
    id: 'promo_1',
    name: 'Happy Hour',
    isActive: true,
    discountType: 'percentage',
    discountValue: '20', // String from input
    scope: { type: 'order' },
    schedule: { alwaysActive: true }
};

// 2. Mock Promotion Data (Order Level - Fixed)
const orderPromo5Dollars = {
    id: 'promo_2',
    name: 'Take 5',
    isActive: true,
    discountType: 'fixed',
    discountValue: 5,
    scope: { type: 'order' },
    schedule: { alwaysActive: true }
};

// 3. Mock Promotion Data (Inactive)
const inactivePromo = {
    id: 'promo_3',
    name: 'Inactive',
    isActive: false,
    discountType: 'percentage',
    discountValue: 50,
    scope: { type: 'order' },
    schedule: { alwaysActive: true }
};

const promotions = [orderPromo20Percent, orderPromo5Dollars, inactivePromo];

// Test 1: Subtotal $100 -> Should get 20% off ($20)
const result1 = calculateOrderDiscount(promotions, 100);
console.log('Test 1 ($100, Expect $20 discount):', result1.discount, result1.promo?.name);

// Test 2: Subtotal $10 -> Should get 20% off ($2) vs $5 off ($5). Winner is Take 5.
const result2 = calculateOrderDiscount(promotions, 10);
console.log('Test 2 ($10, Expect $5 discount):', result2.discount, result2.promo?.name);

// Test 3: Subtotal String "50.00" -> Should get 20% off ($10)
const result3 = calculateOrderDiscount(promotions, "50.00");
console.log('Test 3 ("50.00", Expect $10 discount):', result3.discount, result3.promo?.name);

// Test 4: Check math precision
// 12.99 subtotal. 20% is 2.598. Should be handled by display, but logic returns float.
const result4 = calculateOrderDiscount([orderPromo20Percent], 12.99);
console.log('Test 4 (12.99, Expect ~2.598):', result4.discount);

