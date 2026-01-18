import React, { useState } from 'react';
import { HiShoppingCart, HiMagnifyingGlass } from 'react-icons/hi2';
import { useCart } from '../context/CartContext';
import MenuItem from '../components/menu/MenuItem';
import Cart from '../components/menu/Cart';
import Checkout from '../components/menu/Checkout';

const TestMenu = () => {
    const { toggleCart, getCartCount } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Menu data extracted from the image
    const menuItems = [
        {
            id: 1,
            name: 'Sicilienne',
            description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois',
            category: 'classic',
            prices: { small: 8.90, medium: 11.90, large: 17.90 },
            badge: null,
        },
        {
            id: 2,
            name: 'Calzone',
            description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf',
            category: 'classic',
            prices: { small: 8.90, medium: 11.90, large: 17.90 },
            badge: null,
        },
        {
            id: 3,
            name: 'Pêcheur',
            description: 'Sauce tomate, fromage, thon, saumon, olives, oignon',
            category: 'classic',
            prices: { small: 8.90, medium: 12.90, large: 19.90 },
            badge: null,
        },
        {
            id: 4,
            name: '4 Fromages',
            description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort',
            category: 'classic',
            prices: { small: 8.90, medium: 12.90, large: 19.90 },
            badge: 'Populaire',
        },
        {
            id: 5,
            name: 'Fruits de Mer',
            description: 'Sauce tomate, fromage, fruits de mer, persillade, poivron, oignon',
            category: 'classic',
            prices: { small: 8.90, medium: 12.90, large: 19.90 },
            badge: null,
        },
        {
            id: 6,
            name: 'Mexicaine',
            description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon',
            category: 'classic',
            prices: { small: 8.90, medium: 14.90, large: 21.90 },
            badge: null,
        },
        {
            id: 7,
            name: '4 Saisons',
            description: 'Sauce tomate, fromage, jambon, champignons, olives, oignon',
            category: 'classic',
            prices: { small: 8.90, medium: 13.90, large: 19.90 },
            badge: null,
        },
        {
            id: 8,
            name: 'Moussaka',
            description: 'Sauce tomate, fromage, aubergine, viande hachée, tomates fraîches, oignon',
            category: 'classic',
            prices: { small: 8.90, medium: 15.90, large: 20.90 },
            badge: null,
        },
        {
            id: 9,
            name: 'Chèvre',
            description: 'Crème fraîche, fromage, chèvre, olives, oignon',
            category: 'premium',
            prices: { small: 8.90, medium: 13.90, large: 19.90 },
            badge: null,
        },
        {
            id: 10,
            name: 'Chicken',
            description: 'Crème fraîche, fromage, poulet fumé, champignons',
            category: 'premium',
            prices: { small: 8.90, medium: 13.90, large: 19.90 },
            badge: 'Populaire',
        },
        {
            id: 11,
            name: 'Raclette',
            description: 'Crème fraîche, fromage, raclette, lardons, pommes de terre',
            category: 'premium',
            prices: { small: 8.90, medium: 13.90, large: 21.90 },
            badge: null,
        },
        {
            id: 12,
            name: 'Tartiflette',
            description: 'Crème fraîche, fromage, reblochon, lardons, pommes de terre, oignon',
            category: 'premium',
            prices: { small: 8.90, medium: 13.90, large: 21.90 },
            badge: null,
        },
        {
            id: 13,
            name: 'Chicago',
            description: 'Crème fraîche, fromage, viande hachée, bacon de dinde, cheddar, œuf',
            category: 'premium',
            prices: { small: 8.90, medium: 15.90, large: 22.90 },
            badge: null,
        },
        {
            id: 14,
            name: 'Buffalo',
            description: 'Sauce barbecue, fromage, poulet fumé, viande hachée, poivron, oignon, cheddar',
            category: 'premium',
            prices: { small: 9.90, medium: 14.90, large: 20.90 },
            badge: 'Épicé',
        },
        {
            id: 15,
            name: 'Curry Chicken',
            description: 'Crème fraîche, fromage, poulet fumé, viande hachée, poivron, oignon, cheddar',
            category: 'premium',
            prices: { small: 9.90, medium: 13.90, large: 22.90 },
            badge: 'Nouveau',
        },
        {
            id: 16,
            name: 'Bolognaise',
            description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni',
            category: 'special',
            prices: { small: 11.90, medium: 17.90, large: 24.90 },
            badge: null,
        },
        {
            id: 17,
            name: 'Bollywood',
            description: 'Crème fraîche, fromage, sauce curry, poulet fumé',
            category: 'special',
            prices: { small: 9.90, medium: 15.90, large: 22.90 },
            badge: 'Épicé',
        },
        {
            id: 18,
            name: 'The Burger',
            description: 'Crème fraîche, fromage, viande hachée, tomate, cheddar, oignon rouge',
            category: 'special',
            prices: { small: 11.90, medium: 18.90, large: 25.90 },
            badge: 'Nouveau',
        },
        {
            id: 19,
            name: 'Popeye',
            description: 'Crème fraîche, fromage, épinards hachés, poulet fumé, œuf, parmesan',
            category: 'special',
            prices: { small: 11.90, medium: 18.90, large: 25.90 },
            badge: null,
        },
        {
            id: 20,
            name: 'Campagnarde',
            description: 'Crème fraîche, fromage, jambon, pommes de terre, lardons, oignon, persillade',
            category: 'special',
            prices: { small: 11.90, medium: 18.90, large: 25.90 },
            badge: null,
        },
    ];

    const categories = [
        { id: 'all', label: 'Toutes', icon: '🍕' },
        { id: 'classic', label: 'Classiques', icon: '⭐' },
        { id: 'premium', label: 'Premium', icon: '👑' },
        { id: 'special', label: 'Spéciales', icon: '🔥' },
    ];

    // Filter menu items
    const filteredItems = menuItems.filter((item) => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCheckout = () => {
        toggleCart();
        setIsCheckoutOpen(true);
    };

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
                                    Pizza Time
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Menu Digital
                                </p>
                            </div>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={toggleCart}
                            className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            <HiShoppingCart size={24} />
                            <span className="hidden sm:inline">Panier</span>
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
                        Nos Délicieuses Pizzas
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Faites votre choix parmi notre sélection de pizzas artisanales
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md mx-auto">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une pizza..."
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

                {/* Special Offers Banner */}
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-6 mb-12 text-center shadow-xl">
                    <h3 className="text-2xl font-black text-white mb-2">
                        🎉 Offres Spéciales 🎉
                    </h3>
                    <p className="text-white font-bold">
                        1 Pizza achetée = 1 Pizza offerte! | 3 Pizzas Senior: 30€ | 2 Pizzas Mega: 35€
                    </p>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </div>

                {/* No Results */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😕</div>
                        <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                            Aucune pizza trouvée
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 mt-2">
                            Essayez une autre recherche ou catégorie
                        </p>
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

export default TestMenu;
