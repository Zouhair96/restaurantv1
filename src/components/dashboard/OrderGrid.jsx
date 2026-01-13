import React, { useState } from 'react'

const OrderGrid = () => {
    // Mock Data
    const [orders, setOrders] = useState([
        { id: '101', table: 'T4', items: ['Spicy ramen', 'Gyoza'], status: 'new', time: '2m', color: 'border-green-500 bg-green-900/20' },
        { id: '102', table: 'T2', items: ['Dragon Roll', 'Miso Soup'], status: 'prep', time: '12m', color: 'border-yellow-500 bg-yellow-900/20' },
        { id: '103', table: 'T7', items: ['Poke Bowl', 'Green Tea'], status: 'ready', time: '18m', color: 'border-blue-500 bg-blue-900/20' },
        { id: '104', table: 'T1', items: ['Sashimi Deluxe'], status: 'delayed', time: '35m', color: 'border-red-500 bg-red-900/20 animate-pulse' },
        { id: '105', table: 'T5', items: ['Tempura Udol'], status: 'new', time: '1m', color: 'border-green-500 bg-green-900/20' },
    ])

    const handleAction = (id, action) => {
        // Logic to update order status
        console.log(`Order ${id} action: ${action}`)
        if (action === 'ready') {
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'ready', color: 'border-blue-500 bg-blue-900/20' } : o))
        }
        if (action === 'problem') {
            alert(`Problem reported for Order #${id}. Triggering resolution protocol...`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-3 h-8 bg-yum-primary rounded-full block"></span>
                    Live Orders
                </h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400 border border-gray-700">All (5)</span>
                    <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-900">New (2)</span>
                    <span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 border border-red-900">Delayed (1)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <div key={order.id} className={`glass-panel p-5 rounded-2xl border-l-4 relative group hover:scale-[1.02] transition-transform duration-300 ${order.color}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">#{order.id}</h3>
                                <p className="text-sm text-gray-400">Table {order.table}</p>
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-black/40 text-sm font-mono font-bold text-white">
                                {order.time}
                            </span>
                        </div>

                        <div className="space-y-2 mb-6">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center text-gray-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-auto">
                            {order.status !== 'ready' && (
                                <button
                                    onClick={() => handleAction(order.id, 'ready')}
                                    className="flex-1 bg-gray-800 hover:bg-green-600 hover:text-white text-gray-300 py-2 rounded-xl text-sm font-bold transition-all border border-gray-700 hover:border-green-500"
                                >
                                    Done
                                </button>
                            )}
                            <button
                                onClick={() => handleAction(order.id, 'problem')}
                                className="px-4 py-2 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-700 hover:border-red-500"
                                title="Report Problem"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </button>
                        </div>

                        {/* Drag Handle Simulation */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-move text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderGrid
