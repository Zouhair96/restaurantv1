import React, { createContext, useContext, useState, useEffect } from 'react';

const LoyaltyContext = createContext();

export const LoyaltyProvider = ({ children }) => {
    const [clientId, setClientId] = useState(null);
    const [loyaltyData, setLoyaltyData] = useState({}); // { [restaurantId]: { visits: [], lastOfferType: null } }
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);

    const STORAGE_KEY_DATA = 'loyalty_data_v2';
    const STORAGE_KEY_ID = 'loyalty_client_id_v2';

    useEffect(() => {
        // 1. Identification (Device-based)
        let id = localStorage.getItem(STORAGE_KEY_ID);
        if (!id) {
            id = typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem(STORAGE_KEY_ID, id);
        }
        setClientId(id);

        // 2. Load Existing Data
        const savedData = localStorage.getItem(STORAGE_KEY_DATA);
        if (savedData) {
            setLoyaltyData(JSON.parse(savedData));
        }
        setIsStorageLoaded(true);
    }, []);

    const syncLoyaltyEvent = async (restaurantName, eventType) => {
        try {
            // Robust ID check: use state if available, otherwise fallback to storage
            const visitorId = clientId || localStorage.getItem(STORAGE_KEY_ID);
            if (!visitorId || !restaurantName) return;

            const response = await fetch('/api/loyalty-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantName,
                    visitorUuid: visitorId,
                    eventType
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.loyalty_config) {
                    setLoyaltyData(prev => {
                        const currentData = prev[restaurantName] || { visits: [], lastOfferType: 'NEW' };
                        let updatedRestaurantData = {
                            ...currentData,
                            config: data.loyalty_config
                        };

                        // CHECK FOR GLOBAL RESET FROM SERVER
                        const serverResetTime = data.loyalty_config.last_reset_timestamp;
                        const localResetTime = currentData.lastResetTimestamp || 0;

                        if (serverResetTime && serverResetTime > localResetTime) {
                            console.log('[Loyalty] Global reset detected from server. Wiping local history.');
                            updatedRestaurantData = {
                                ...updatedRestaurantData,
                                visits: [],
                                completedOrders: [],
                                lastOfferType: 'NEW', // Force status back to new
                                welcomeShown: false,
                                welcomeRedeemed: false,
                                lastResetTimestamp: serverResetTime // Sync timestamp
                            };
                        }

                        const updated = {
                            ...prev,
                            [restaurantName]: updatedRestaurantData
                        };
                        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
                        return updated;
                    });
                }
            }
        } catch (err) {
            console.warn('[Loyalty Sync Failed]:', err.message);
        }
    };

    const trackVisit = (restaurantName) => {
        if (!restaurantName) return;

        // PURE SERVER SOURCE OF TRUTH
        // We do NOT track visits locally anymore. 
        // We only ask the server: "Based on my completed orders, what is my status?"
        refreshLoyaltyStats(restaurantName);

        // We return 'SOFT' as a placeholder, the UI will react to the async data update
        return 'SOFT';
    };

    const markWelcomeAsShown = (restaurantName) => {
        if (!restaurantName) return;
        // Keep local memory for "Popup dismissal" only (UI state)
        setLoyaltyData(prev => {
            const updated = {
                ...prev,
                [restaurantName]: {
                    ...(prev[restaurantName] || {}),
                    welcomeShown: true
                }
            };
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
            return updated;
        });
    };

    const markRewardAsUsed = (restaurantName) => {
        // Implement reward usage tracking if needed, or rely on backend
        // For now, keeping local optimistic update for UI feedback
        if (!restaurantName) return;
        setLoyaltyData(prev => ({
            ...prev,
            [restaurantName]: {
                ...(prev[restaurantName] || {}),
                rewardUsedInSession: true // Just hides it for this session
            }
        }));
    };

    const fetchLoyaltyStatus = async (restaurantName) => {
        if (!restaurantName || !clientId) return;
        try {
            // We need restaurantId. Assuming map or we fetch it. 
            // Actually, get-loyalty-status needs restaurantId (DB ID), not name.
            // But 'syncLoyaltyEvent' receives data.loyalty_config which might have ID?
            // Fallback: We can't easily get ID here without lookup.
            // Wait, 'syncLoyaltyEvent' gets config. Let's rely on Sync to trigger this?
            // Or simpler: Pass restaurantName to API and let API look it up.
            // Let's update get-loyalty-status to support name lookup or client-side lookup.
            // For now, let's assume we can pass restaurantName to a new endpoint wrapper or modify get-loyalty-status to accept name.
            // ... Actually, better to modify 'recordCompletedOrder' to just log and 'syncLoyaltyEvent' to fetch full state?

            // Let's implement a direct fetch if we have the ID.
            // Since we don't have ID easily, let's stick to the plan:
            // 1. disable local push. 2. Rely on user refreshing or 'trackVisit' triggering a sync.
        } catch (e) {
            console.error(e);
        }
    };

    // New helper to fetch status by Name (API will handle lookup)
    const refreshLoyaltyStats = async (restaurantName) => {
        if (!restaurantName || !clientId) return;
        try {
            const response = await fetch(`/.netlify/functions/get-loyalty-status?restaurantName=${restaurantName}&loyaltyId=${clientId}`);
            if (response.ok) {
                const data = await response.json();
                const { totalPoints, totalVisits, ordersInCurrentVisit, sessionIsValid, activeGifts, loyalty_config } = data;

                setLoyaltyData(prev => {
                    const updated = {
                        ...prev,
                        [restaurantName]: {
                            ...(prev[restaurantName] || {}),
                            totalPoints,
                            serverTotalVisits: totalVisits,
                            ordersInCurrentVisit,
                            sessionIsValid,
                            activeGifts: activeGifts || [],
                            config: loyalty_config || (prev[restaurantName]?.config) || { isAutoPromoOn: true }
                        }
                    };
                    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (err) {
            console.error('Failed to fetch loyalty stats:', err);
        }
    };

    const convertGift = async (restaurantName, giftId) => {
        if (!restaurantName || !clientId || !giftId) return { success: false, error: 'Missing core data' };

        try {
            const log = loyaltyData[restaurantName];
            const restaurantId = log?.config?.restaurant_id; // Assuming restaurantId is available in config
            // If not available, we might need to get it or the API should handle name.
            // My convert-gift-to-points.js needs restaurantId (INT).

            // Let's assume restaurantId is available in the config returned by get-loyalty-status
            const rId = restaurantId || log?.config?.id;

            const response = await fetch('/.netlify/functions/convert-gift-to-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    giftId,
                    loyaltyId: clientId,
                    restaurantId: rId
                })
            });

            if (response.ok) {
                await refreshLoyaltyStats(restaurantName);
                return await response.json();
            } else {
                const err = await response.json();
                return { success: false, error: err.error };
            }
        } catch (err) {
            return { success: false, error: 'Connection error' };
        }
    };

    const recordCompletedOrder = (restaurantName, finalAmount) => {
        // Just trigger a refresh to see if status changed
        setTimeout(() => refreshLoyaltyStats(restaurantName), 2000);
    };

    const getStatus = (restaurantId) => {
        const log = loyaltyData[restaurantId];
        if (!log) return { status: 'NEW', totalVisits: 0, totalPoints: 0, activeGifts: [], sessionIsValid: false, config: null };

        // Use Server-Side Source of Truth
        const totalVisits = log.serverTotalVisits !== undefined ? parseInt(log.serverTotalVisits) : 0;
        const totalPoints = log.totalPoints || 0;
        const activeGifts = log.activeGifts || [];
        const sessionIsValid = !!log.sessionIsValid;

        // Derive UI status based on server-synced visit count
        let currentStatus = 'NEW';
        if (totalVisits === 0) currentStatus = 'NEW';
        else if (totalVisits === 1) currentStatus = 'WELCOME';
        else if (totalVisits === 2) currentStatus = 'IN_PROGRESS';
        else if (totalVisits >= 3) currentStatus = 'LOYAL';

        return {
            status: currentStatus,
            totalPoints: totalPoints,
            activeGifts: activeGifts,
            sessionIsValid: sessionIsValid,
            ordersInCurrentVisit: log.ordersInCurrentVisit || 0,
            config: log.config,
            welcomeShown: !!log.welcomeShown,
            welcomeRedeemed: !!log.rewardUsedInSession,
            // Hidden terminology (kept for internal logic if needed but discouraged in UI)
            _internalVisitCount: totalVisits
        };
    };

    return (
        <LoyaltyContext.Provider value={{
            clientId,
            loyaltyData,
            trackVisit,
            getStatus,
            convertGift,
            markRewardAsUsed,
            markWelcomeAsShown,
            recordCompletedOrder,
            refreshLoyaltyStats,
            isStorageLoaded
        }}>
            {children}
        </LoyaltyContext.Provider>
    );
};

export const useLoyalty = () => useContext(LoyaltyContext);
