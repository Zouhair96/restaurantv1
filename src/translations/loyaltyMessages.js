// ============================================================================
// LOYALTY MESSAGE KEYS - CANONICAL CONSTANTS
// ============================================================================
// These are the ONLY valid message keys in the system.
// DO NOT create keys dynamically or add new ones without updating this file.
// ============================================================================

export const LOYALTY_MESSAGE_KEYS = {
    SESSION_1_BEFORE_ORDER: 'SESSION_1_BEFORE_ORDER',
    SESSION_1_AFTER_ORDER: 'SESSION_1_AFTER_ORDER',
    SESSION_2_BEFORE_ORDER: 'SESSION_2_BEFORE_ORDER',
    SESSION_2_AFTER_ORDER: 'SESSION_2_AFTER_ORDER',
    SESSION_3_PROGRESS: 'SESSION_3_PROGRESS',
    SESSION_3_AFTER_ORDER: 'SESSION_3_AFTER_ORDER',
    SESSION_4_PROGRESS: 'SESSION_4_PROGRESS',
    LOYAL_DISCOUNT: 'LOYAL_DISCOUNT',
    LOYAL_GIFT: 'LOYAL_GIFT',
};

// ============================================================================
// LOYALTY MESSAGES - SINGLE SOURCE OF TRUTH
// ============================================================================
// All loyalty-related UI text MUST come from this map.
// NO hardcoded text is allowed in components or utils.
// ============================================================================

export const loyaltyMessages = {
    [LOYALTY_MESSAGE_KEYS.SESSION_1_BEFORE_ORDER]: {
        en: '👋 Welcome! Place your first order...',
        fr: '👋 Bienvenue ! Passez votre première commande...',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER]: {
        en: '👋 Welcome! Enjoy your visit.',
        fr: '👋 Bienvenue ! Profitez de votre visite.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER]: {
        en: '🎉 Welcome back! You unlocked 10% OFF',
        fr: '🎉 Bon retour ! Vous avez débloqué 10% de réduction',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_2_AFTER_ORDER]: {
        en: '👋 Welcome back! Enjoy your visit.',
        fr: '👋 Bon retour ! Profitez de votre visite.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_PROGRESS]: {
        en: '🔥 Keep going! You\'re building loyalty...',
        fr: '🔥 Continuez ! Vous construisez votre fidélité...',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_AFTER_ORDER]: {
        en: '✅ Great! Keep visiting to unlock rewards.',
        fr: '✅ Super ! Continuez à visiter pour débloquer des récompenses.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_4_PROGRESS]: {
        en: '🔥 Keep going! You\'re building loyalty...',
        fr: '🔥 Continuez ! Vous construisez votre fidélité...',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_DISCOUNT]: {
        en: '⭐ Loyal Client - Enjoy {percentage}% OFF',
        fr: '⭐ Client Fidèle - Profitez de {percentage}% de réduction',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_GIFT]: {
        en: '⭐ Loyal Client - Free {item}',
        fr: '⭐ Client Fidèle - {item} Gratuit',
    },
};

// ============================================================================
// HELPER FUNCTION - Message Resolver
// ============================================================================
// Use this to safely resolve messages with variable interpolation
// Returns null if key is invalid (NO FALLBACK TEXT ALLOWED)
// ============================================================================

export const getLoyaltyMessage = (messageKey, language = 'fr', variables = {}) => {
    if (!messageKey || !loyaltyMessages[messageKey]) {
        return null; // NO FALLBACK - UI must handle null gracefully
    }

    let message = loyaltyMessages[messageKey][language];

    if (!message) {
        return null; // NO FALLBACK - UI must handle null gracefully
    }

    // Replace variables like {percentage} or {item}
    Object.keys(variables).forEach(key => {
        message = message.replace(`{${key}}`, variables[key]);
    });

    return message;
};
