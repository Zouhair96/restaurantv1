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

    // Not Subscribed
    if (!hasSubscription) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <UserProfileInfo user={user} />
                    <div className="mt-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 text-center uppercase tracking-tight">Choose Your Plan</h2>
                        <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto font-medium">
                            Join YumYum and boost your restaurant revenue.
                            <span className="block mt-2 text-xs italic">* All plans come with a 12-month engagement period. Upgrading preserves your engagement end date, while downgrading resets it to 12 months from the switch date.</span>
                        </p>
                        <SubscriptionPlans onSubscribe={(planId) => navigate('/checkout', { state: { plan: { name: planId } } })} />
                    </div>
                </div>
            </MainLayout>
        )
    }

    // Check if payment method is set up (for new "Marketing First" strategy)
    if (!user.stripe_payment_method_id) {
        navigate('/payment-setup')
        return null
    }

    // Authenticated & Subscribed & Payment Method Set - Render Dashboard
    return (
        <>
            {showOnboarding && <OnboardingOverlay onClose={handleCloseOnboarding} />}
            <DashboardLayout />
        </>
    )
}

export default Dashboard
