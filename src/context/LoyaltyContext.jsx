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

        const now = Date.now();
        const updatedData = { ...loyaltyData };

        if (!updatedData[restaurantName]) {
            updatedData[restaurantName] = { visits: [], completedOrders: [], lastOfferType: 'NEW', welcomeShown: false };
        }

        const restaurantLog = updatedData[restaurantName];
        const lastVisit = restaurantLog.visits[restaurantLog.visits.length - 1];
        // const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // Original 4 hours
        const SESSION_TIMEOUT = 1 * 60 * 1000; // 1 Minute for testing

        let visitRecorded = false;
        if (!lastVisit || (now - lastVisit > SESSION_TIMEOUT)) {
            // New Session: Reset temporary flags
            restaurantLog.rewardUsedInSession = false;
            restaurantLog.isNextVisitRecovery = false;

            // Check if this new visit is a "Recovery" return before pushing it
            const delayDays = parseInt(restaurantLog.config?.recoveryConfig?.delay || 21);
            const delayMillis = delayDays * 24 * 60 * 60 * 1000;

            if (lastVisit && (now - lastVisit > delayMillis)) {
                // Determine if they are allowed another reward yet (Frequency)
                const freqDays = parseInt(restaurantLog.config?.recoveryConfig?.frequency || 30);
                const freqMillis = freqDays * 24 * 60 * 60 * 1000;
                const lastRewardDate = restaurantLog.lastRecoveryDate || 0;

                if (now - lastRewardDate > freqMillis) {
                    restaurantLog.lastRecoveryDate = now;
                    restaurantLog.isNextVisitRecovery = true;
                    syncLoyaltyEvent(restaurantName, 'recovery_visit');
                }
            }

            restaurantLog.visits.push(now);
            visitRecorded = true;
            if (!restaurantLog.isNextVisitRecovery) {
                syncLoyaltyEvent(restaurantName, 'visit');
            }
        }

        // Cleanup: Remove visits older than 30 days
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        restaurantLog.visits = restaurantLog.visits.filter(v => now - v < THIRTY_DAYS);

        // Determine Status based on SPENDING/ORDERS (Not just visits)
        const oldStatus = restaurantLog.lastOfferType;
        let status = 'SOFT';

        const completedOrders = restaurantLog.completedOrders || [];
        const totalSpending = completedOrders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);

        // Threshold from config or default 50
        const loyalThreshold = parseFloat(restaurantLog.config?.loyalConfig?.threshold || 50);

        if (completedOrders.length === 0) {
            status = 'NEW';
        } else if (totalSpending >= loyalThreshold) {
            status = 'LOYAL';
        }

        restaurantLog.lastOfferType = status;

        if (status === 'LOYAL' && oldStatus !== 'LOYAL') {
            syncLoyaltyEvent(restaurantName, 'loyal_status_reached');
        }

        setLoyaltyData(updatedData);
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updatedData));

        return status;
    };

    const markWelcomeAsShown = (restaurantName) => {
        if (!restaurantName) return;

        setLoyaltyData(prev => {
            const updated = {
                ...prev,
                [restaurantName]: {
                    ...(prev[restaurantName] || { visits: [], lastOfferType: 'NEW' }),
                    welcomeShown: true
                }
            };
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
            return updated;
        });
    };

    const markRewardAsUsed = (restaurantName) => {
        console.log('[Loyalty] markRewardAsUsed called for:', restaurantName);
        if (!restaurantName) return;

        setLoyaltyData(prev => {
            const currentData = prev[restaurantName] || { visits: [], lastOfferType: 'NEW' };
            const isWelcomePhase = currentData.lastOfferType === 'NEW';

            console.log('[Loyalty] Current Data:', currentData);
            console.log('[Loyalty] isWelcomePhase:', isWelcomePhase);

            const updated = {
                ...prev,
                [restaurantName]: {
                    ...currentData,
                    rewardUsedInSession: true,
                    // If they are NEW and used a reward, mark welcome as permanently redeemed
                    welcomeRedeemed: isWelcomePhase ? true : currentData.welcomeRedeemed
                }
            };
            console.log('[Loyalty] Updated Data:', updated[restaurantName]);
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
            return updated;
        });

        syncLoyaltyEvent(restaurantName, 'reward_claimed');
    };

    const recordCompletedOrder = (restaurantName, finalAmount) => {
        console.log('[Loyalty] recordCompletedOrder called for:', restaurantName, 'amount:', finalAmount);
        if (!restaurantName || !finalAmount) return;

        setLoyaltyData(prev => {
            const currentData = prev[restaurantName] || { visits: [], completedOrders: [], lastOfferType: 'NEW' };

            const updated = {
                ...prev,
                [restaurantName]: {
                    ...currentData,
                    completedOrders: [
                        ...(currentData.completedOrders || []),
                        { amount: parseFloat(finalAmount), timestamp: Date.now() }
                    ]
                }
            };

            console.log('[Loyalty] Updated with order:', updated[restaurantName]);
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
            return updated;
        });
    };

    const getStatus = (restaurantId) => {
        const log = loyaltyData[restaurantId];
        if (!log) return { status: 'NEW', totalVisits: 0, totalSpending: 0, spendingProgress: 0, config: null };

        const visits = log.visits || [];
        const completedOrders = log.completedOrders || [];

        // Calculate total spending
        const totalSpending = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

        // Calculate progress toward loyal threshold
        const threshold = parseFloat(log.config?.loyalConfig?.threshold || 50);
        const spendingProgress = Math.min(100, Math.round((totalSpending / threshold) * 100));

        // A visit is "Recovery Eligible" if we flagged it during trackVisit
        // AND it hasn't been used yet in this session
        const isRecoveryEligible = !!log.isNextVisitRecovery && !log.rewardUsedInSession;

        return {
            status: log.lastOfferType,
            totalVisits: visits.length,
            visits: visits,
            completedOrders: completedOrders,
            totalSpending: totalSpending,
            spendingProgress: spendingProgress,
            config: log.config,
            isRecoveryEligible,
            isRecoveryEligible,
            welcomeShown: !!log.welcomeShown,
            welcomeRedeemed: !!log.welcomeRedeemed
        };
    };

    return (
        <LoyaltyContext.Provider value={{ clientId, loyaltyData, trackVisit, getStatus, markRewardAsUsed, markWelcomeAsShown, recordCompletedOrder, isStorageLoaded }}>
            {children}
        </LoyaltyContext.Provider>
    );
};

export const useLoyalty = () => useContext(LoyaltyContext);
