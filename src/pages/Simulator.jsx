import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Simulator = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pos');

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [ordersRes, itemsRes] = await Promise.all([
                fetch(`/.netlify/functions/get-orders?restaurantId=${user.id}`),
                fetch(`/.netlify/functions/menus?userId=${user.id}`)
            ]);

            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (itemsRes.ok) {
                const menus = await itemsRes.json();
                // Extract items from first menu for simulation
                const allItems = menus.reduce((acc, menu) => {
                    const categories = menu.config?.categories || [];
                    const items = categories.flatMap(cat => cat.items || []);
                    return [...acc, ...items];
                }, []);
                setMenuItems(allItems);
            }
        } catch (error) {
            console.error('Error fetching simulator data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulatePOS = async (orderId, newStatus) => {
        try {
            const response = await fetch('/.netlify/functions/simulate-pos-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus, restaurantId: user.id })
            });
            if (response.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error('POS simulation error:', error);
        }
    };

    const handleSimulateStock = async (itemId, isAvailable) => {
        try {
            const response = await fetch('/.netlify/functions/simulate-stock-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, isAvailable, restaurantId: user.id })
            });
            if (response.ok) {
                setMenuItems(menuItems.map(item => item.id === itemId ? { ...item, is_available: isAvailable } : item));
            }
        } catch (error) {
            console.error('Stock simulation error:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Simulator...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Integration Simulator</h1>
                    <p className="text-gray-600 dark:text-gray-400">Test how your platform reacts to "fake" external events from POS and Stock systems.</p>
                </header>

                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab('pos')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'pos' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                    >
                        Fake POS Terminal
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'stock' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                    >
                        Fake Stock Management
                    </button>
                </div>

                {activeTab === 'pos' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Incoming Orders (Kitchen View)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/30 text-left">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Current Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {Array.isArray(order.items) ? order.items.map(i => i.name).join(', ') : 'No items'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleSimulatePOS(order.id, 'preparing')}
                                                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <button
                                                        onClick={() => handleSimulatePOS(order.id, 'ready')}
                                                        className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                                                    >
                                                        Ready
                                                    </button>
                                                )}
                                                {['ready', 'preparing'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleSimulatePOS(order.id, 'completed')}
                                                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No active orders to simulate.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Inventory Management (External Tool)</h2>
                        </div>
                        <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {menuItems.map(item => (
                                <div key={item.id} className="p-4 border dark:border-gray-700 rounded-lg flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                                        <p className="text-xs text-gray-500">{item.id}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSimulateStock(item.id, !item.is_available)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${item.is_available
                                                ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                                                : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'
                                            }`}
                                    >
                                        {item.is_available ? 'In Stock' : 'Out of Stock'}
                                    </button>
                                </div>
                            ))}
                            {menuItems.length === 0 && (
                                <div className="col-span-full py-8 text-center text-gray-500">No menu items found. Please create a menu first.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Simulator;
