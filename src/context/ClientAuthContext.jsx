import React, { createContext, useState, useContext, useEffect } from 'react';

const ClientAuthContext = createContext(null);

export const ClientAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState(() => {
        return localStorage.getItem('activeOrderId') || null;
    });
    const [activeOrder, setActiveOrder] = useState(null);
    const [isTopTrackerHidden, setIsTopTrackerHidden] = useState(() => {
        return localStorage.getItem('isTopTrackerHidden') === 'true';
    });

    useEffect(() => {
        const handleNewOrder = (event) => {
            const orderId = event.detail?.orderId;
            if (orderId) {
                setActiveOrderId(orderId);
                localStorage.setItem('activeOrderId', orderId);
                setIsTopTrackerHidden(false);
                localStorage.removeItem('isTopTrackerHidden');
                localStorage.removeItem(`completedAt_${orderId}`);
            }
        };

        window.addEventListener('orderPlaced', handleNewOrder);
        return () => window.removeEventListener('orderPlaced', handleNewOrder);
    }, []);

    const handleCloseTracker = () => {
        setIsTopTrackerHidden(true);
        localStorage.setItem('isTopTrackerHidden', 'true');
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
            if (activeOrder.status === 'completed' || activeOrder.status === 'cancelled' || activeOrder.status === 'ready') {
                // User said "completed", but "ready" might also be considered for dismissal after some time.
                // However, the prompt specifically says "completed".
                if (activeOrder.status === 'completed' || activeOrder.status === 'cancelled') {
                    const storageKey = `completedAt_${activeOrderId}`;
                    let completedAt = localStorage.getItem(storageKey);

                    if (!completedAt) {
                        completedAt = Date.now().toString();
                        localStorage.setItem(storageKey, completedAt);
                    }

                    const elapsed = Date.now() - parseInt(completedAt);
                    if (elapsed > 15 * 60 * 1000) { // 15 minutes
                        setActiveOrderId(null);
                        setActiveOrder(null);
                        localStorage.removeItem('activeOrderId');
                        localStorage.removeItem(storageKey);
                        localStorage.removeItem('isTopTrackerHidden');
                    }
                }
            }
        };

        checkExpiry();
        const interval = setInterval(checkExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [activeOrder, activeOrderId]);

    useEffect(() => {
        const storedUser = localStorage.getItem('client_user');
        const token = localStorage.getItem('client_token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse client user", e);
                localStorage.removeItem('client_user');
                localStorage.removeItem('client_token');
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

            localStorage.setItem('client_token', data.token);
            localStorage.setItem('client_user', JSON.stringify(data.user));
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

            localStorage.setItem('client_token', data.token);
            localStorage.setItem('client_user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
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
