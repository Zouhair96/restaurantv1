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
    HiOutlinePencilSquare,
    HiPencilSquare,
    HiOutlineChatBubbleOvalLeft,
    HiChatBubbleOvalLeft,
    HiOutlineArrowRightOnRectangle,
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
        { id: 'analytics', outline: HiOutlineChartPie, solid: HiChartPie, label: 'Analytics', badge: 'PRO' },
        { id: 'notifications', outline: HiOutlineBell, solid: HiBell, label: 'Notifications' },
        { id: 'calendar', outline: HiOutlineCalendarDays, solid: HiCalendarDays, label: 'Calendar' },
        { id: 'inbox', outline: HiOutlineEnvelope, solid: HiEnvelope, label: 'Inbox', dot: '#FACC15' },
        { id: 'editor', outline: HiOutlinePencilSquare, solid: HiPencilSquare, label: 'Editor' },
        { id: 'chat', outline: HiOutlineChatBubbleOvalLeft, solid: HiChatBubbleOvalLeft, label: 'Chat', dot: '#22D3EE' },
    ];

    return (
        <aside className={`fixed left-0 top-0 h-full w-24 flex flex-col items-center justify-center z-50 transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Mobile Close Button */}
            {closeMobileMenu && (
                <button
                    onClick={closeMobileMenu}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white md:hidden z-50 bg-white/10 rounded-lg backdrop-blur-sm"
                >
                    <HiXMark size={20} />
                </button>
            )}
            {/* High-Precision SVG Background */}
            <div className="absolute inset-x-0 h-[850px] flex items-center justify-start z-[-1] pointer-events-none">
                <svg width="100" height="100%" viewBox="0 0 100 850" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[15px_0_30px_rgba(99,89,233,0.15)] transition-all duration-500">
                    <path
                        d="M 0,0 
                           V 850 
                           C 0,850 0,790 60,790 
                           H 76 
                           C 88,790 92,778 92,766 
                           V 84 
                           C 92,72 88,60 76,60 
                           H 60 
                           C 0,60 0,0 0,0 
                           Z"
                        fill="#6359E9"
                    />
                </svg>
            </div>

            {/* Sidebar Content Area */}
            <div className="relative w-24 h-[850px] flex flex-col items-center justify-center gap-6 pointer-events-auto py-12 z-10">
                {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const Icon = isActive ? item.solid : item.outline;

                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => handleNavClick(item.id)}
                                className={`relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300
                                        ${isActive ? 'text-[#6359E9] scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] -z-10" />
                                )}

                                <div className="relative">
                                    <Icon size={isActive ? 24 : 26} className="transition-transform duration-300" />

                                    {/* Notification Dot */}
                                    {item.dot && !isActive && (
                                        <span
                                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#6359E9]"
                                            style={{ backgroundColor: item.dot }}
                                        />
                                    )}

                                    {/* PRO Badge */}
                                    {item.badge && !isActive && (
                                        <span className="absolute -top-3 -right-6 px-1.5 py-0.5 bg-[#4ADE10] text-[7px] font-black text-white rounded-full leading-none shadow-sm flex items-center justify-center min-w-[24px] uppercase whitespace-nowrap">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Tooltip */}
                                {!isActive && (
                                    <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 uppercase tracking-widest -translate-x-2 group-hover:translate-x-0">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Logout */}
            <div className="mt-auto pt-6 border-t border-white/10 w-12 flex justify-center">
                <button
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all duration-300"
                    title="Logout"
                >
                    <HiOutlineArrowRightOnRectangle size={24} />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
