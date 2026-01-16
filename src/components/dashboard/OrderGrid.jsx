import React, { useState } from 'react'

const OrderGrid = () => {
    // Mock Data
    const [orders, setOrders] = useState([
        { id: '101', table: 'T4', items: ['Spicy ramen', 'Gyoza'], status: 'new', time: '2m', color: 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500/50' },
        { id: '102', table: 'T2', items: ['Dragon Roll', 'Miso Soup'], status: 'prep', time: '12m', color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-500/50' },
        { id: '103', table: 'T7', items: ['Poke Bowl', 'Green Tea'], status: 'ready', time: '18m', color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500/50' },
        { id: '104', table: 'T1', items: ['Sashimi Deluxe'], status: 'delayed', time: '35m', color: 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500/50 animate-pulse' },
        { id: '105', table: 'T5', items: ['Tempura Udol'], status: 'new', time: '1m', color: 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500/50' },
    ])

    const handleAction = (id, action) => {
        // Logic to update order status
        console.log(`Order ${id} action: ${action}`)
        if (action === 'ready') {
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'ready', color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500/50' } : o))
        }
        if (action === 'problem') {
            alert(`Problem reported for Order #${id}. Triggering resolution protocol...`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3 transition-colors">
                    <span className="w-3 h-8 bg-yum-primary rounded-full block"></span>
                    Live Orders
                </h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">All (5)</span>
                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 transition-colors">New (2)</span>
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors">Delayed (1)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <div key={order.id} className={`bg-white dark:bg-gray-800 p-5 rounded-[2rem] border-l-4 relative group hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-xl dark:shadow-none ${order.color}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">#{order.id}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Table {order.table}</p>
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-black/30 text-sm font-mono font-bold text-gray-700 dark:text-gray-300 transition-colors">
                                {order.time}
                            </span>
                        </div>

                        <div className="space-y-2 mb-6">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center text-gray-600 dark:text-gray-300 text-sm transition-colors">
                                    <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-auto">
                            {order.status !== 'ready' && (
                                <button
                                    onClick={() => handleAction(order.id, 'ready')}
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 hover:bg-green-500 hover:text-white text-gray-600 dark:text-gray-300 py-2 rounded-xl text-sm font-bold transition-all border border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500"
                                >
                                    Done
                                </button>
                            )}
                            <button
                                onClick={() => handleAction(order.id, 'problem')}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-red-500 text-gray-400 dark:text-gray-400 hover:text-white rounded-xl transition-all border border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500"
                                title="Report Problem"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderGrid
