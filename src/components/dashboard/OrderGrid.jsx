import React, { useState, useEffect } from 'react'

const OrderGrid = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null) // For driver modal
    const [driverName, setDriverName] = useState('')
    const [driverPhone, setDriverPhone] = useState('')

    useEffect(() => {
        fetchOrders()
        const interval = setInterval(fetchOrders, 10000)
        return () => clearInterval(interval)
    }, [])

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch('/.netlify/functions/get-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                const activeOrders = (data.orders || []).filter(o => o.status !== 'completed' && o.status !== 'cancelled')
                setOrders(activeOrders)
            }
        } catch (error) {
            console.error('Failed to fetch orders', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (orderId, status, driver = null) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/update-order-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status, driver })
            })

            if (response.ok) {
                fetchOrders() // Refresh immediately
                setSelectedOrder(null) // Close modal if open
                setDriverName('')
                setDriverPhone('')
            }
        } catch (error) {
            console.error('Update failed', error)
        }
    }

    const openDriverModal = (order) => {
        setSelectedOrder(order)
        setDriverName('')
        setDriverPhone('')
    }

    const assignDriver = () => {
        if (!selectedOrder || !driverName) return
        handleUpdateStatus(selectedOrder.id, 'out_for_delivery', {
            name: driverName,
            phone: driverPhone
        })
    }

    const getStatusColor = (status) => {
        const map = {
            'pending': 'border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/40',
            'preparing': 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/40',
            'ready': 'border-green-400 bg-green-50 dark:bg-green-500/10 dark:border-green-500/40',
            'out_for_delivery': 'border-purple-400 bg-purple-50 dark:bg-purple-500/10 dark:border-purple-500/40',
            'delayed': 'border-red-400 bg-red-50 dark:bg-red-500/10 dark:border-red-500/40 animate-pulse'
        }
        return map[status] || map['pending']
    }

    if (loading) return <div className="p-10 text-center text-gray-400">Loading orders...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3 transition-colors">
                    <span className="w-3 h-8 bg-yum-primary rounded-full block"></span>
                    Live Orders
                </h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                        {orders.length} Active
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <div key={order.id} className={`bg-white dark:bg-gray-800/40 dark:backdrop-blur-md p-5 rounded-[2rem] border-l-4 relative group hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-xl dark:shadow-none ${getStatusColor(order.status)}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">#{String(order.id).slice(0, 8)}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {order.order_type === 'take_out' ? '🥡 Take Out' : `🍽️ Table ${order.table_number}`}
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-sm font-mono font-bold text-gray-700 dark:text-gray-300 transition-colors">
                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div className="space-y-2 mb-6">
                            {(order.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center text-gray-600 dark:text-gray-400 text-sm transition-colors">
                                    <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full mr-2"></span>
                                    {item.name || item.id || 'Item'}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-auto">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30"
                                >
                                    Start Preparing
                                </button>
                            )}

                            {order.status === 'preparing' && (
                                <button
                                    onClick={() => order.order_type === 'take_out' ? openDriverModal(order) : handleUpdateStatus(order.id, 'ready')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/30"
                                >
                                    {order.order_type === 'take_out' ? 'Assign Driver' : 'Mark Ready'}
                                </button>
                            )}

                            {order.status === 'out_for_delivery' && (
                                <div className="flex-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 py-2 rounded-xl text-sm font-bold text-center border border-purple-200 dark:border-purple-500/30">
                                    🚗 {order.driver_name}
                                </div>
                            )}

                            {(order.status === 'ready' || order.status === 'out_for_delivery') && (
                                <button
                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 py-2 rounded-xl text-sm font-bold transition-all"
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        No active orders right now.
                    </div>
                )}
            </div>

            {/* Driver Assignment Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-white/10">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Assign Driver</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Who is delivering Order #{String(selectedOrder.id).slice(0, 8)}?</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Driver Name</label>
                                <input
                                    type="text"
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yum-primary"
                                    placeholder="e.g. John Doe"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone (Optional)</label>
                                <input
                                    type="text"
                                    value={driverPhone}
                                    onChange={(e) => setDriverPhone(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yum-primary"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={assignDriver}
                                className="flex-1 px-6 py-3 bg-yum-primary text-white rounded-xl font-bold hover:bg-yum-primary/90 transition-colors shadow-lg shadow-orange-500/20"
                            >
                                Assign & Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderGrid
