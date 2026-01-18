// Brand Configuration
export const brandConfig = {
    // Brand Identity
    name: 'Pizza Time',
    tagline: 'Authentique & Délicieux',

    // Colors
    colors: {
        primary: '#FF6B35',      // Orange
        secondary: '#F7931E',    // Golden Orange
        accent: '#E63946',       // Red
        success: '#06D6A0',      // Green
        warning: '#FFD23F',      // Yellow
        dark: '#1A1A2E',         // Dark Blue
        light: '#F8F9FE',        // Light Gray
    },

    // Gradients
    gradients: {
        primary: 'from-orange-500 to-red-500',
        secondary: 'from-yellow-400 via-orange-400 to-red-400',
        background: 'from-orange-50 via-white to-red-50',
        darkBackground: 'from-gray-900 via-gray-900 to-gray-800',
    },

    // Typography
    fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
    },

    // Logo
    logo: {
        emoji: '🍕',
        text: 'Pizza Time',
        showEmoji: true,
        showText: true,
    },

    // Contact
    contact: {
        phone: '+33 1 23 45 67 89',
        email: 'contact@pizzatime.fr',
        address: '123 Rue de la Pizza, 75001 Paris',
    },

    // Social Media
    social: {
        facebook: 'https://facebook.com/pizzatime',
        instagram: 'https://instagram.com/pizzatime',
        twitter: 'https://twitter.com/pizzatime',
    },

    // Business Hours
    hours: {
        monday: '11:00 - 22:00',
        tuesday: '11:00 - 22:00',
        wednesday: '11:00 - 22:00',
        thursday: '11:00 - 22:00',
        friday: '11:00 - 23:00',
        saturday: '11:00 - 23:00',
        sunday: '12:00 - 22:00',
    },
};

export default brandConfig;
