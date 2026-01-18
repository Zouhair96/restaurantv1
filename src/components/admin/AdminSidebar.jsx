import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineSquares2X2,
    HiSquares2X2,
    HiOutlineUser,
    HiOutlineChartPie,
    HiOutlineBell,
    HiOutlineCalendarDays,
    HiOutlineEnvelope,
    HiOutlinePencilSquare,
    HiOutlineChatBubbleOvalLeft,
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
        { id: 'dashboard', icon: HiSquares2X2, label: 'Dashboard' },
        { id: 'users', icon: HiOutlineUser, label: 'Users' },
        { id: 'analytics', icon: HiOutlineChartPie, label: 'Analytics', badge: 'PRO' },
        { id: 'notifications', icon: HiOutlineBell, label: 'Notifications' },
        { id: 'calendar', icon: HiOutlineCalendarDays, label: 'Calendar' },
        { id: 'inbox', icon: HiOutlineEnvelope, label: 'Inbox', dot: '#FACC15' },
        { id: 'editor', icon: HiOutlinePencilSquare, label: 'Editor' },
        { id: 'chat', icon: HiOutlineChatBubbleOvalLeft, label: 'Chat', dot: '#22D3EE' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-24 flex flex-col items-center justify-center z-50">
            {/* Sidebar Active Segment with Concave Corners */}
            <div className="relative w-20 py-10 bg-[#6359E9] rounded-r-[3rem] shadow-[20px_0_50px_rgba(99,89,233,0.1) flex flex-col items-center gap-7">

                {/* Concave Corner Top */}
                <div className="absolute -top-[40px] left-0 w-[40px] h-[40px] bg-transparent rounded-bl-[40px] shadow-[0_20px_0_0_#6359E9]"></div>

                {/* Concave Corner Bottom */}
                <div className="absolute -bottom-[40px] left-0 w-[40px] h-[40px] bg-transparent rounded-tl-[40px] shadow-[0_-20px_0_0_#6359E9]"></div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    const isDashboard = item.id === 'dashboard';

                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => onSectionChange(item.id)}
                                className={`relative flex items-center justify-center transition-all duration-300
                                    ${isDashboard
                                        ? 'w-11 h-11 bg-white rounded-2xl shadow-lg text-[#6359E9]'
                                        : 'w-10 h-10 text-white/80 hover:text-white'
                                    }`}
                            >
                                <Icon size={isDashboard ? 20 : 24} />

                                {/* Notification Dot */}
                                {item.dot && (
                                    <span
                                        className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-[#6359E9]"
                                        style={{ backgroundColor: item.dot }}
                                    ></span>
                                )}

                                {/* PRO Badge */}
                                {item.badge && (
                                    <span className="absolute left-[85%] top-1/2 -translate-y-1/2 ml-1 px-1.5 py-0.5 bg-[#4ADE80] text-[6.5px] font-black text-white rounded-full tracking-tighter shadow-sm whitespace-nowrap uppercase">
                                        {item.badge}
                                    </span>
                                )}

                                {/* Hover Tooltip */}
                                {!isActive && (
                                    <span className="absolute left-full ml-5 px-3 py-1.5 bg-[#1C1C1E]/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/5 uppercase tracking-widest z-50">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}

                {/* Logout Tool in the same segment */}
                <button
                    onClick={handleLogout}
                    className="mt-4 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-all transform hover:scale-110 border-t border-white/10 pt-4"
                    title="Logout"
                >
                    <HiOutlineArrowRightOnRectangle size={22} />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
