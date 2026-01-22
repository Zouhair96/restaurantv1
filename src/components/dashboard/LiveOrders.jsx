import React, { useState, useEffect } from 'react'

const LiveOrders = ({ onSelectOrder }) => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [orderTypeFilter, setOrderTypeFilter] = useState('all')
    const [error, setError] = useState(null)

    const playNewOrderSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.warn('Audio play failed (browser policy?):', e));
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
                        {['pending', 'preparing', 'ready', 'completed', 'cancelled'].map(status => (
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
                                onClick={() => onSelectOrder(order, handleStatusUpdate, getStatusColor)}
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
