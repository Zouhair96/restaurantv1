import React, { useState, useEffect } from 'react'

const LiveOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [orderTypeFilter, setOrderTypeFilter] = useState('all')
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
                        {['all', 'pending', 'preparing', 'ready', 'completed'].map(status => (
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredOrders.map(order => {
                        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                        return (
                            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800 dark:text-white">Order #{order.id}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} capitalize`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Order Type Badge */}
                                <div className="mb-4">
                                    {order.order_type === 'dine_in' ? (
                                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-900/30">
                                            <span className="text-lg">🍽️</span>
                                            <span className="font-bold text-sm">Dine In - Table {order.table_number}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-900/30">
                                            <span className="text-lg">🥡</span>
                                            <div>
                                                <span className="font-bold text-sm block">Take Out</span>
                                                <span className="text-xs opacity-75">{order.delivery_address}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-2">Order Details:</h4>
                                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                        {items.size && <p>• Size: <span className="font-bold">{items.size.size}</span></p>}
                                        {items.friesType && <p>• Fries: {items.friesType} {items.friesPlacement && `(${items.friesPlacement})`}</p>}
                                        {items.chicken && items.chicken.length > 0 && <p>• Chicken: {items.chicken.join(', ')}</p>}
                                        {items.sauce && items.sauce.length > 0 && <p>• Sauce: {items.sauce.join(', ')}</p>}
                                        {items.drink && <p>• Drink: {items.drink}</p>}
                                        {items.extras && items.extras.length > 0 && <p>• Extras: {items.extras.join(', ')}</p>}
                                    </div>
                                </div>

                                {/* Payment & Total */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Payment: <span className="font-bold capitalize">{order.payment_method.replace('_', ' ')}</span>
                                    </span>
                                    <span className="text-2xl font-black text-yum-primary">${order.total_price}</span>
                                </div>

                                {/* Status Update Dropdown */}
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-yum-primary"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="ready">Ready</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default LiveOrders
