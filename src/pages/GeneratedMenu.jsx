import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiShoppingCart, HiMagnifyingGlass } from 'react-icons/hi2';
import { useCart } from '../context/CartContext';
import MenuItem from '../components/menu/MenuItem';
import Cart from '../components/menu/Cart';
import Checkout from '../components/menu/Checkout';

const GeneratedMenu = () => {
    const { slug } = useParams();
    const { toggleCart, getCartCount } = useCart();
    const [menu, setMenu] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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

    const categories = [
        { id: 'all', label: 'All', icon: '🍕' },
        { id: 'classic', label: 'Classic', icon: '⭐' },
        { id: 'premium', label: 'Premium', icon: '👑' },
        { id: 'special', label: 'Special', icon: '🔥' },
    ];

    const filteredItems = items.filter((item) => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleCheckout = () => {
        toggleCart();
        setIsCheckoutOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Menu Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">🍕</div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {menu?.menu_name || 'Menu'}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Digital Menu
                                </p>
                            </div>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={toggleCart}
                            className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            <HiShoppingCart size={24} />
                            <span className="hidden sm:inline">Cart</span>
                            {getCartCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                                    {getCartCount()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        Our Delicious Menu
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Choose from our selection of artisan dishes
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md mx-auto">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:scale-105'
                                }`}
                        >
                            <span>{category.icon}</span>
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😕</div>
                        <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                            No items found
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 mt-2">
                            Try another search or category
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <MenuItem key={item.id} item={{
                                ...item,
                                prices: {
                                    small: item.price_small,
                                    medium: item.price_medium,
                                    large: item.price_large,
                                }
                            }} />
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Sidebar */}
            <Cart onCheckout={handleCheckout} />

            {/* Checkout Modal */}
            <Checkout isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
        </div>
    );
};

export default GeneratedMenu;
