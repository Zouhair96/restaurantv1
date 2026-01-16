import React from 'react'

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusUpdate, getStatusColor }) => {
    if (!isOpen || !order) return null

    const items = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : {}

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-in">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-yum-primary/10 to-transparent p-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white">Order #{order.id}</h2>
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
                    <div className="flex gap-4">
                        <div className={`flex-1 p-5 rounded-3xl border ${order.order_type === 'dine_in' ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20' : 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20'}`}>
                            <span className="block text-xs font-black uppercase tracking-widest opacity-50 mb-2">Service Type</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{order.order_type === 'dine_in' ? '🍽️' : '🥡'}</span>
                                <span className={`text-xl font-bold ${order.order_type === 'dine_in' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                    {order.order_type === 'dine_in' ? `Dine In • Table ${order.table_number}` : 'Take Out • Delivery'}
                                </span>
                            </div>
                            {order.order_type === 'take_out' && (
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                                    📍 {order.delivery_address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Detailed Items */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Items Summary</h4>
                        <div className="space-y-4">
                            <div className="space-y-4 text-gray-700 dark:text-gray-200">
                                {items.size && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="font-bold">Meal Size</span>
                                        <span className="bg-yum-primary/10 text-yum-primary px-3 py-1 rounded-lg font-black">{items.size.size}</span>
                                    </div>
                                )}
                                {items.friesType && (
                                    <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="font-bold">Fries</span>
                                        <div className="text-right">
                                            <span className="block">{items.friesType}</span>
                                            <span className="text-xs text-gray-400 italic">{items.friesPlacement}</span>
                                        </div>
                                    </div>
                                )}
                                {items.chicken && items.chicken.length > 0 && (
                                    <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="block font-bold mb-2">Chicken Selection</span>
                                        <div className="flex flex-wrap gap-2">
                                            {items.chicken.map(c => <span key={c} className="bg-white dark:bg-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-100 dark:border-gray-600">{c}</span>)}
                                        </div>
                                    </div>
                                )}
                                {items.sauce && items.sauce.length > 0 && (
                                    <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="block font-bold mb-2">Sauces</span>
                                        <div className="flex flex-wrap gap-2">
                                            {items.sauce.map(s => <span key={s} className="bg-white dark:bg-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-100 dark:border-gray-600">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {items.drink && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="font-bold">Beverage</span>
                                        <span>{items.drink}</span>
                                    </div>
                                )}
                                {items.extras && items.extras.length > 0 && (
                                    <div className="py-2">
                                        <span className="block font-bold mb-2">Extras</span>
                                        <div className="flex flex-wrap gap-2">
                                            {items.extras.map(e => <span key={e} className="bg-white dark:bg-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-100 dark:border-gray-600">{e}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment & Action */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                        <div className="text-center md:text-left">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">
                                Total Payment ({order.payment_method?.replace('_', ' ') || 'N/A'})
                            </span>
                            <span className="text-4xl font-black text-yum-primary">${order.total_price || 0}</span>
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Update Order Status</label>
                            <select
                                value={order.status}
                                onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                                className="w-full md:w-48 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white font-black focus:ring-4 focus:ring-yum-primary/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="pending">Pending</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-all border border-gray-200 dark:border-gray-600"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onStatusUpdate(order.id, 'completed')
                        }}
                        className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        Complete Order
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailsModal
