import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, signupUser as apiSignup, logoutUser as apiLogout, getCurrentUser, subscribeUser as apiSubscribe, unsubscribeUser as apiUnsubscribe, updateUserProfile as apiUpdateProfile, loginStaff } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for logged-in user on mount
        const storedUser = getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await apiLogin(email, password);
        setUser(data.user);
        return data;
    };

    const staffLogin = async (restaurantId, pin) => {
        const { loginStaff } = await import('../utils/auth'); // Lazy or ensure it's imported
        const data = await loginStaff(restaurantId, pin);
        setUser(data.user);
        return data;
    }

    const signup = async (userData) => {
        const data = await apiSignup(userData);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    const subscribe = async (plan, paymentMethod) => {
        const data = await apiSubscribe(plan, paymentMethod);
        setUser(data.user);
        return data;
    }

    const unsubscribe = async () => {
        const data = await apiUnsubscribe();
        setUser(data.user);
        return data;
    }

    const updateUser = async (userData) => {
        const data = await apiUpdateProfile(userData);
        setUser(data.user);
        return data;
    }

    const value = {
        user,
        login,
        staffLogin,
        signup,
        logout,
        subscribe,
        unsubscribe,
        updateUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
