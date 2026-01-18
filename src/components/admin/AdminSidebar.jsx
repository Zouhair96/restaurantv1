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
        <aside className="fixed left-0 top-0 h-full w-24 flex flex-col items-center justify-center z-50 pointer-events-none">
            {/* Sidebar Body with smooth concave corners */}
            <div className="relative w-[76px] py-12 bg-[#6359E9] rounded-r-[2.5rem] shadow-[15px_0_35px_rgba(99,89,233,0.2)] flex flex-col items-center gap-6 pointer-events-auto transition-all duration-500 hover:shadow-[20px_0_45px_rgba(99,89,233,0.3)]">

                {/* Concave Corner Top - Smoother Transition */}
                <div className="absolute -top-[50px] left-0 w-[50px] h-[50px] bg-transparent rounded-bl-[50px] shadow-[0_25px_0_0_#6359E9]"></div>

                {/* Concave Corner Bottom - Smoother Transition */}
                <div className="absolute -bottom-[50px] left-0 w-[50px] h-[50px] bg-transparent rounded-tl-[50px] shadow-[0_-25px_0_0_#6359E9]"></div>

                {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const Icon = isActive ? item.solid : item.outline;

                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => onSectionChange(item.id)}
                                className={`relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                    ${isActive
                                        ? 'w-12 h-12 bg-white rounded-[1.25rem] shadow-[0_8px_20px_rgba(0,0,0,0.12)] text-[#6359E9] scale-110'
                                        : 'w-10 h-10 text-white/70 hover:text-white hover:scale-110 active:scale-95'
                                    }`}
                            >
                                <Icon size={isActive ? 22 : 24} className="transition-transform duration-300" />

                                {/* Notification Dot */}
                                {item.dot && (
                                    <span
                                        className={`absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#6359E9] transition-all duration-300
                                            ${isActive ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                                        style={{ backgroundColor: item.dot }}
                                    ></span>
                                )}

                                {/* PRO Badge */}
                                {item.badge && (
                                    <span className={`absolute left-[85%] top-1/2 -translate-y-1/2 ml-2 px-1.5 py-0.5 bg-[#4ADE80] text-[6.5px] font-black text-white rounded-full tracking-tighter shadow-sm whitespace-nowrap uppercase transition-all duration-300
                                        ${isActive ? 'opacity-0 -translate-x-2' : 'opacity-100'}`}>
                                        {item.badge}
                                    </span>
                                )}

                                {/* Hover Tooltip */}
                                {!isActive && (
                                    <span className="absolute left-full ml-5 px-3 py-2 bg-gray-900/90 backdrop-blur-md text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl border border-white/10 uppercase tracking-[0.1em] -translate-x-2 group-hover:translate-x-0 z-50">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}

                {/* Logout Tool - Polished */}
                <button
                    onClick={handleLogout}
                    className="mt-6 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border-t border-white/5 pt-6 w-full max-w-[40px]"
                    title="Logout"
                >
                    <HiOutlineArrowRightOnRectangle size={22} />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
