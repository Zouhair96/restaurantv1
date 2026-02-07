// Utility functions for promotion handling
import { LOYALTY_MESSAGE_KEYS } from '../translations/loyaltyMessages';

/**
 * Check if a promotion is currently active based on schedule
 */
export const isPromoActive = (promo) => {
    if (!promo.isActive) return false;

    // If "Always Active" is checked, ignore all other schedule constraints
    if (promo.schedule.alwaysActive) return true;

    const now = new Date();

    // Check date range
    if (promo.schedule.startDate && new Date(promo.schedule.startDate) > now) {
        return false;
    }
    if (promo.schedule.endDate && new Date(promo.schedule.endDate) < now) {
        return false;
    }

    // Check recurring schedule
    if (promo.schedule.recurring?.enabled) {
        const dayOfWeek = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Check if today is in the allowed days
        if (!promo.schedule.recurring.daysOfWeek.includes(dayOfWeek)) {
            return false;
        }

        // Check time range
        const [startHour, startMin] = promo.schedule.recurring.timeStart.split(':').map(Number);
        const [endHour, endMin] = promo.schedule.recurring.timeEnd.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (currentTime < startTime || currentTime > endTime) {
            return false;
        }
    }

    return true;
};

/**
 * Check if a promotion applies to a specific item
 */
export const doesPromoApplyToItem = (promo, item) => {
    if (!isPromoActive(promo)) return false;

    const { scope } = promo;
    const itemId = String(item.id);

    switch (scope.type) {
        case 'all':
            return true;

        case 'items':
            return scope.itemIds.some(id => String(id) === itemId);

        case 'categories':
            return scope.categories.includes(item.category) ||
                scope.categories.includes(item.category_en);

        case 'order':
            // Order-level promos don't apply to individual items
            return false;

        default:
            return false;
    }
};

/**
 * Calculate discount amount for an item
 */
export const calculateDiscount = (promo, price) => {
    const numericPrice = parseFloat(price) || 0;
    const numericDiscountValue = parseFloat(promo.discountValue) || 0;

    if (promo.discountType === 'percentage') {
        return (numericPrice * numericDiscountValue) / 100;
    } else {
        return Math.min(numericDiscountValue, numericPrice); // Don't discount more than the price
    }
};

/**
 * Get the best (biggest) discount for an item from multiple promotions
 */
export const getBestPromoForItem = (promotions, item) => {
    const applicablePromos = promotions.filter(promo => doesPromoApplyToItem(promo, item));

    if (applicablePromos.length === 0) return null;

    // Find promo with biggest discount
    let bestPromo = applicablePromos[0];
    let bestDiscount = calculateDiscount(bestPromo, item.price);

    for (let i = 1; i < applicablePromos.length; i++) {
        const discount = calculateDiscount(applicablePromos[i], item.price);
        if (discount > bestDiscount) {
            bestDiscount = discount;
            bestPromo = applicablePromos[i];
        }
    }

    return { promo: bestPromo, discount: bestDiscount };
};

/**
 * Calculate discounted price for an item
 */
export const getDiscountedPrice = (promotions, item) => {
    if (!item) return { originalPrice: 0, finalPrice: 0, discount: 0, promo: null };

    const bestPromo = getBestPromoForItem(promotions, item);
    const numericPrice = parseFloat(item.price) || 0;

    if (!bestPromo) {
        return { originalPrice: numericPrice, finalPrice: numericPrice, discount: 0, promo: null };
    }

    const finalPrice = numericPrice - bestPromo.discount;

    return {
        originalPrice: numericPrice,
        finalPrice: Math.max(0, finalPrice),
        discount: bestPromo.discount,
        promo: bestPromo.promo
    };
};

/**
 * Get active promotions by display style
 */
export const getPromosByDisplayStyle = (promotions, style) => {
    return promotions.filter(promo =>
        isPromoActive(promo) && promo.displayStyle === style
    );
};

/**
 * Calculate order-level discount
 */
export const calculateOrderDiscount = (promotions, orderTotal) => {
    const orderPromos = promotions.filter(promo =>
        isPromoActive(promo) && promo.scope.type === 'order'
    );

    if (orderPromos.length === 0) return { discount: 0, promo: null };

    // Find biggest order discount
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

/**
 * Get items that are covered by a specific promotion
 */
export const getPromoFilteredItems = (promo, allItems) => {
    if (!promo) return [];

    const { scope } = promo;

    switch (scope.type) {
        case 'all':
            return allItems;

        case 'items':
            const promoItemIds = scope.itemIds.map(String);
            return allItems.filter(item => promoItemIds.includes(String(item.id)));

        case 'categories':
            return allItems.filter(item =>
                scope.categories.includes(item.category) ||
                scope.categories.includes(item.category_en)
            );

        case 'order':
            return []; // Order promos apply to the total, not specific items

        default:
            return [];
    }
};
/**
 * Calculate optional Loyalty/Recovery discount based on PURE SERVER uiState
 */
export const calculateLoyaltyDiscount = (loyaltyInfo, orderTotal, configArg = {}, useReward = true) => {
    if (!loyaltyInfo) return { discount: 0 };

    // Authroritative config from server (loyaltyInfo.config) or the provided argument
    const config = { ...(loyaltyInfo.config || {}), ...configArg };

    // 1. Check if loyalty system is enabled
    if (!config.points_system_enabled && !config.loyalty_active && !config.isAutoPromoOn) return { discount: 0, reason: null };

    const { uiState = 'ACTIVE_EARNING', activeGifts = [], ordersInCurrentVisit = 0 } = loyaltyInfo;

    // --- CASE 1: GIFT_AVAILABLE (Deterministic) ---
    if (uiState === 'GIFT_AVAILABLE') {
        const isWelcomeGift = (parseInt(loyaltyInfo.totalCompletedOrders) || 0) === 1;
        // Use first active gift OR fallback to a default 10% welcome gift if array is empty but state says AVAILABLE
        const primaryGift = (activeGifts.length > 0) ? activeGifts[0] : { type: 'PERCENTAGE', percentage_value: 10 };

        if (primaryGift.type === 'PERCENTAGE') {
            const perc = parseFloat(primaryGift.percentage_value || 10);
            return {
                discount: useReward ? (orderTotal * (perc / 100)) : 0,
                messageKey: isWelcomeGift ? LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER : LOYALTY_MESSAGE_KEYS.LOYAL_DISCOUNT,
                messageVariables: { percentage: perc },
                isApplied: useReward,
                welcomeTeaser: true, // Show the bar for available gifts
                activeGifts: activeGifts.length > 0 ? activeGifts : [primaryGift]
            };
        } else if (primaryGift.type === 'FIXED_VALUE') {
            const val = parseFloat(primaryGift.euro_value || 0);
            if (val > 0) {
                return {
                    discount: useReward ? val : 0,
                    messageKey: LOYALTY_MESSAGE_KEYS.LOYAL_FIXED_DISCOUNT,
                    messageVariables: { value: val },
                    isApplied: useReward,
                    welcomeTeaser: true,
                    isLoyal: true,
                    activeGifts: activeGifts.length > 0 ? activeGifts : [primaryGift]
                };
            } else {
                return {
                    discount: 0,
                    giftItem: config.reward_value || "Special Item",
                    messageKey: LOYALTY_MESSAGE_KEYS.LOYAL_GIFT,
                    messageVariables: { item: config.reward_value || "Special Item" },
                    isApplied: useReward,
                    welcomeTeaser: true,
                    isLoyal: true,
                    activeGifts: activeGifts.length > 0 ? activeGifts : [primaryGift]
                };
            }
        }
    }

    // --- CASE 2: WELCOME (Deterministic: 0 completed orders) ---
    if (uiState === 'WELCOME') {
        return {
            discount: 0,
            messageKey: ordersInCurrentVisit > 0 ? LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER : LOYALTY_MESSAGE_KEYS.SESSION_1_BEFORE_ORDER,
            welcomeTeaser: true
        };
    }

    // --- CASE 3: POINTS_PROGRESS (Deterministic: Progressing towards threshold) ---
    if (uiState === 'POINTS_PROGRESS') {
        const threshold = parseFloat(config.loyalConfig?.threshold || 50);
        const spending = parseFloat(loyaltyInfo.totalSpending || 0);
        const progress = threshold > 0 ? Math.min((spending / threshold) * 100, 100) : 0;

        // Check if they are actually loyal (spending >= threshold) but in cooldown
        if (ordersInCurrentVisit > 0 && spending >= threshold) {
            return {
                discount: 0,
                messageKey: LOYALTY_MESSAGE_KEYS.SESSION_2_AFTER_ORDER, // "Enjoy your visit"
                showProgress: true,
                progressPercentage: progress
            };
        }

        return {
            discount: 0,
            messageKey: ordersInCurrentVisit > 0 ? LOYALTY_MESSAGE_KEYS.SESSION_3_AFTER_ORDER : LOYALTY_MESSAGE_KEYS.SESSION_3_PROGRESS,
            showProgress: true,
            progressPercentage: progress
        };
    }

    // --- CASE 4: ACTIVE_EARNING (Default Fallback / Post-Welcome Transition) ---
    return {
        discount: 0,
        messageKey: ordersInCurrentVisit > 0 ? LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER : LOYALTY_MESSAGE_KEYS.LOYAL_ACTIVE,
        welcomeTeaser: ordersInCurrentVisit > 0 // Persist teaser for "Enjoy your visit" message
    };
};
