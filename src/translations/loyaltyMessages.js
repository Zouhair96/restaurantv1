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
    LOYAL_DISCOUNT: 'LOYAL_DISCOUNT',
    LOYAL_GIFT: 'LOYAL_GIFT',
    LOYAL_INCOMPLETE_SPENDING: 'LOYAL_INCOMPLETE_SPENDING',
    LOYAL_FIXED_DISCOUNT: 'LOYAL_FIXED_DISCOUNT',
    LOYAL_TITLE: 'LOYAL_TITLE',
    POINTS_BADGE: 'POINTS_BADGE',
    POINTS_REMINDER: 'POINTS_REMINDER',
    GIFT_CONVERSION_CONFIRM: 'GIFT_CONVERSION_CONFIRM',
    REVERT_CONVERSION_CONFIRM: 'REVERT_CONVERSION_CONFIRM',
    GIFT_CONVERTED_POINTS: 'GIFT_CONVERTED_POINTS',
    LOYAL_REACHED_CONFIRMATION: 'LOYAL_REACHED_CONFIRMATION',
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
        en: '🎉 Enjoy your visit, your reward will be ready for your next visit.',
        fr: '🎉 Profitez de votre visite, votre cadeau sera prêt pour votre prochaine visite.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER]: {
        en: '🎉 You unlocked {percentage}% OFF on this order.',
        fr: '🎉 Vous avez débloqué {percentage} % de réduction sur cette commande.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_2_AFTER_ORDER]: {
        en: '🎉 Enjoy your visit!',
        fr: '🎉 Profitez de votre visite.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_PROGRESS]: {
        en: '🔥 You\'re getting closer to your reward!',
        fr: '🔥 Vous vous rapprochez de votre cadeau !',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_FINAL]: {
        en: '🔥 Almost there! Final visit before loyal rewards unlock.',
        fr: '🔥 Presque fini ! Dernière visite avant de débloquer les récompenses fidélité.',
    },
    [LOYALTY_MESSAGE_KEYS.SESSION_3_AFTER_ORDER]: {
        en: '🔥 Keep it up! Your progress is being tracked.',
        fr: '🔥 Continuez ainsi ! Vos points sont comptabilisés.',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_DISCOUNT]: {
        en: '⭐ Loyal Client — Enjoy {percentage}% OFF on this visit!',
        fr: '⭐ Client Fidèle — Profitez de {percentage}% de réduction sur cette visite !',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_GIFT]: {
        en: '⭐ Loyal Client — Get a free {item} on this visit!',
        fr: '⭐ Client Fidèle — On vous offre un {item} pour cette visite !',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_INCOMPLETE_SPENDING]: {
        en: '🔥 Final step! Spend a little more to unlock loyal rewards.',
        fr: '🔥 Dernière étape ! Dépensez encore un peu pour débloquer les récompenses fidélité.',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_ACTIVE]: {
        en: '⭐ Loyal Client — Enjoy special rewards on your visits!',
        fr: '⭐ Client Fidèle — Profitez de récompenses spéciales lors de vos visites !',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_FIXED_DISCOUNT]: {
        en: '⭐ Loyal Client — Enjoy {value}€ OFF on this visit!',
        fr: '⭐ Client Fidèle — Profitez de {value}€ de réduction sur cette visite !',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_TITLE]: {
        en: 'Loyal Client',
        fr: 'Client Fidèle',
    },
    [LOYALTY_MESSAGE_KEYS.POINTS_BADGE]: {
        en: '⭐ Your Points: {points}',
        fr: '⭐ Vos Points : {points}',
    },
    [LOYALTY_MESSAGE_KEYS.POINTS_REMINDER]: {
        en: '🎯 You have {points} points. Use them to unlock rewards.',
        fr: '🎯 Vous avez {points} points. Utilisez-les pour débloquer des récompenses.',
    },
    [LOYALTY_MESSAGE_KEYS.GIFT_CONVERSION_CONFIRM]: {
        en: 'Convert this gift to {points} points? This action is reversible.',
        fr: 'Convertir ce cadeau en {points} points ? Cette action est réversible.',
    },
    [LOYALTY_MESSAGE_KEYS.REVERT_CONVERSION_CONFIRM]: {
        en: 'Restore this gift? Your points will be reduced.',
        fr: 'Restaurer ce cadeau ? Vos points seront diminués.',
    },
    [LOYALTY_MESSAGE_KEYS.GIFT_CONVERTED_POINTS]: {
        en: '✨ Reward converted to {points} points!',
        fr: '✨ Récompense convertie en {points} points !',
    },
    [LOYALTY_MESSAGE_KEYS.LOYAL_REACHED_CONFIRMATION]: {
        en: '🎉 Enjoy your visit, your reward will be ready for your next visit.',
        fr: '🎉 Profitez de votre visite, votre cadeau sera prêt pour votre prochaine visite.',
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
