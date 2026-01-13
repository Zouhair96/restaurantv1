import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import OrderGrid from '../components/dashboard/OrderGrid'
import DashboardWidgets from '../components/dashboard/DashboardWidgets'

const Profile = () => {
    const { user, loading } = useAuth()

    // Loading state
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-yum-dark text-white">Loading...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
        )
    }

    return (
        <DashboardLayout rightPanel={<DashboardWidgets />}>
            <div className="space-y-8">
                {/* Health Score Banner */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yum-primary/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-yum-primary/20 transition-all duration-700"></div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Restaurant Health Score</h2>
                                <p className="text-gray-400 text-sm">Your restaurant is performing better than 85% of local competitors.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">98</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Excellent</span>
                                </div>
                                <div className="h-16 w-16 relative">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#374151" strokeWidth="3" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="98, 100" />
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
        </DashboardLayout>
    )
}

export default Profile
