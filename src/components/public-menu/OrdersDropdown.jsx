import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserCircle, HiOutlineLogout, HiOutlineLogin, HiOutlineClipboardList, HiOutlineUserAdd, HiOutlineShoppingBag } from 'react-icons/hi';
import { HiXMark, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { useClientAuth } from '../../context/ClientAuthContext';
import { translations } from '../../translations';
import PersistentOrderTracker from '../PersistentOrderTracker';

const OrdersDropdown = ({ isOpen, onClose, restaurantName, displayName, themeColor = '#f97316' }) => {
    const { user: clientUser, activeOrderId, activeOrder, handleCloseTracker, logout } = useClientAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [language] = useState('fr'); // Default to French as in sidebar
    const dropdownRef = useRef(null);

    const t = translations[language]?.auth || translations['fr'].auth;
    const headerT = translations[language]?.header || translations['fr'].header;

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && clientUser) {
            fetchOrders();
        }
    }, [isOpen, clientUser]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('client_token');
            if (!token) return;
            const response = await fetch(`/.netlify/functions/get-client-orders?restaurantName=${encodeURIComponent(restaurantName)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 pointer-events-none">
            {/* Backdrop for mobile */}
            <div
                className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="relative mx-auto md:mx-0 w-[95%] max-w-sm md:w-96 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden pointer-events-auto mt-20 md:mt-0"
            >
                {/* Header with Title & Close */}
                <div className="p-5 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                            <HiOutlineClipboardDocumentList size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{headerT.myOrders}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{displayName || restaurantName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <HiXMark size={24} />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Ongoing Order - STICKY TOP */}
                    {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
                        <div className="sticky top-0 z-20 shadow-md">
                            <PersistentOrderTracker
                                order={activeOrder}
                                onClose={handleCloseTracker}
                                themeColor={themeColor}
                                inline={true}
                                noHeader={true}
                            />
                        </div>
                    )}

                    {!clientUser ? (
                        <div className="p-8 text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                                <HiOutlineUserCircle size={40} />
                            </div>
                            <h4 className="font-black text-gray-900 dark:text-white text-lg mb-2">Connect to Track</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-4">Login to view your full order history and earn rewards.</p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('openClientAuth'))}
                                className="w-full py-3 text-white font-black rounded-xl shadow-lg transition-transform active:scale-95"
                                style={{ backgroundColor: themeColor }}
                            >
                                {t.submitLogin}
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {/* Profile Bar */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-2">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{clientUser.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate uppercase tracking-widest font-black">{clientUser.email}</p>
                                </div>
                                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <HiOutlineLogout size={20} />
                                </button>
                            </div>

                            {/* History List */}
                            <div className="space-y-3">
                                {orders.length > 0 ? orders.map(order => (
                                    <div key={order.id} className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-black text-gray-900 dark:text-white text-sm">#{String(order.id).slice(0, 8)}</span>
                                                <span className="block text-[10px] text-gray-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <span
                                                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                                style={order.status === 'completed' ? { backgroundColor: '#22c55e20', color: '#22c55e' } :
                                                    order.status === 'cancelled' ? { backgroundColor: '#ef444420', color: '#ef4444' } :
                                                        { backgroundColor: `${themeColor}20`, color: themeColor }}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                                                {order.order_type === 'dine_in' ? '🍽️ Dine In' : '🥡 Take Out'}
                                            </span>
                                            <span className="font-black text-lg text-gray-900 dark:text-white">${Number(order.total_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center">
                                        <HiOutlineShoppingBag size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
                                        <p className="text-gray-400 text-sm italic">{t.noOrders}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default OrdersDropdown;
