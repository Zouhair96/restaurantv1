import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
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
    HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';

const AdminSidebar = ({ activeSection, onSectionChange }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
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
        <aside className="fixed left-0 top-0 h-full w-24 flex flex-col items-center z-50 transition-all duration-300">
            {/* Background Shape */}
            <div className="absolute inset-0 -z-10 group-hover:drop-shadow-2xl transition-all duration-500">
                <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 80 800"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M 0,24 
                           C 0,10 10,0 24,0 
                           H 56 
                           C 70,0 80,10 80,24 
                           V 260 
                           C 80,285 74,300 64,300 
                           V 660 
                           C 74,660 80,675 80,700 
                           V 776 
                           C 80,790 70,800 56,800 
                           H 24 
                           C 10,800 0,790 0,776 
                           L 0,24 
                           Z"
                        fill="#6359E9"
                        className="transition-colors duration-500"
                    />
                </svg>
            </div>

            {/* Sidebar Content */}
            <div className="flex flex-col h-full py-10 w-full items-center">
                {/* Nav Items */}
                <div className="flex-1 w-full flex flex-col items-center gap-4">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        const Icon = isActive ? item.solid : item.outline;

                        return (
                            <div key={item.id} className="relative group">
                                <button
                                    onClick={() => onSectionChange(item.id)}
                                    className={`relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300
                                        ${isActive ? 'text-[#6359E9] scale-105' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] -z-10"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
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
            </div>
        </aside>
    );
};

export default AdminSidebar;
