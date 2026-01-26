import React, { createContext, useState, useContext, useEffect } from 'react';

const ClientAuthContext = createContext(null);

export const ClientAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState(() => {
        return localStorage.getItem('activeOrderId') || null;
    });

    useEffect(() => {
        const handleNewOrder = (event) => {
            const orderId = event.detail?.orderId;
            if (orderId) {
                setActiveOrderId(orderId);
                localStorage.setItem('activeOrderId', orderId);
            }
        };

        window.addEventListener('orderPlaced', handleNewOrder);
        return () => window.removeEventListener('orderPlaced', handleNewOrder);
    }, []);

    const handleCloseTracker = () => {
        setActiveOrderId(null);
        localStorage.removeItem('activeOrderId');
    };

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
        <ClientAuthContext.Provider value={{ user, login, signup, logout, loading, activeOrderId, setActiveOrderId, handleCloseTracker }}>
            {children}
        </ClientAuthContext.Provider>
    );
};

export const useClientAuth = () => useContext(ClientAuthContext);
