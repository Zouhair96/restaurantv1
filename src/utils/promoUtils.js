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
 * Calculate optional Loyalty/Recovery discount based on user status
 */
export const calculateLoyaltyDiscount = (loyaltyInfo, orderTotal, config = {}) => {
    // 1. Check if auto-promos are globally active
    if (!config.auto_promo_active && !config.loyalty_active && !config.isAutoPromoOn) return { discount: 0, reason: null };

    // CRITICAL: Extract config values FIRST to avoid TDZ errors
    const loyalOffer = config.loyalConfig || config.loyal_offer || { type: 'discount', value: '15', active: true, threshold: '50' };
    const welcomeOffer = config.welcomeConfig || { value: '10', active: true }; // Default 10%

    // 2. RECOVERY Status Logic (Temporarily overrides everything if eligible)
    if (loyaltyInfo.isRecoveryEligible || loyaltyInfo.status === 'RECOVERY') {
        const recoveryOffer = config.recoveryConfig || config.recovery_offer || { type: 'discount', value: '20' };

        if (recoveryOffer.type === 'discount') {
            const val = parseFloat(recoveryOffer.value) / 100;
            return {
                discount: orderTotal * val,
                messageKey: 'RECOVERY_DISCOUNT',
                messageVariables: { percentage: recoveryOffer.value }
            };
        }

        if (recoveryOffer.type === 'dish' || recoveryOffer.type === 'drink') {
            return {
                discount: 0,
                giftItem: recoveryOffer.value,
                messageKey: 'RECOVERY_GIFT',
                messageVariables: { item: recoveryOffer.value }
            };
        }
    }

    // 3. LOYAL Status Logic (REMOVED: Legacy status check that used stale localStorage)
    // Spending-based logic below now handles this correctly using server-synced data.

    // 4. STRICT SESSION-BASED LOGIC (Backend Flags Priority)

    // Check if we have the new backend flags
    if (typeof loyaltyInfo.isWelcomeDiscountEligible !== 'undefined') {
        const { isWelcomeDiscountEligible, hasPlacedOrderInCurrentSession, isLoyalDiscountActive, totalSpending } = loyaltyInfo;

        // --- CONDITION: SESSION 2 (WELCOME) ---
        if (isWelcomeDiscountEligible && !hasPlacedOrderInCurrentSession) {
            const discountPercentage = parseFloat(welcomeOffer.value) || 10;
            return {
                discount: orderTotal * (discountPercentage / 100),
                messageKey: LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER,
                messageVariables: { percentage: discountPercentage },
                welcomeTeaser: true,
                showProgress: false,
                needsMoreSpending: false
            };
        }

        // Fallback for Session 2 if order placed OR other sessions
        // If we are in Session 2 but placed order:
        // effectiveVisits would be 2.
        // We can fallback to the legacy logic for other states OR implement strict mapping here.
        // Let's integrate into the flow below but override checks.
    }

    const totalVisits = parseInt(loyaltyInfo.totalVisits) || 0;
    const ordersInSession = parseInt(loyaltyInfo.ordersInCurrentVisit || loyaltyInfo.ordersInCurrentSession) || 0;

    // effective_visits = total_banked_visits + 1 (The session the user is CURRENTLY in)
    const effectiveVisits = totalVisits + 1;

    console.log(`[Loyalty] Evaluator: totalVisits=${totalVisits}, ordersInSession=${ordersInSession}, effectiveVisits=${effectiveVisits}`);

    // 5. CUMULATIVE SPENDING PROGRESS LOGIC
    // Progress bar uses TOTAL cumulative spending across ALL sessions, not just current cart
    const totalSpending = parseFloat(loyaltyInfo.totalSpending) || 0;
    const thresholdAmount = parseFloat(loyalOffer.threshold) || 50;
    const cumulativeProgress = thresholdAmount > 0 ? (totalSpending / thresholdAmount) * 100 : 0;
    const isThresholdMet = totalSpending >= thresholdAmount;

    console.log(`[Loyalty] Spending: total=${totalSpending}, threshold=${thresholdAmount}, progress=${cumulativeProgress.toFixed(1)}%, met=${isThresholdMet}`);

    // --- CONDITION A: Session 4+ (LOYAL) ---
    if (effectiveVisits >= 4) {
        if (!isThresholdMet) {
            // Still showing progress bar because cumulative spending hasn't reached threshold
            return {
                discount: 0,
                messageKey: LOYALTY_MESSAGE_KEYS.LOYAL_INCOMPLETE_SPENDING,
                welcomeTeaser: false,
                showProgress: true,
                progressPercentage: Math.min(cumulativeProgress, 100),
                needsMoreSpending: true
            };
        }

        // Threshold met - unlock reward!
        if (loyalOffer.type === 'discount') {
            const discountPercentage = parseFloat(loyalOffer.value) || 15;
            return {
                discount: orderTotal * (discountPercentage / 100),
                messageKey: LOYALTY_MESSAGE_KEYS.LOYAL_DISCOUNT,
                messageVariables: { percentage: discountPercentage },
                welcomeTeaser: false,
                showProgress: false,
                isLoyal: true,
                needsMoreSpending: false
            };
        } else {
            return {
                discount: 0,
                giftItem: loyalOffer.value,
                messageKey: LOYALTY_MESSAGE_KEYS.LOYAL_GIFT,
                messageVariables: { item: loyalOffer.value },
                welcomeTeaser: false,
                showProgress: false,
                isLoyal: true,
                needsMoreSpending: false
            };
        }
    }


    // --- CONDITION B: Session 3 (IN_PROGRESS / FREQUENCY) ---
    if (effectiveVisits === 3) {
        if (ordersInSession > 0) {
            // Order already placed in Session 3
            return {
                discount: 0,
                messageKey: LOYALTY_MESSAGE_KEYS.SESSION_3_AFTER_ORDER,
                welcomeTeaser: true,
                showProgress: false,
                needsMoreSpending: false
            };
        }

        // First time in Session 3 - show cumulative progress bar
        return {
            discount: 0,
            messageKey: LOYALTY_MESSAGE_KEYS.SESSION_3_PROGRESS,
            welcomeTeaser: false,
            showProgress: true,
            progressPercentage: Math.min(cumulativeProgress, 100),
            needsMoreSpending: false
        };
    }

    // --- CONDITION C: Session 2 (WELCOME / VISIT 1) ---
    if (effectiveVisits === 2) {
        // Backend Flag Bypass: If we are here, surely isWelcomeDiscountEligible was false OR undefined
        // If it was false, it means they probably placed an order, so fallback here is okay.

        // Standard check
        const isEligible = ordersInSession === 0;
        const discountPercentage = parseFloat(welcomeOffer.value) || 10;

        if (isEligible) {
            // Redundant if backend flag caught it, but safe to keep
            return {
                discount: orderTotal * (discountPercentage / 100),
                messageKey: LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER,
                messageVariables: { percentage: discountPercentage },
                welcomeTeaser: true,
                showProgress: false,
                needsMoreSpending: false
            };
        } else {
            return {
                discount: 0,
                messageKey: LOYALTY_MESSAGE_KEYS.SESSION_2_AFTER_ORDER,
                welcomeTeaser: true,
                showProgress: false,
                needsMoreSpending: false
            };
        }
    }

    // --- CONDITION D: Session 1 (NEW) ---
    if (effectiveVisits === 1) {
        // STRICT: Backend source of truth
        if (typeof loyaltyInfo.hasPlacedOrderInCurrentSession !== 'undefined') {
            return {
                discount: 0,
                messageKey: loyaltyInfo.hasPlacedOrderInCurrentSession
                    ? LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER
                    : LOYALTY_MESSAGE_KEYS.SESSION_1_BEFORE_ORDER,
                welcomeTeaser: true,
                showProgress: false,
                needsMoreSpending: false
            };
        }

        // Fallback (Should not happen with new backend)
        return {
            discount: 0,
            messageKey: ordersInSession > 0
                ? LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER
                : LOYALTY_MESSAGE_KEYS.SESSION_1_BEFORE_ORDER,
            welcomeTeaser: true,
            showProgress: false,
            needsMoreSpending: false
        };
    }

    return {
        discount: 0,
        messageKey: LOYALTY_MESSAGE_KEYS.SESSION_1_BEFORE_ORDER, // Safe default
        welcomeTeaser: true,
        showProgress: false,
        needsMoreSpending: false
    };
};
