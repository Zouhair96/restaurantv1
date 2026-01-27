import React, { useState, useEffect } from 'react';
import { HiShoppingCart, HiMagnifyingGlass, HiMinus, HiPlus, HiXMark, HiStar, HiPhone, HiMapPin, HiClock } from 'react-icons/hi2';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const PublicMenuTestemplate3 = ({ menuData, loading }) => {
    const { addToCart, cartItems: cart } = useCart();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Derived State
    const items = menuData?.items || [];
    const restaurant = menuData?.restaurant || {};
    const config = menuData?.template?.restaurant_config || {};
    const themeColor = config.themeColor || '#10b981'; // Default Emerald

    const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];

    const isPreview = menuData?.restaurant === 'Master Preview';

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Show item if:
        // 1. It matches search/category AND
        // 2. It is NOT hidden OR We are in Preview Mode
        return matchesCategory && matchesSearch && (!item.is_hidden || isPreview);
    });

    // Scroll Logic for Categories
    const scrollToCategory = (cat) => {
        setActiveCategory(cat);
        // In a real implementation, we might scroll to a section ID, 
        // but for now we filter. 
        // If we want "One Page" feel, we would map sections.
        // Let's stick to filtering for cleaner UI on mobile.
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: themeColor }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
            {/* --- Mobile Header --- */}
            <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm px-4 py-3">
                <div className="flex justify-between items-center mb-3">
                    <h1 className="text-lg font-black uppercase tracking-tight text-gray-900 line-clamp-1">
                        {restaurant.name || 'Restaurant'}
                    </h1>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 rounded-full bg-gray-100 text-gray-800"
                    >
                        <HiShoppingCart className="w-6 h-6" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>
                {/* Search Mobile */}
                <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm font-medium outline-none focus:ring-2"
                        style={{ '--tw-ring-color': themeColor }}
                    />
                </div>
            </div>

            {/* --- Desktop Sidebar --- */}
            <aside className="hidden md:flex flex-col w-80 h-screen sticky top-0 bg-white border-r border-gray-100 overflow-y-auto z-50">
                <div className="p-8">
                    {config.logoImage ? (
                        <img src={config.logoImage} className="w-24 h-24 rounded-2xl object-cover shadow-lg mb-6" alt="Logo" />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner bg-gradient-to-br from-gray-100 to-gray-200">
                            🍽️
                        </div>
                    )}
                    <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">
                        {restaurant.name || 'The Venue'}
                    </h1>
                    <p className="text-gray-400 text-sm font-medium mb-6">
                        Experience the best flavors in town.
                    </p>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <HiClock className="w-5 h-5" /> <span>Open 9am - 10pm</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <HiMapPin className="w-5 h-5" /> <span>Downtown Blvd, City</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <HiPhone className="w-5 h-5" /> <span>(555) 123-4567</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">Menu Categories</p>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => scrollToCategory(cat)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                                    ? 'text-white shadow-lg'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                style={activeCategory === cat ? { backgroundColor: themeColor } : {}}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 min-h-screen pb-24 md:pb-0">
                {/* Desktop Header */}
                <header className="hidden md:flex sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 justify-between items-center">
                    <div className="relative w-96">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search your cravings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 rounded-2xl pl-12 pr-6 py-3 font-bold text-gray-700 focus:bg-white focus:shadow-lg focus:ring-2 transition-all outline-none"
                            style={{ '--tw-ring-color': themeColor }}
                        />
                    </div>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-wider hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <HiShoppingCart className="w-5 h-5" />
                        <span>Cart ({cart.length})</span>
                    </button>
                </header>

                {/* Categories (Mobile Only - Horizontal Scroll) */}
                <div className="md:hidden overflow-x-auto flex gap-2 px-4 py-4 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => scrollToCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${activeCategory === cat
                                ? 'text-white shadow-md'
                                : 'bg-white text-gray-500 border border-gray-100'
                                }`}
                            style={activeCategory === cat ? { backgroundColor: themeColor } : {}}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <motion.div
                            layoutId={`item-${item.id}`}
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-transparent hover:border-gray-50"
                        >
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                <img
                                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-black px-3 py-1.5 rounded-lg shadow-sm">
                                    ${Number(item.price).toFixed(2)}
                                </div>
                            </div>
                            <div className="px-2 pb-2">
                                <h3 className="font-black text-gray-900 text-lg leading-tight mb-1 group-hover:text-[var(--theme-color)]" style={{ '--theme-color': themeColor }}>
                                    {item.name}
                                </h3>
                                <p className="text-gray-400 text-xs line-clamp-2 min-h-[2.5em] font-medium leading-relaxed">
                                    {item.description}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{item.category}</span>
                                    <button
                                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[var(--theme-color)] hover:text-white transition-all shadow-sm"
                                        style={{ '--theme-color': themeColor }}
                                    >
                                        <HiPlus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* --- Item Detail Modal --- */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] overflow-hidden w-full max-w-sm md:max-w-4xl shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="md:w-1/2 h-64 md:h-auto relative bg-gray-100">
                                <img
                                    src={selectedItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                    className="w-full h-full object-cover"
                                    alt={selectedItem.name}
                                />
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all md:hidden"
                                >
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="md:w-1/2 p-8 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                        {selectedItem.category}
                                    </span>
                                    <button onClick={() => setSelectedItem(null)} className="hidden md:block p-2 text-gray-300 hover:text-gray-900 transition-colors">
                                        <HiXMark className="w-6 h-6" />
                                    </button>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-4">
                                    {selectedItem.name}
                                </h2>
                                <p className="text-gray-500 font-medium leading-relaxed mb-8 flex-1">
                                    {selectedItem.description}
                                </p>

                                <div className="mt-auto">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-3xl font-black text-gray-900">${Number(selectedItem.price).toFixed(2)}</span>
                                        <div className="flex items-center gap-4">
                                            {/* Could add quantity selector here */}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            addToCart(selectedItem);
                                            setSelectedItem(null);
                                            // Optional: Open Mini Cart or Show Toast
                                        }}
                                        className="w-full py-5 rounded-2xl text-white font-black text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        Add to Order
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Cart Sidebar (Right) --- */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Your Order</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-black">
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {cart.length === 0 ? (
                                <div className="text-center py-20 opacity-30">
                                    <HiShoppingCart className="w-16 h-16 mx-auto mb-4" />
                                    <p className="font-bold">Cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex gap-4 items-center">
                                        <img src={item.image_url} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{item.name}</h4>
                                            <p className="text-xs text-gray-400 font-bold">${item.price}</p>
                                        </div>
                                        <button className="p-2 text-red-400 hover:text-red-600">
                                            <HiMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 border-t pt-6 bg-gray-50 -mx-6 -mb-6 p-6">
                            <div className="flex justify-between text-xl font-black mb-6">
                                <span>Total</span>
                                <span>${cart.reduce((t, i) => t + Number(i.price), 0).toFixed(2)}</span>
                            </div>
                            <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all">
                                Checkout
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PublicMenuTestemplate3;
