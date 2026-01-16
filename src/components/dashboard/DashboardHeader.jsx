import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const DashboardHeader = ({ onMenuClick }) => {
    const { user } = useAuth()
    const { isDarkMode, toggleTheme } = useTheme()
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <header className="bg-transparent h-20 flex items-center justify-between px-4 md:px-8 z-10 transition-colors duration-300 gap-4">

            {/* Mobile Menu Button - Moved to start for standard UX */}
            <button
                className="md:hidden p-2 text-gray-500 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
                onClick={onMenuClick}
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </button>

            {/* Title & Search */}
            <div className="flex-1 flex items-center md:gap-6">
                <div className="hidden md:block shrink-0">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">Primary Dashboard</h1>
                </div>

                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-9 md:pl-11 pr-4 py-2 md:py-3 text-sm md:text-base border-none rounded-xl md:rounded-2xl bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md focus:shadow-lg text-gray-600 dark:text-gray-200 placeholder-gray-400 focus:outline-none transition-all duration-300"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Notifications & Actions */}
            <div className="flex items-center space-x-6">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all text-gray-500 dark:text-yellow-400"
                >
                    {isDarkMode ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Friends / Social (Mock based on image) */}
                <div className="hidden lg:flex items-center -space-x-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300 relative hover:-translate-y-1 transition-transform">
                            USER
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:-translate-y-1 transition-transform cursor-pointer">
                        +
                    </div>
                </div>

                <div className="flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-gray-700">
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6c5ce7] to-[#a29bfe] p-[2px] shadow-lg shadow-purple-200 dark:shadow-none">
                        <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-sm font-bold text-[#6c5ce7]">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DashboardHeader
