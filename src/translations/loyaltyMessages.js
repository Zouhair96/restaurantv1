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
    SESSION_3_FINAL: 'SESSION_3_FINAL',
    SESSION_3_AFTER_ORDER: 'SESSION_3_AFTER_ORDER',
    LOYAL_INCOMPLETE_SPENDING: 'LOYAL_INCOMPLETE_SPENDING',
    LOYAL_ACTIVE: 'LOYAL_ACTIVE',
};

// ============================================================================
// LOYALTY MESSAGES - SINGLE SOURCE OF TRUTH
// ============================================================================
// All loyalty-related UI text MUST come from this map.
// NO hardcoded text is allowed in components or utils.
// ============================================================================

export const loyaltyMessages = {
    [LOYALTY_MESSAGE_KEYS.SESSION_1_BEFORE_ORDER]: {
        en: '👋 Welcome! Place your first order to start earning rewards.',
        fr: '👋 Bienvenue ! Passez votre première commande pour commencer à gagner des récompenses.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_1_AFTER_ORDER]: {
        en: '👋 Welcome! Enjoy your visit.',
        fr: '👋 Bienvenue ! Profitez de votre visite.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER]: {
        en: '🎉 Welcome back! You unlocked 10% OFF on this order.',
        fr: '🎉 Bon retour ! Vous avez débloqué 10 % de réduction sur cette commande.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_2_AFTER_ORDER]: {
        en: '👋 Welcome back! Enjoy your visit.',
        fr: '👋 Bon retour ! Profitez de votre visite.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_PROGRESS]: {
        en: '🔥 You\'re close! One more visit to unlock loyal rewards.',
        fr: '🔥 Vous y êtes presque ! Encore une visite pour débloquer les récompenses fidélité.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_FINAL]: {
        en: '🔥 Almost there! Final visit before loyal rewards unlock.',
        fr: '🔥 Presque fini ! Dernière visite avant de débloquer les récompenses fidélité.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_AFTER_ORDER]: {
        en: '✅ Session complete! Rewards will unlock on your next visit.',
        fr: '✅ Visite terminée ! Les récompenses se débloqueront lors de votre prochaine visite.',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_INCOMPLETE_SPENDING]: {
        en: '🔥 Final step! Spend a little more to unlock loyal rewards.',
        fr: '🔥 Dernière étape ! Dépensez encore un peu pour débloquer les récompenses fidélité.',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_ACTIVE]: {
        en: '⭐ Loyal Client — Enjoy 15% OFF on every order!',
        fr: '⭐ Client Fidèle — Profitez de 15 % de réduction sur chaque commande !',
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
