import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import OrderGrid from '../components/dashboard/OrderGrid'
import DashboardWidgets from '../components/dashboard/DashboardWidgets'
import UserProfileInfo from '../components/subscription/UserProfileInfo'
import SubscriptionPlans from '../components/subscription/SubscriptionPlans'

const Profile = () => {
    const { user, loading } = useAuth()
    const [activeModule, setActiveModule] = useState('dashboard')
    // Mock subscription state - default to false to show the flow
    const [hasSubscription, setHasSubscription] = useState(false)

    const handleSubscribe = (plan) => {
        // Mock subscription process
        alert(`Subscribing to ${plan}...`)
        setHasSubscription(true)
    }

    // Loading state
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-yum-dark text-white">Loading...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Please log in to view your profile
                    </h2>
                    <div className="mt-8 text-center">
                        <Link to="/login" className="font-medium text-yum-primary hover:text-red-500">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // If user is not subscribed, show Profile Info & Plans
    if (!hasSubscription) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <UserProfileInfo user={user} />
                    <SubscriptionPlans onSubscribe={handleSubscribe} />

                    {/* Demo Toggle for Verification */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setHasSubscription(true)}
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                            [Demo] Simulate Already Subscribed
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // --- Dashboard Views ---

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Pro Analytics</h2>
                    <p className="text-gray-400 text-sm">Sales predictions powered by local data & AI.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-300 border border-gray-700">Last 24h</span>
                    <span className="px-3 py-1 bg-yum-primary/20 rounded-lg text-xs text-yum-primary border border-yum-primary/50 font-bold">Next 24h (Predicted)</span>
                </div>
            </div>

            {/* Smart Insights Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weather Widget */}
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition-colors"></div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Tonight's Forecast</p>
                        <h3 className="text-2xl font-bold text-white mt-1">Heavy Rain</h3>
                        <p className="text-blue-400 text-sm mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +15% Delivery Demand
                        </p>
                    </div>
                    <div className="relative z-10 text-5xl">
                        🌧️
                    </div>
                </div>

                {/* Event Widget */}
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-purple-900/20 transition-colors"></div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Local Event</p>
                        <h3 className="text-2xl font-bold text-white mt-1">Jazz Concert</h3>
                        <p className="text-purple-400 text-sm mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +30% Walk-ins (20:00)
                        </p>
                    </div>
                    <div className="relative z-10 text-5xl">
                        🎷
                    </div>
                </div>

                {/* Overall Prediction */}
                <div className="bg-gradient-to-br from-yum-primary to-orange-600 rounded-2xl p-5 text-white flex flex-col justify-center items-center text-center shadow-lg shadow-yum-primary/20">
                    <p className="text-xs uppercase tracking-widest font-bold text-white/80">Predicted Revenue</p>
                    <h3 className="text-4xl font-black mt-1">$3,250</h3>
                    <p className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full mt-2">+18% vs Last Friday</p>
                </div>
            </div>

            {/* Sales Graph */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Hourly Sales Prediction</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {[30, 45, 35, 60, 80, 100, 70, 50, 40, 60, 90, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20">
                                {12 + i}:00 - ${h * 30}
                            </div>
                            <div
                                className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${i > 7 ? 'bg-yum-primary border-t-2 border-white/50 pattern-diagonal-lines' : 'bg-gray-700'}`}
                                style={{ height: `${h}%` }}
                            ></div>
                            <span className="text-xs text-gray-500 font-medium">{12 + i}:00</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderDynamicMenu = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-2">Dish Management</h2>

            {/* AI Suggestions Banner */}
            <div className="bg-gradient-to-r from-purple-900/40 to-yum-primary/20 border border-yum-primary/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <svg className="w-24 h-24 text-yum-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                        <span className="text-2xl">✨</span> AI Suggestions
                    </h3>
                    <p className="text-gray-200 text-lg">
                        Recommends menu changes based on trends (e.g., “<span className="text-yum-primary font-bold">Add a vegetarian dish</span> — demand up 20% this month”)
                    </p>
                    <button className="mt-4 px-4 py-2 bg-yum-primary text-white font-bold rounded-lg hover:bg-red-500 transition-colors shadow-lg">
                        Apply Suggestion
                    </button>
                </div>
            </div>

            {/* Menu Grid Placeholder to make it look full */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="glass-panel p-4 rounded-xl flex gap-4 items-center opacity-60">
                        <div className="w-20 h-20 bg-gray-800 rounded-lg"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-800 rounded"></div>
                            <div className="h-3 w-20 bg-gray-800 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderDashboardOverview = () => (
        <div className="space-y-8">
            {/* Health Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yum-primary/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-yum-primary/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
                            <p className="text-gray-400 text-sm">“Restaurant Health” Widget: Overall rating (⭐️/5) based on sales, customer reviews, and preparation time.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">4.8</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Excellent</span>
                            </div>
                            <div className="h-16 w-16 relative">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#374151" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="96, 100" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-red-900/30 transition-colors group">
                    <div className="p-3 bg-red-500/20 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold">Emergency Mode</h3>
                    <p className="text-xs text-red-300 mt-1">Activate for Rush Hour 2x boost</p>
                </div>
            </div>

            {/* Main Order Area */}
            <OrderGrid />
        </div>
    )

    const renderPlaceholder = (title) => (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-xl font-bold">{title} Module</h2>
            <p className="text-sm">Coming soon in the next update.</p>
        </div>
    )

    const renderContent = () => {
        switch (activeModule) {
            case 'dashboard':
                return renderDashboardOverview()
            case 'menu':
                return renderDynamicMenu()
            case 'analytics':
                return renderAnalytics()
            case 'team':
                return renderPlaceholder('Team Management')
            case 'promos':
                return renderPlaceholder('Automated Promotions')
            case 'settings':
                return renderPlaceholder('Advanced Settings')
            default:
                return renderDashboardOverview()
        }
    }

    return (
        <DashboardLayout rightPanel={<DashboardWidgets />} activeModule={activeModule} onModuleChange={setActiveModule}>
            {renderContent()}
        </DashboardLayout>
    )
}

export default Profile
