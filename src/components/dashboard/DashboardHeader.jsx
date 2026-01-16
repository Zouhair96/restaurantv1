import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
    HiOutlineBell,
    HiOutlineUserCircle,
    HiOutlineLogout,
    HiOutlineSettings,
    HiOutlineSearch,
    HiOutlineMenuAlt2,
    HiOutlineMoon,
    HiOutlineSun
} from 'react-icons/hi'

const DashboardHeader = ({ onMenuClick }) => {
    const { user, logout } = useAuth()
    const { isDarkMode, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    const profileRef = useRef(null)
    const notificationRef = useRef(null)

    // Mock notifications
    const notifications = [
        { id: 1, title: 'New Order', message: 'Order #1234 just arrived!', time: '2 min ago', type: 'order' },
        { id: 2, title: 'Stock Alert', message: 'Chicken is running low', time: '15 min ago', type: 'alert' },
        { id: 3, title: 'System', message: 'Daily report is ready', time: '1 hour ago', type: 'info' }
    ]

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="bg-transparent h-20 flex items-center justify-between px-4 md:px-8 z-[70] transition-colors duration-300 gap-4">

            {/* Mobile Menu Button */}
            <button
                className="md:hidden p-2 text-gray-500 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
                onClick={onMenuClick}
            >
                <HiOutlineMenuAlt2 className="w-6 h-6" />
            </button>

            {/* Title & Search */}
            <div className="flex-1 flex items-center md:gap-6">
                <div className="hidden md:block shrink-0">
                    <h1 className="text-2xl font-black text-gray-800 dark:text-white transition-colors tracking-tight">Dashboard</h1>
                </div>

                <div className="relative flex-1 max-w-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                        <HiOutlineSearch className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-9 md:pl-11 pr-4 py-2 md:py-2.5 text-sm border-none rounded-xl md:rounded-2xl bg-white/80 dark:bg-gray-800/40 backdrop-blur-md shadow-sm hover:shadow-md focus:shadow-lg text-gray-600 dark:text-gray-200 placeholder-gray-400 focus:outline-none transition-all duration-300"
                        placeholder="Search everything..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-white/5 hover:shadow-md transition-all text-gray-500 dark:text-yellow-400"
                >
                    {isDarkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                </button>

                {/* Alarm / Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`relative p-2.5 rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-white/5 hover:shadow-md transition-all ${isNotificationsOpen ? 'text-yum-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        <HiOutlineBell className="h-6 w-6" />
                        <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 animate-pulse"></span>
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-scale-in">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-widest text-xs">Notifications</h3>
                                <button className="text-[10px] font-bold text-yum-primary uppercase hover:underline">Mark all as read</button>
                            </div>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {notifications.map(n => (
                                    <div key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0">
                                        <div className="flex gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'order' ? 'bg-green-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{n.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-medium">{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 text-center border-t border-gray-50 dark:border-white/5">
                                <button className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">View all activity &rarr;</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <div className="relative pl-2 md:pl-4 border-l border-gray-200 dark:border-gray-700" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1 rounded-full hover:bg-white dark:hover:bg-white/5 transition-all"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yum-primary to-orange-400 p-[2px] shadow-lg shadow-red-200 dark:shadow-none">
                            <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-sm font-black text-yum-primary">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                        <div className="hidden lg:block text-left mr-2">
                            <p className="text-xs font-black text-gray-800 dark:text-white leading-none capitalize">{user?.name || 'User'}</p>
                            <p className="text-[10px] font-bold text-gray-400 tracking-wide mt-1">RESTAURANT ADMIN</p>
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-scale-in">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                                <p className="text-sm font-black text-gray-800 dark:text-white truncate">{user?.email}</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => { setIsProfileOpen(false); navigate('/profile?tab=settings'); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    <HiOutlineUserCircle className="w-5 h-5" />
                                    My Profile
                                </button>
                                <button
                                    onClick={() => { setIsProfileOpen(false); navigate('/profile?tab=settings'); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    <HiOutlineSettings className="w-5 h-5" />
                                    Settings
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                                >
                                    <HiOutlineLogout className="w-5 h-5" />
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default DashboardHeader

