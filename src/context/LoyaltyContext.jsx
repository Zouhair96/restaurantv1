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

        // Ensure we have the latest server stats for spending/orders
        refreshLoyaltyStats(restaurantName);

        const now = Date.now();
        const updatedData = { ...loyaltyData };

        if (!updatedData[restaurantName]) {
            updatedData[restaurantName] = { visits: [], completedOrders: [], lastOfferType: 'NEW', welcomeShown: false };
        }

        const restaurantLog = updatedData[restaurantName];
        const lastVisit = restaurantLog.visits[restaurantLog.visits.length - 1];
        const SESSION_TIMEOUT = 3 * 60 * 1000; // 3 Minutes for testing

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
            // We'll use a new query param 'restaurantName' in the API or look it up
            // Updated API strategy: create a dedicated 'get-loyalty-status' that accepts name.
            const response = await fetch(`/.netlify/functions/get-loyalty-status?restaurantName=${restaurantName}&loyaltyId=${clientId}`);
            if (response.ok) {
                const { completedOrders, totalSpending } = await response.json();
                setLoyaltyData(prev => ({
                    ...prev,
                    [restaurantName]: {
                        ...(prev[restaurantName] || {}),
                        completedOrders: Array(completedOrders).fill({ amount: 0 }), // Dummy array for length check
                        // We store the sum directly? The existing logic uses reduce on completedOrders.
                        // We need to refactor 'getStatus' to use this totalSpending directly or mock the objects.
                        // Let's Mock objects:
                        completedOrders: Array(completedOrders).fill({ amount: 0 }),
                        serverTotalSpending: totalSpending // Store authoritative total
                    }
                }));
            }
        } catch (err) {
            console.error('Failed to fetch loyalty stats:', err);
        }
    };

    const recordCompletedOrder = (restaurantName, finalAmount) => {
        console.log('[Loyalty] Pending Order Placed:', restaurantName, 'amount:', finalAmount);
        // DO NOT add to local state immediately. 
        // Logic: "dont move to other step till the order be completes"
        // We do nothing here. The user stays on current step.
        // When they pay and order becomes 'completed', a refresh (or poll) will pick it up.

        // Optional: Trigger a refresh just in case it was instant (e.g. 0 cost?)
        setTimeout(() => refreshLoyaltyStats(restaurantName), 2000);
    };

    const getStatus = (restaurantId) => {
        const log = loyaltyData[restaurantId];
        if (!log) return { status: 'NEW', totalVisits: 0, totalSpending: 0, spendingProgress: 0, config: null };

        const visits = log.visits || [];
        const completedOrders = log.completedOrders || [];

        // Calculate total spending (Prioritize server source, fallback to local calc)
        const totalSpending = log.serverTotalSpending !== undefined
            ? parseFloat(log.serverTotalSpending)
            : completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

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
