import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineSquares2X2,
    HiSquares2X2,
    HiOutlineUser,
    HiUser,
    HiOutlineChartPie,
    HiChartPie,
    HiOutlineBell,
    HiBell,
    HiOutlineCalendarDays,
    HiCalendarDays,
    HiOutlineEnvelope,
    HiEnvelope,
    HiOutlineArrowRightOnRectangle,
    HiOutlineCog6Tooth,
    HiCog6Tooth,
    HiOutlineSwatch,
    HiSwatch,
    HiXMark
} from 'react-icons/hi2';

const AdminSidebar = ({ activeSection, onSectionChange, isMobileMenuOpen, closeMobileMenu }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = (id) => {
        onSectionChange(id);
        if (closeMobileMenu) {
            closeMobileMenu();
        }
    };

    const navItems = [
        { id: 'dashboard', outline: HiOutlineSquares2X2, solid: HiSquares2X2, label: 'Dashboard' },
        { id: 'users', outline: HiOutlineUser, solid: HiUser, label: 'Users' },
        { id: 'analytics', outline: HiOutlineChartPie, solid: HiChartPie, label: 'Analytics' },
        { id: 'notifications', outline: HiOutlineBell, solid: HiBell, label: 'Notifications' },
        { id: 'calendar', outline: HiOutlineCalendarDays, solid: HiCalendarDays, label: 'Calendar' },
        { id: 'inbox', outline: HiOutlineEnvelope, solid: HiEnvelope, label: 'Inbox' },
        { id: 'settings', outline: HiOutlineCog6Tooth, solid: HiCog6Tooth, label: 'Settings' },
    ];

    return (
        <aside className={`fixed left-4 top-4 bottom-4 w-20 flex flex-col items-center z-50 transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Mobile Close Button */}
            {closeMobileMenu && (
                <button
                    onClick={closeMobileMenu}
                    className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center text-white bg-red-500 hover:bg-red-600 md:hidden z-50 rounded-full shadow-lg"
                >
                    <HiXMark size={18} />
                </button>
            )}

            {/* Rounded Pill Background - Premium Gradient \u0026 Glass */}
            <div className="relative w-full h-full bg-gradient-to-b from-[#6359E9] to-[#4c44c7] rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 flex flex-col items-center py-8 px-3 border border-white/10 backdrop-blur-xl">

                {/* Navigation Items */}
                <div className="flex-1 w-full flex flex-col items-center justify-center gap-6">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        const Icon = isActive ? item.solid : item.outline;

                        return (
                            <div key={item.id} className="relative group">
                                <button
                                    onClick={() => handleNavClick(item.id)}
                                    className={`relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300
                                        ${isActive
                                            ? 'bg-white text-[#6359E9] scale-110 shadow-xl shadow-[#6359E9]/40'
                                            : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105'
                                        }`}
                                    title={item.label}
                                >
                                    <Icon size={24} className="transition-transform duration-300" />
                                </button>

                                {/* Hover Tooltip */}
                                {!isActive && (
                                    <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 uppercase tracking-wide -translate-x-2 group-hover:translate-x-0 z-50">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Logout Button at Bottom */}
                <div className="mt-auto pt-6 border-t border-white/20 w-full flex justify-center">
                    <button
                        onClick={handleLogout}
                        className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                        title="Logout"
                    >
                        <HiOutlineArrowRightOnRectangle size={24} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
