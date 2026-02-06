import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

const LiveOrders = ({ onSelectOrder }) => {
    const { searchTerm } = useOutletContext() || { searchTerm: '' }
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [orderTypeFilter, setOrderTypeFilter] = useState('all')
    const [error, setError] = useState(null)

    const playNewOrderSound = () => {
        try {
            // Custom notification sound
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.7;
            audio.play().catch(e => console.warn('Dashboard sound blocked:', e));
        } catch (err) {
            console.error('Audio error:', err);
        }
    }

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

            if (result.orders.length > orders.length) {
                // Determine if there's a new PENDING order specifically
                const newPendingCount = result.orders.filter(o => o.status === 'pending').length;
                const oldPendingCount = orders.filter(o => o.status === 'pending').length;

                if (newPendingCount > oldPendingCount) {
                    playNewOrderSound();
                }
                window.dispatchEvent(new CustomEvent('dashboardRefresh'))
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

    const handleStatusUpdate = async (orderId, newStatus, driver = null) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/update-order-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status: newStatus, driver })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update status')
            }

            // Show policy messages from backend (e.g. cancellation warning)
            if (result.message) {
                alert(result.message);
            }

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus, updated_at: result.order.updated_at } : order
            ))

            // Trigger dashboard-wide refresh
            window.dispatchEvent(new CustomEvent('dashboardRefresh'))

            return result.order
        } catch (err) {
            console.error('Update status error:', err)
            alert(err.message)
            return null
        }
    }

    // Export handleStatusUpdate and getStatusColor via ref or side effect?
    // Let's just expose them if needed, but for now parent can handle its own or we pass it down.
    // Actually, LiveOrders is currently the one managing the list.

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'preparing':
            case 'out_for_delivery': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    // Filter by status, order type, and search term
    const filteredOrders = orders.filter(order => {
        let statusMatch = filter === 'all' || order.status === filter
        // Treat delivery as an extension of preparing for filter purposes
        if (filter === 'preparing' && order.status === 'out_for_delivery') statusMatch = true

        const typeMatch = orderTypeFilter === 'all' || order.order_type === orderTypeFilter

        const search = (searchTerm || '').toLowerCase()
        const searchMatch = !search ||
            (order.order_number?.toString().toLowerCase().includes(search)) ||
            (order.id.toString().toLowerCase().includes(search)) ||
            (order.total_price.toString().includes(search))

        return statusMatch && typeMatch && searchMatch
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

                {/* Filter Buttons Section - Sticky on Scroll */}
                <div className="sticky top-0 z-20 bg-gray-50/80 dark:bg-[#0f172a]/80 backdrop-blur-xl -mx-4 px-4 py-4 mb-2 border-b border-gray-100 dark:border-gray-800 transition-all">
                    <div className="flex flex-col gap-4 w-full">
                        {/* Status Filters - Balanced Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { id: 'pending', label: 'Pending', icon: '🔔', color: 'bg-yellow-500', ringColor: 'ring-yellow-500/20' },
                                { id: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: 'bg-blue-500', ringColor: 'ring-blue-500/20' },
                                { id: 'completed', label: 'Completed', icon: '✅', color: 'bg-green-500', ringColor: 'ring-green-500/20' },
                                { id: 'cancelled', label: 'Cancelled', icon: '❌', color: 'bg-red-500', ringColor: 'ring-red-500/20' }
                            ].map(status => (
                                <button
                                    key={status.id}
                                    onClick={() => setFilter(status.id)}
                                    className={`flex items-center justify-center gap-3 p-3 md:p-4 rounded-xl transition-all transform active:scale-95 shadow-sm border-2 ${filter === status.id
                                        ? `${status.color} text-white border-transparent shadow-lg translate-y-[-1px] ring-4 ${status.ringColor}`
                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-800'
                                        }`}
                                >
                                    <span className="text-xl md:text-2xl">{status.icon}</span>
                                    <span className="uppercase font-bold tracking-wider text-[10px] md:text-xs">{status.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Order Type & Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex gap-2 flex-1">
                                {[
                                    { id: 'dine_in', label: 'Dine In', icon: '🍽️', activeColor: 'bg-indigo-600' },
                                    { id: 'take_out', label: 'Take Out', icon: '🥡', activeColor: 'bg-orange-600' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setOrderTypeFilter(type.id === orderTypeFilter ? 'all' : type.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[10px] transition-all uppercase tracking-widest border-2 ${orderTypeFilter === type.id
                                            ? `${type.activeColor} text-white shadow-md border-transparent`
                                            : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-800 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-base">{type.icon}</span>
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {orderTypeFilter !== 'all' && (
                                <button
                                    onClick={() => setOrderTypeFilter('all')}
                                    className="px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest bg-gray-900 dark:bg-white dark:text-black text-white hover:bg-gray-800 active:scale-95 transition-all"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
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
                    {filteredOrders.filter(order => order).map(order => {
                        return (
                            <div
                                key={order.id}
                                onClick={() => onSelectOrder(order, handleStatusUpdate, getStatusColor)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:border-yum-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                {/* Hover Effect Background */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-yum-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>

                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800 dark:text-white">Order #{order.order_number || order.id}</h3>
                                        <div className="flex flex-col items-start gap-1 mt-1">
                                            <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-sm font-mono font-bold text-gray-700 dark:text-gray-300 transition-colors">
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {order.loyalty_gift_item && (
                                                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-pink-500 text-white animate-pulse">
                                                    🎁 Gift
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)} capitalize`}>
                                            {order.status}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${order.payment_status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            order.payment_status === 'pending_cash' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                            }`}>
                                            {order.payment_status === 'pending_cash' ? 'Cash' : (order.payment_status || 'Unpaid')}
                                        </span>
                                        {order.loyalty_gift_item && (
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-pink-500 text-white animate-pulse">
                                                🎁 Gift Inside
                                            </span>
                                        )}
                                        {parseFloat(order.loyalty_discount_amount || 0) > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-amber-500 text-white">
                                                ⭐ Discount
                                            </span>
                                        )}
                                    </div>
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
        </div>
    )
}

export default LiveOrders
