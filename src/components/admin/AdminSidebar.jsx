import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ activeSection, onSectionChange }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', icon: 'M4 6h16M4 12h16m-7 6h7', label: 'Dashboard' },
        { id: 'users', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Users' },
        { id: 'analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Analytics' },
        { id: 'notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Notifications' },
        { id: 'calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Calendar' },
        { id: 'inbox', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4', label: 'Inbox' },
        { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-24 flex flex-col items-center py-10 z-50">
            {/* Curved Background Shape (Purple) */}
            <div className="absolute inset-y-8 left-0 w-20 bg-[#6359E9] rounded-r-[3rem] shadow-[20px_0_50px_rgba(99,89,233,0.15)] z-[-1] overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/3"></div>
            </div>

            <nav className="flex-1 flex flex-col gap-8">
                {navItems.map((item) => (
                    <div key={item.id} className="relative group px-4">
                        <button
                            onClick={() => onSectionChange(item.id)}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 transform
                ${activeSection === item.id
                                    ? 'bg-white text-[#6359E9] shadow-xl shadow-indigo-200 scale-110'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>

                            {/* Tooltip */}
                            <span className="absolute left-full ml-6 px-3 py-1.5 bg-[#1C1C1E] text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/5 tracking-wider uppercase">
                                {item.label}
                            </span>

                            {/* Status Badge Mockup */}
                            {item.id === 'analytics' && (
                                <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-[#6359E9] text-[8px] flex items-center justify-center text-white font-bold">5</span>
                                </div>
                            )}
                        </button>
                    </div>
                ))}
            </nav>

            {/* Logout / Bottom Action */}
            <button
                onClick={handleLogout}
                className="mt-auto mb-12 w-12 h-12 flex items-center justify-center rounded-2xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                title="Logout"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </aside>
    );
};

export default AdminSidebar;
