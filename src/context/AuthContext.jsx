import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, signupUser as apiSignup, logoutUser as apiLogout, getCurrentUser } from '../utils/auth';

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
        return data; // Return data for component redirect logic
    };

    const signup = async (userData) => {
        const data = await apiSignup(userData);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    const value = {
        user,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
