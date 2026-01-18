import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPencil, HiTrash, HiPlus } from 'react-icons/hi2';

const ManageMenu = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [menu, setMenu] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMenu();
    }, [slug]);

    const fetchMenu = async () => {
        try {
            const response = await fetch(`/.netlify/functions/get-menu-by-slug?slug=${slug}`);
            if (!response.ok) throw new Error('Menu not found');
            const data = await response.json();
            setMenu(data.menu);
            setItems(data.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Menu Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <HiArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                    Manage: {menu?.menu_name}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Edit menu items, prices, and availability
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/menu/${slug}`)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
                        >
                            View Public Menu
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Add Item Button */}
                <div className="mb-6">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                        <HiPlus size={20} />
                        Add New Item
                    </button>
                </div>

                {/* Items List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                            Menu Items ({items.length})
                        </h2>
                    </div>

                    {items.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">🍽️</div>
                            <p className="text-gray-600 dark:text-gray-400">
                                No items yet. Add your first menu item!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {items.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {item.name}
                                                </h3>
                                                {item.badge && (
                                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.is_available
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {item.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {item.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                <span>Small: €{item.price_small}</span>
                                                <span>•</span>
                                                <span>Medium: €{item.price_medium}</span>
                                                <span>•</span>
                                                <span>Large: €{item.price_large}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                                                <HiPencil size={20} />
                                            </button>
                                            <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                                                <HiTrash size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        💡 <strong>Coming Soon:</strong> Full editing capabilities including adding, editing, and deleting items will be available in the next update!
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ManageMenu;
