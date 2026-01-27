import React, { createContext, useContext, useState } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('fr'); // Default to French

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
    };

    // Helper to get nested translation keys 'header.title'
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (let k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    // Helper to localize dynamic item fields (name, description, category)
    const localize = (item, field) => {
        if (!item) return '';
        if (language === 'en') {
            const enField = `${field}_en`;
            return item[enField] || item[field]; // Fallback to primary if EN missing
        }
        return item[field]; // Primary is FR
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t, localize }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
