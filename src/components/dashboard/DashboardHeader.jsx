import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const DashboardHeader = ({ onMenuClick }) => {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <header className="bg-white/5 backdrop-blur-md border-b border-gray-800 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
            {/* Search Bar & Mobile Toggle */}
            <div className="flex-1 max-w-xl flex items-center gap-4">
                <button
                    className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
                    onClick={onMenuClick}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-yum-primary focus:ring-1 focus:ring-yum-primary sm:text-sm transition-all duration-300"
                        placeholder="Search orders, menu items, customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Notifications & Actions */}
            <div className="flex items-center space-x-6">
                {/* Urgent Event Banner (Mock) */}
                <div className="hidden lg:flex items-center bg-red-900/30 border border-red-500/30 rounded-full px-4 py-1 animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">VIP Incoming</span>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-yum-primary ring-2 ring-gray-900"></span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>

                    <div className="flex items-center space-x-3 border-l border-gray-700 pl-4">
                        {/* Admin Link if Admin */}
                        {user?.role === 'admin' && (
                            <a href="/admin" className="mr-2 p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors" title="Admin Dashboard">
                                🛡️
                            </a>
                        )}

                        <div className="flex flex-col text-right hidden sm:flex">
                            <span className="text-sm font-medium text-white">{user?.name || 'Owner'}</span>
                            <span className="text-xs text-yum-primary uppercase font-bold">{user?.role === 'admin' ? 'Admin' : 'Manager'}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yum-primary to-orange-500 p-[2px]">
                            <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DashboardHeader
