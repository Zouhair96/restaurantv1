import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Simulator = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pos');
    const [integrationSettings, setIntegrationSettings] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const [ordersRes, itemsRes, settingsRes] = await Promise.all([
                fetch(`/.netlify/functions/get-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/.netlify/functions/menus`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/.netlify/functions/get-integration-settings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData.orders || []);
            }

            if (itemsRes.ok) {
                const menus = await itemsRes.json();
                if (Array.isArray(menus)) {
                    // Extract items from all menus for simulation
                    const allItems = menus.reduce((acc, menu) => {
                        const config = menu.config || {};

                        // 1. Handle Category-based menus (if any)
                        if (config.categories) {
                            config.categories.forEach(cat => {
                                if (cat.items) {
                                    cat.items.forEach(item => {
                                        acc.push({
                                            id: item.id || `item-${item.name}`,
                                            name: item.name,
                                            is_available: item.is_available !== false,
                                            menuId: menu.id,
                                            source: 'categories'
                                        });
                                    });
                                }
                            });
                        }

                        // 2. Handle Dynamic (Step-by-Step) menus
                        const dynamicSections = [
                            { key: 'sizes', label: 'Size' },
                            { key: 'mealsOption', label: 'Meal' },
                            { key: 'saucesOption', label: 'Sauce' },
                            { key: 'drinksOption', label: 'Drink' },
                            { key: 'extrasOption', label: 'Extra' },
                            { key: 'friesOption', label: 'Fries' }
                        ];

                        dynamicSections.forEach(section => {
                            const data = config[section.key];
                            if (Array.isArray(data)) {
                                data.forEach((item, idx) => {
                                    // Item might be a string or object
                                    const isObj = typeof item === 'object' && item !== null;
                                    const name = isObj ? (item.size || item.name || 'Unnamed') : item;
                                    const id = isObj ? (item.id || `${section.key}-${idx}`) : `${section.key}-${item}`;

                                    acc.push({
                                        id: id,
                                        name: `${section.label}: ${name}`,
                                        is_available: isObj ? (item.is_available !== false) : true, // Default true for strings
                                        menuId: menu.id,
                                        source: 'dynamic',
                                        section: section.key,
                                        originalItem: item
                                    });
                                });
                            }
                        });

                        return acc;
                    }, []);
                    setMenuItems(allItems);
                }
            }

            if (settingsRes.ok) {
                setIntegrationSettings(await settingsRes.json());
            }
        } catch (error) {
            console.error('Error fetching simulator data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulatePOS = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/simulate-pos-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status: newStatus })
            });
            if (response.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                const err = await response.json();
                alert(err.error || 'POS simulation failed');
            }
        } catch (error) {
            console.error('POS simulation error:', error);
        }
    };

    const handleSimulateStock = async (itemId, isAvailable) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/simulate-stock-sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ itemId, isAvailable })
            });
            if (response.ok) {
                setMenuItems(menuItems.map(item => item.id === itemId ? { ...item, is_available: isAvailable } : item));
            } else {
                const err = await response.json();
                alert(err.error || 'Stock simulation failed');
            }
        } catch (error) {
            console.error('Stock simulation error:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Simulator...</div>;

    const isPosConfigured = integrationSettings?.pos_enabled &&
        integrationSettings?.pos_webhook_url &&
        integrationSettings?.pos_api_key;

    const isStockConfigured = integrationSettings?.stock_enabled &&
        integrationSettings?.stock_sync_url &&
        integrationSettings?.stock_api_key;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 text-center sm:text-left">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Integration Simulator</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">Test how your platform reacts to external events from your configured tools.</p>
                </header>

                <div className="flex flex-wrap gap-4 mb-10 justify-center sm:justify-start">
                    <button
                        onClick={() => setActiveTab('pos')}
                        className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'pos'
                            ? 'bg-yum-primary text-white shadow-xl shadow-red-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white border border-gray-100 dark:border-gray-700'}`}
                    >
                        POS Terminal
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'stock'
                            ? 'bg-yum-primary text-white shadow-xl shadow-red-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white border border-gray-100 dark:border-gray-700'}`}
                    >
                        Stock Manager
                    </button>
                </div>

                {!isPosConfigured && activeTab === 'pos' && (
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-2xl animate-scale-up">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔌</div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">POS Not Configured</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">Please enable POS integration and provide a Webhook URL and API Key in the Settings tab to use the simulator.</p>
                    </div>
                )}

                {!isStockConfigured && activeTab === 'stock' && (
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-2xl animate-scale-up">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📦</div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Stock Tool Not Configured</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">Please enable Stock Management and provide a Sync URL and API Key in the Settings tab to use the simulator.</p>
                    </div>
                )}

                {isPosConfigured && activeTab === 'pos' && (
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-scale-up">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-widest">Incoming Orders</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/30 text-left border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-8 py-6 text-sm font-black text-gray-900 dark:text-white">#{order.id}</td>
                                            <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400">
                                                {Array.isArray(order.items) ? order.items.map(i => i.name).join(', ') : 'No items'}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right space-x-2">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleSimulatePOS(order.id, 'preparing')}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <button
                                                        onClick={() => handleSimulatePOS(order.id, 'ready')}
                                                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Ready
                                                    </button>
                                                )}
                                                {['ready', 'preparing'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleSimulatePOS(order.id, 'completed')}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Done
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-bold italic">No active orders to simulate.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {isStockConfigured && activeTab === 'stock' && (
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-scale-up">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-widest">Inventory Management</h2>
                        </div>
                        <div className="p-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {menuItems.map(item => (
                                <div key={item.id} className="p-6 bg-gray-50/50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-600 flex items-center justify-between group">
                                    <div className="mr-4">
                                        <h3 className="font-black text-gray-800 dark:text-white mb-1 transition-colors group-hover:text-yum-primary">{item.name}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{item.id}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSimulateStock(item.id, !item.is_available)}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${item.is_available
                                            ? 'bg-green-100/50 border-green-500 text-green-700 hover:bg-yum-primary hover:border-yum-primary hover:text-white'
                                            : 'bg-red-100/50 border-red-500 text-red-700 hover:bg-green-500 hover:border-green-500 hover:text-white'
                                            }`}
                                    >
                                        {item.is_available ? 'Active' : 'Out'}
                                    </button>
                                </div>
                            ))}
                            {menuItems.length === 0 && (
                                <div className="col-span-full py-16 text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[2rem]">No menu items found. Please create a menu first.</div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Simulator;
