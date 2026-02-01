// Utility functions for promotion handling

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
 * Calculate optional Loyalty/Recovery discount based on user status
 */
export const calculateLoyaltyDiscount = (loyaltyInfo, orderTotal, config = {}) => {
    // 1. Check if auto-promos are globally active
    if (!config.auto_promo_active && !config.loyalty_active && !config.isAutoPromoOn) return { discount: 0, reason: null };

    // 2. RECOVERY Status Logic (Temporarily overrides everything if eligible)
    if (loyaltyInfo.isRecoveryEligible || loyaltyInfo.status === 'RECOVERY') {
        const recoveryOffer = config.recoveryConfig || config.recovery_offer || { type: 'discount', value: '20' };

        if (recoveryOffer.type === 'discount') {
            const val = parseFloat(recoveryOffer.value) / 100;
            return {
                discount: orderTotal * val,
                reason: `Recovery Offer (${recoveryOffer.value}%)`
            };
        }

        if (recoveryOffer.type === 'dish' || recoveryOffer.type === 'drink') {
            return {
                discount: 0,
                giftItem: recoveryOffer.value,
                reason: `Recovery Special: ${recoveryOffer.value}`
            };
        }
    }

    // 3. LOYAL Status Logic (REMOVED: Legacy status check that used stale localStorage)
    // Spending-based logic below now handles this correctly using server-synced data.

    // 4. STRICT SESSION-BASED LOGIC
    const totalVisits = (loyaltyInfo.totalVisits !== undefined) ? parseInt(loyaltyInfo.totalVisits) : 0;
    const totalSpending = parseFloat(loyaltyInfo.totalSpending) || 0;

    // Get Reward Config
    const loyalOffer = config.loyalConfig || config.loyal_offer || { type: 'discount', value: '15', active: true, threshold: '50' };
    const thresholdVal = parseFloat(loyalOffer.threshold || config.threshold) || 50;
    const welcomeOffer = config.welcomeConfig || { value: '10', active: true }; // Default 10%

    console.log(`[Loyalty] Evaluator: visits=${totalVisits}, spend=${totalSpending}`);

    // --- CONDITION A: Session 4+ (LOYAL) ---
    if (totalVisits >= 3) {
        if (loyalOffer.type === 'discount') {
            const discountPercentage = parseFloat(loyalOffer.value) || 15;
            return {
                discount: orderTotal * (discountPercentage / 100),
                reason: `Loyal Customer Reward (${discountPercentage}%)`,
                welcomeTeaser: false,
                showProgress: false,
                progressPercentage: 100,
                needsMoreSpending: false
            };
        } else if (['item', 'gift', 'dish', 'drink'].includes(loyalOffer.type)) {
            return {
                discount: 0,
                giftItem: loyalOffer.value,
                reason: `Loyal Customer Gift: ${loyalOffer.value}`,
                welcomeTeaser: false,
                showProgress: false,
                progressPercentage: 100,
                needsMoreSpending: false
            };
        }
    }

    // --- CONDITION B: Session 2 (WELCOME) ---
    if (totalVisits === 1) {
        const discountPercentage = parseFloat(welcomeOffer.value) || 10;
        return {
            discount: orderTotal * (discountPercentage / 100),
            reason: `Welcome Back! (${discountPercentage}% Off)`,
            welcomeTeaser: false,
            showProgress: true,
            progressPercentage: Math.min((totalSpending / thresholdVal) * 100, 100),
            needsMoreSpending: false
        };
    }

    // --- CONDITION C: Session 3 (IN_PROGRESS) ---
    if (totalVisits === 2) {
        return {
            discount: 0,
            reason: null,
            welcomeTeaser: false,
            showProgress: true,
            progressPercentage: Math.min((totalSpending / thresholdVal) * 100, 100),
            progressMessage: "You're getting closer! Final session before Loyal Rewards!",
            needsMoreSpending: true
        };
    }

    // --- CONDITION D: Session 1 (NEW) ---
    // Show Teaser
    const teaserDiscount = parseFloat(welcomeOffer.value) || 10;
    return {
        discount: 0,
        reason: null,
        welcomeTeaser: true,
        teaserMessage: `Order now to unlock ${teaserDiscount}% OFF your next visit!`,
        showProgress: true,
        progressPercentage: Math.min((totalSpending / thresholdVal) * 100, 100),
        needsMoreSpending: true
    };
};
