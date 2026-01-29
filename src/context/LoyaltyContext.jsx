import React, { createContext, useContext, useState, useEffect } from 'react';

const LoyaltyContext = createContext();

export const LoyaltyProvider = ({ children }) => {
    const [clientId, setClientId] = useState(null);
    const [loyaltyData, setLoyaltyData] = useState({}); // { [restaurantId]: { visits: [], lastOfferType: null } }

    useEffect(() => {
        // 1. Identification (Device-based)
        let id = localStorage.getItem('loyalty_client_id');
        if (!id) {
            id = typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('loyalty_client_id', id);
        }
        setClientId(id);

        // 2. Load Existing Data
        const savedData = localStorage.getItem('loyalty_data');
        if (savedData) {
            setLoyaltyData(JSON.parse(savedData));
        }
    }, []);

    const trackVisit = (restaurantId) => {
        if (!restaurantId) return;

        const now = Date.now();
        const updatedData = { ...loyaltyData };

        if (!updatedData[restaurantId]) {
            updatedData[restaurantId] = { visits: [], lastOfferType: 'NEW' };
        }

        const restaurantLog = updatedData[restaurantId];

        // Only record one visit per 'session' (e.g., once every 4 hours) 
        // to prevent rapid-refresh spoofing, or per day as per business logic.
        const lastVisit = restaurantLog.visits[restaurantLog.visits.length - 1];
        const FOUR_HOURS = 4 * 60 * 60 * 1000;

        if (!lastVisit || (now - lastVisit > FOUR_HOURS)) {
            restaurantLog.visits.push(now);
        }

        // Cleanup: Remove visits older than 30 days
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        restaurantLog.visits = restaurantLog.visits.filter(v => now - v < THIRTY_DAYS);

        // Determine Status
        let status = 'SOFT';
        if (restaurantLog.visits.length === 1) {
            status = 'NEW';
        } else if (restaurantLog.visits.length >= 4) {
            status = 'LOYAL';
        }

        restaurantLog.lastOfferType = status;

        setLoyaltyData(updatedData);
        localStorage.setItem('loyalty_data', JSON.stringify(updatedData));

        return status;
    };

    const getStatus = (restaurantId) => {
        const log = loyaltyData[restaurantId];
        if (!log) return { status: 'NEW', totalVisits: 0 };

        return {
            status: log.lastOfferType,
            totalVisits: log.visits.length,
            visits: log.visits
        };
    };

    return (
        <LoyaltyContext.Provider value={{ clientId, loyaltyData, trackVisit, getStatus }}>
            {children}
        </LoyaltyContext.Provider>
    );
};

export const useLoyalty = () => useContext(LoyaltyContext);
