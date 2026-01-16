import React, { useState, useEffect } from 'react'

const LiveOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [orderTypeFilter, setOrderTypeFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [error, setError] = useState(null)

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('Not authenticated')
                return
            }

            const response = await fetch('/.netlify/functions/get-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch orders')
            }

            setOrders(result.orders)
        } catch (err) {
            console.error('Fetch orders error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchOrders, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/update-order-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status: newStatus })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update status')
            }

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus, updated_at: result.order.updated_at } : order
            ))
        } catch (err) {
            console.error('Update status error:', err)
            alert(err.message)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'ready': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'completed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    // Filter by both status and order type
    const filteredOrders = orders.filter(order => {
        const statusMatch = filter === 'all' || order.status === filter
        const typeMatch = orderTypeFilter === 'all' || order.order_type === orderTypeFilter
        return statusMatch && typeMatch
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yum-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 text-xl mb-4">⚠️ {error}</p>
                <button onClick={fetchOrders} className="px-6 py-2 bg-yum-primary text-white rounded-xl font-bold hover:bg-red-500 transition-colors">
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white">Live Orders</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-col gap-3">
                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-2">
                        {['pending', 'preparing', 'ready', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all capitalize ${filter === status
                                    ? 'bg-yum-primary text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Order Type Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setOrderTypeFilter('dine_in')}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${orderTypeFilter === 'dine_in'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            Dine In
                        </button>
                        <button
                            onClick={() => setOrderTypeFilter('take_out')}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${orderTypeFilter === 'take_out'
                                ? 'bg-orange-600 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            Take Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-400 text-xl">📋 No {filter !== 'all' ? filter : ''} orders yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map(order => {
                        return (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:border-yum-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                {/* Hover Effect Background */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-yum-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>

                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800 dark:text-white">Order #{order.id}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)} capitalize`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Order Type Badge */}
                                <div className="mb-4 relative z-10">
                                    {order.order_type === 'dine_in' ? (
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                            <span className="text-sm">🍽️</span>
                                            <span className="font-bold text-xs">Table {order.table_number}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                            <span className="text-sm">🥡</span>
                                            <span className="font-bold text-xs">Take Out</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total Price */}
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-2">
                                        {/* Show 3 dots to indicate more details */}
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Details</span>
                                    </div>
                                    <span className="text-2xl font-black text-yum-primary">${order.total_price}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-yum-primary/10 to-transparent p-8 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-black text-gray-800 dark:text-white">Order #{selectedOrder.id}</h2>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold">
                                    {new Date(selectedOrder.created_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
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
                                <div className={`flex-1 p-5 rounded-3xl border ${selectedOrder.order_type === 'dine_in' ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20' : 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20'}`}>
                                    <span className="block text-xs font-black uppercase tracking-widest opacity-50 mb-2">Service Type</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{selectedOrder.order_type === 'dine_in' ? '🍽️' : '🥡'}</span>
                                        <span className={`text-xl font-bold ${selectedOrder.order_type === 'dine_in' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                            {selectedOrder.order_type === 'dine_in' ? `Dine In • Table ${selectedOrder.table_number}` : 'Take Out • Delivery'}
                                        </span>
                                    </div>
                                    {selectedOrder.order_type === 'take_out' && (
                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                                            📍 {selectedOrder.delivery_address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Items */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Items Summary</h4>
                                <div className="space-y-4">
                                    {(() => {
                                        const items = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items
                                        return (
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
                                        )
                                    })()}
                                </div>
                            </div>

                            {/* Payment & Action */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                                <div className="text-center md:text-left">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Total Payment ({selectedOrder.payment_method.replace('_', ' ')})</span>
                                    <span className="text-4xl font-black text-yum-primary">${selectedOrder.total_price}</span>
                                </div>
                                <div className="w-full md:w-auto">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Update Order Status</label>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => {
                                            handleStatusUpdate(selectedOrder.id, e.target.value)
                                            setSelectedOrder({ ...selectedOrder, status: e.target.value })
                                        }}
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
                                onClick={() => setSelectedOrder(null)}
                                className="px-8 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-all border border-gray-200 dark:border-gray-600"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleStatusUpdate(selectedOrder.id, 'completed')
                                    setSelectedOrder(null)
                                }}
                                className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                Complete Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LiveOrders
