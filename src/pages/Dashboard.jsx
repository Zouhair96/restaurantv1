import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import UserProfileInfo from '../components/subscription/UserProfileInfo'
import SubscriptionPlans from '../components/subscription/SubscriptionPlans'
import OnboardingOverlay from '../components/dashboard/OnboardingOverlay'

const Dashboard = () => {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Check if user has an active subscription
    const hasSubscription = user?.subscription_status === 'active'

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('onboarding') === 'true') {
            setShowOnboarding(true)
            // Clean URL
            navigate('/dashboard', { replace: true })
        }
    }, [location, navigate])

    const handleCloseOnboarding = () => {
        setShowOnboarding(false)
    }

    // Loading state
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[#0f1115] text-gray-800 dark:text-white">Loading...</div>
    }

    // Not logged in
    if (!user) {
        return (
            <MainLayout>
                <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Please log in to view your dashboard
                        </h2>
                        <div className="mt-8 text-center">
                            <Link to="/login" className="font-medium text-yum-primary hover:text-red-500">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    // Authenticated & Subscribed (or Staff) - Render Dashboard
    if (user.role === 'STAFF') {
        // Staff can always access their restricted dashboard
        return <DashboardLayout />
    }

    if (!hasSubscription) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <UserProfileInfo user={user} />
                    <div className="mt-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 text-center uppercase tracking-tight">Choose Your Plan</h2>
                        <SubscriptionPlans onSubscribe={(planId) => navigate('/checkout', { state: { plan: { name: planId } } })} />
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <>
            {showOnboarding && <OnboardingOverlay onClose={handleCloseOnboarding} />}
            <DashboardLayout />
        </>
    )
}

export default Dashboard
