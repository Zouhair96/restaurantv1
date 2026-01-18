import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const AdminHeader = ({ activeSection, onSectionChange, toggleMobileMenu }) => {
    const { t } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="h-16 sm:h-20 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl sticky top-0 z-40 transition-colors">
            {/* Left: Hamburger + Nav Tabs */}
            <div className="flex items-center gap-4 sm:gap-8 md:gap-12">
                {/* Hamburger Menu Button (Mobile Only) */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Nav Tabs (Hidden on Mobile) */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                    {['Dashboard', 'Workflows', 'Integrations'].map((item) => {
                        const id = item.toLowerCase();
                        const isActive = activeSection === id;
                        return (
                            <button
                                key={item}
                                onClick={() => onSectionChange(id)}
                                className={`text-[13px] font-black tracking-tight transition-all pb-1 border-b-2 
                                    ${isActive
                                        ? 'text-gray-900 dark:text-white border-[#6359E9]'
                                        : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Center: Search (Responsive) */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4 md:mx-8">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#6359E9] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-10 sm:h-11 pl-10 sm:pl-12 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-[12px] sm:text-[13px] font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6359E9]/20 focus:border-[#6359E9] transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Functional Theme Switcher (Pill Style) */}
                <div className="hidden sm:flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-white/5 mr-2">
                    <button
                        onClick={() => !isDarkMode && toggleTheme()}
                        className={`flex items-center gap-2 px-3 py-1.5 transition-all text-[11px] font-bold rounded-full 
                            ${!isDarkMode
                                ? 'bg-white text-[#6359E9] shadow-sm'
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        <span>☀️</span> Light
                    </button>
                    <button
                        onClick={() => isDarkMode && toggleTheme()}
                        className={`flex items-center gap-2 px-3 py-1.5 transition-all text-[11px] font-bold rounded-full
                            ${isDarkMode
                                ? 'bg-[#1C1C1E] text-[#6359E9] shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <span>🌙</span> Dark
                    </button>
                </div>

                {/* Notification (Hidden on Small Mobile) */}
                <button className="hidden sm:flex w-10 h-10 items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#6359E9] transition-colors relative">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f1115]"></span>
                </button>

                {/* Settings (Hidden on Small Mobile) */}
                <button className="hidden sm:flex w-10 h-10 items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#6359E9] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>

                {/* Action Buttons */}
                <button className="hidden xl:flex items-center gap-2 px-4 py-2 text-[12px] font-black text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export data
                </button>

                <button className="bg-[#1C1C1E] dark:bg-[#6359E9] hover:opacity-90 text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-black shadow-lg shadow-indigo-200/20 dark:shadow-indigo-500/20 transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Add new board</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
