import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[#0f1115]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yum-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Forbidden - redirect to their specific landing page
        if (user.role === 'STAFF') {
            return <Navigate to="/dashboard/orders" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RoleProtectedRoute;
