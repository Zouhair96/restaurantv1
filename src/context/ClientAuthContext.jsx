import React, { createContext, useState, useContext, useEffect } from 'react';

const ClientAuthContext = createContext(null);

// Safe storage helper to prevent mobile crashes in private mode or full storage
const safeStorage = {
    getItem: (key) => {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: (key, value) => {
        try { localStorage.setItem(key, value); } catch (e) { }
    },
    removeItem: (key) => {
        try { localStorage.removeItem(key); } catch (e) { }
    }
};

export const ClientAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState(() => {
        return safeStorage.getItem('activeOrderId') || null;
    });
    const [activeOrder, setActiveOrder] = useState(null);
    const [isTopTrackerHidden, setIsTopTrackerHidden] = useState(() => {
        return safeStorage.getItem('isTopTrackerHidden') === 'true';
    });

    useEffect(() => {
        const handleNewOrder = (event) => {
            const orderId = event.detail?.orderId;
            if (orderId) {
                setActiveOrderId(orderId);
                safeStorage.setItem('activeOrderId', orderId);
                setIsTopTrackerHidden(false);
                safeStorage.removeItem('isTopTrackerHidden');
                safeStorage.removeItem(`completedAt_${orderId}`);
            }
        };

        window.addEventListener('orderPlaced', handleNewOrder);
        return () => window.removeEventListener('orderPlaced', handleNewOrder);
    }, []);

    const handleCloseTracker = () => {
        setIsTopTrackerHidden(true);
        safeStorage.setItem('isTopTrackerHidden', 'true');
    };

    // Poll for active order status
    useEffect(() => {
        if (!activeOrderId) {
            setActiveOrder(null);
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await fetch(`/.netlify/functions/get-public-order?orderId=${activeOrderId}`);
                const data = await response.json();
                if (response.ok) {
                    setActiveOrder(data);
                }
            } catch (err) {
                console.error("Error fetching order in context", err);
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 3000);
        return () => clearInterval(interval);
    }, [activeOrderId]);

    // Handle 15-min auto-dismiss for completed orders
    useEffect(() => {
        if (!activeOrder || !activeOrderId) return;

        const checkExpiry = () => {
            if (activeOrder.status === 'completed' || activeOrder.status === 'cancelled') {
                // User said "completed", but "ready" might also be considered for dismissal after some time.
                // However, the prompt specifically says "completed".
                if (activeOrder.status === 'completed' || activeOrder.status === 'cancelled') {
                    const storageKey = `completedAt_${activeOrderId}`;
                    let completedAt = safeStorage.getItem(storageKey);

                    if (!completedAt) {
                        completedAt = Date.now().toString();
                        safeStorage.setItem(storageKey, completedAt);

                        // Dispatch event for loyalty system to mark reward as used
                        if (activeOrder.loyalty_discount_applied) {
                            window.dispatchEvent(new CustomEvent('orderCompleted', {
                                detail: {
                                    orderId: activeOrderId,
                                    restaurantName: activeOrder.restaurant_name
                                }
                            }));
                        }
                    }

                    const elapsed = Date.now() - parseInt(completedAt);
                    if (elapsed > 15 * 60 * 1000) { // 15 minutes
                        setActiveOrderId(null);
                        setActiveOrder(null);
                        safeStorage.removeItem('activeOrderId');
                        safeStorage.removeItem(storageKey);
                        safeStorage.removeItem('isTopTrackerHidden');
                    }
                }
            }
        };

        checkExpiry();
        const interval = setInterval(checkExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [activeOrder, activeOrderId]);

    useEffect(() => {
        const storedUser = safeStorage.getItem('client_user');
        const token = safeStorage.getItem('client_token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse client user", e);
                safeStorage.removeItem('client_user');
                safeStorage.removeItem('client_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, restaurantName) => {
        try {
            const response = await fetch('/.netlify/functions/client-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, restaurantName })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

            safeStorage.setItem('client_token', data.token);
            safeStorage.setItem('client_user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (name, email, password, restaurantName) => {
        try {
            const response = await fetch('/.netlify/functions/client-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, restaurantName })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Signup failed');

            safeStorage.setItem('client_token', data.token);
            safeStorage.setItem('client_user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        safeStorage.removeItem('client_token');
        safeStorage.removeItem('client_user');
        setUser(null);
    };

    return (
        <ClientAuthContext.Provider value={{
            user, login, signup, logout, loading,
            activeOrderId, setActiveOrderId,
            activeOrder, setActiveOrder,
            handleCloseTracker,
            isTopTrackerHidden,
            setIsTopTrackerHidden
        }}>
            {children}
        </ClientAuthContext.Provider>
    );
};

export const useClientAuth = () => useContext(ClientAuthContext);
