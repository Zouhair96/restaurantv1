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

    const syncLoyaltyEvent = async (restaurantName, eventType) => {
        try {
            await fetch('/.netlify/functions/loyalty-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantName,
                    visitorUuid: clientId,
                    eventType
                })
            });
        } catch (err) {
            console.warn('[Loyalty Sync Failed]:', err.message);
        }
    };

    const trackVisit = (restaurantName) => {
        if (!restaurantName) return;

        const now = Date.now();
        const updatedData = { ...loyaltyData };

        if (!updatedData[restaurantName]) {
            updatedData[restaurantName] = { visits: [], lastOfferType: 'NEW' };
        }

        const restaurantLog = updatedData[restaurantName];

        // Only record one visit per 'session' (e.g., once every 4 hours) 
        const lastVisit = restaurantLog.visits[restaurantLog.visits.length - 1];
        const FOUR_HOURS = 4 * 60 * 60 * 1000;

        let visitRecorded = false;
        if (!lastVisit || (now - lastVisit > FOUR_HOURS)) {
            restaurantLog.visits.push(now);
            visitRecorded = true;
            // Sync Visit to Backend
            syncLoyaltyEvent(restaurantName, 'visit');
        }

        // Cleanup: Remove visits older than 30 days
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        restaurantLog.visits = restaurantLog.visits.filter(v => now - v < THIRTY_DAYS);

        // Determine Status
        const oldStatus = restaurantLog.lastOfferType;
        let status = 'SOFT';
        if (restaurantLog.visits.length === 1) {
            status = 'NEW';
        } else if (restaurantLog.visits.length >= 4) {
            status = 'LOYAL';
        }

        restaurantLog.lastOfferType = status;

        // If status JUST upgraded to LOYAL, sync that milestone
        if (status === 'LOYAL' && oldStatus !== 'LOYAL') {
            syncLoyaltyEvent(restaurantName, 'loyal_status_reached');
        }

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
