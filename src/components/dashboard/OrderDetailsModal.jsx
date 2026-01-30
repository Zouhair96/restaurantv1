import React, { useState } from 'react'
import { HiOutlineBan, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi'

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusUpdate, getStatusColor = () => '' }) => {

    if (!isOpen || !order) return null

    const items = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : {}


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in custom-scrollbar overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-in relative">

                {/* Modal Header */}
                <div className="bg-gradient-to-r from-yum-primary/10 to-transparent p-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white">Order #{order.order_number || String(order.id).slice(0, 8)}</h2>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-lg transition-all hover:scale-110 active:scale-95 border border-gray-100 dark:border-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Order Context */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className={`flex-1 p-5 rounded-3xl border ${order.order_type === 'dine_in' ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20' : 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20'}`}>
                            <span className="block text-xs font-black uppercase tracking-widest opacity-50 mb-2">Service Type</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{order.order_type === 'dine_in' ? '🍽️' : '🥡'}</span>
                                <span className={`text-xl font-bold ${order.order_type === 'dine_in' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                    {order.order_type === 'dine_in' ? `Dine In • Table ${order.table_number}` : 'Take Out • Delivery'}
                                </span>
                            </div>
                            {order.order_type === 'take_out' && (
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 p-3 rounded-xl line-clamp-1">
                                    📍 {order.delivery_address}
                                </p>
                            )}
                        </div>

                        <div className={`flex-1 p-5 rounded-3xl border ${order.payment_status === 'paid' ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20' : 'bg-gray-50/50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700'}`}>
                            <span className="block text-xs font-black uppercase tracking-widest opacity-50 mb-2">Payment Info</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{order.payment_status === 'paid' ? '💰' : '🕒'}</span>
                                <div>
                                    <span className={`text-xl font-bold ${order.payment_status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {order.payment_status === 'paid' ? 'Paid Online' : order.payment_status === 'pending_cash' ? 'Pay in Cash' : 'Unpaid'}
                                    </span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Total: ${order.total_price} • Comm: ${order.commission_amount || (order.total_price * 0.02).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Detailed Items */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Items Summary</h4>
                        <div className="space-y-4">
                            {(Array.isArray(items) ? items : [items]).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-xs font-bold shadow-sm">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-lg font-black text-gray-900 dark:text-white capitalize">
                                                {item.name || (item.size?.size ? `${item.size.size} Menu` : 'Taco Selection')}
                                            </p>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {[
                                                    item.friesType && `🍟 ${item.friesType}`,
                                                    item.drink && `🥤 ${item.drink}`,
                                                    ...(item.sauce || []),
                                                    ...(item.chicken || [])
                                                ].filter(Boolean).join(' • ')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">${item.price || item.size?.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 justify-end">
                    {/* Dynamic Main Action Button */}
                    {/* Pending -> Preparing */}
                    {order.status === 'pending' && (
                        <button
                            onClick={() => onStatusUpdate(order.id, 'preparing')}
                            className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            👨‍🍳 Start Preparing
                        </button>
                    )}

                    {/* Preparing -> Complete (Dine In) */}
                    {order.status === 'preparing' && order.order_type === 'dine_in' && (
                        <button
                            onClick={() => onStatusUpdate(order.id, 'completed')}
                            className="flex-1 md:flex-none px-8 py-3 bg-green-500 text-white hover:bg-green-600 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            ✅ Complete Order
                        </button>
                    )}

                    {/* Preparing -> Out for Delivery (Take Out) */}
                    {order.status === 'preparing' && order.order_type === 'take_out' && (
                        <button
                            onClick={() => onStatusUpdate(order.id, 'out_for_delivery')}
                            className="flex-1 md:flex-none px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            🚚 Out for Delivery
                        </button>
                    )}

                    {/* Delivering -> Completed */}
                    {order.status === 'out_for_delivery' && (
                        <button
                            onClick={() => onStatusUpdate(order.id, 'completed')}
                            className="flex-1 md:flex-none px-8 py-3 bg-green-500 text-white hover:bg-green-600 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            ✅ Complete Order
                        </button>
                    )}

                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to CANCEL this order? This action cannot be undone.')) {
                                    onStatusUpdate(order.id, 'cancelled');
                                }
                            }}
                            className="flex-1 md:flex-none px-8 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-2xl font-black hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
                        >
                            <HiOutlineBan className="inline-block mr-2 text-lg" />
                            Cancel Order
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-all border border-gray-200 dark:border-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div >
    )
}

export default OrderDetailsModal
