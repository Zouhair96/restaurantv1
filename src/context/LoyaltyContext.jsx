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

    // New helper to fetch status by Name (API will handle lookup)
    // MOVED TO TOP to prevent "Cannot access before initialization" errors
    // New helper to fetch status by Name (API will handle lookup)
    // Converted to Function Declaration to ensure correct hoisting
    // New helper to fetch status by Name (API will handle lookup)
    // Converted to Function Declaration to ensure correct hoisting
    async function refreshLoyaltyStats(restaurantName) {
        // ALWAYS check localStorage for the latest ID (in case Checkout generated one just now)
        const storedId = localStorage.getItem(STORAGE_KEY_ID);
        const effectiveId = clientId || storedId;

        if (!restaurantName || !effectiveId) return;
        try {
            const response = await fetch(`/.netlify/functions/get-loyalty-status?restaurantName=${restaurantName}&loyaltyId=${effectiveId}&_t=${Date.now()}`);

            // If we found a new ID in storage that implies we should update state too
            if (storedId && storedId !== clientId) {
                setClientId(storedId);
            }
            if (response.ok) {
                const data = await response.json();
                const {
                    totalPoints,
                    totalVisits,
                    ordersInCurrentVisit,
                    totalCompletedOrders,
                    sessionIsValid,
                    activeGifts,
                    loyalty_config,
                    totalSpending,
                    uiState,
                    eligibility
                } = data;

                setLoyaltyData(prev => {
                    const updated = {
                        ...prev,
                        [restaurantName]: {
                            ...(prev[restaurantName] || {}),
                            totalPoints,
                            serverTotalVisits: totalVisits,
                            ordersInCurrentVisit,
                            totalCompletedOrders: totalCompletedOrders || 0,
                            sessionIsValid,
                            totalSpending: totalSpending || 0, // CUMULATIVE SPENDING
                            uiState,
                            eligibility,
                            // STRICT FLAGS
                            hasPlacedOrderInCurrentSession: data.hasPlacedOrderInCurrentSession,

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
    }

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
        refreshLoyaltyStats(restaurantName);
        return 'SOFT';
    };

    const markWelcomeAsShown = (restaurantName) => {
        if (!restaurantName) return;
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

    const convertGift = async (restaurantName, giftId) => {
        if (!restaurantName || !clientId || !giftId) return { success: false, error: 'Missing core data' };

        try {
            const log = loyaltyData[restaurantName];
            const restaurantId = log?.config?.restaurant_id;
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
        setTimeout(() => refreshLoyaltyStats(restaurantName), 2000);
    };

    const getStatus = (restaurantId) => {
        const log = loyaltyData[restaurantId];
        if (!log) return { status: 'NEW', totalVisits: 0, totalPoints: 0, activeGifts: [], sessionIsValid: false, config: null };

        const totalVisits = parseInt(log.serverTotalVisits) || 0;
        const totalPoints = parseInt(log.totalPoints) || 0;
        const totalCompletedOrders = parseInt(log.totalCompletedOrders) || 0;
        const activeGifts = log.activeGifts || [];
        const sessionIsValid = !!log.sessionIsValid;
        const ordersInSession = parseInt(log.ordersInCurrentVisit) || 0;

        const effectiveVisits = totalVisits + 1;
        const isStrictlyNew = totalCompletedOrders === 0 && totalPoints === 0 && activeGifts.length === 0;

        let currentStatus = 'NEW';
        if (isStrictlyNew) currentStatus = 'NEW';
        else if (effectiveVisits <= 2) currentStatus = 'WELCOME';
        else if (effectiveVisits === 3) currentStatus = 'IN_PROGRESS';
        else if (effectiveVisits >= 4) currentStatus = 'LOYAL';

        return {
            status: currentStatus,
            uiState: log.uiState || 'ACTIVE_EARNING',
            eligibility: log.eligibility || {},
            totalPoints: totalPoints,
            totalVisits: totalVisits,
            totalCompletedOrders: totalCompletedOrders,
            totalSpending: parseFloat(log.totalSpending) || 0, // CUMULATIVE SPENDING
            activeGifts: activeGifts,
            sessionIsValid: sessionIsValid,
            ordersInCurrentVisit: ordersInSession,
            config: log.config,
            welcomeShown: !!log.welcomeShown,
            effectiveVisits,
            hasPlacedOrderInCurrentSession: !!log.hasPlacedOrderInCurrentSession,
            isWelcomeDiscountEligible: !!log.isWelcomeDiscountEligible
        };
    };

    return (
        <LoyaltyContext.Provider value={{
            clientId,
            loyaltyData,
            trackVisit,
            getStatus,
            convertGift,
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
