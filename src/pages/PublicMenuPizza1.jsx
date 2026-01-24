import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiBuildingStorefront, HiXMark, HiTrash } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';

const PublicMenuPizza1 = () => {
    // Hardcoded Pizza Time Data
    const menuItems = [
        { id: 1, name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois', price: 11.90, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 2, name: 'Calzone', description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf', price: 11.90, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 3, name: 'Pêcheur', description: 'Sauce tomate, fromage, thon, saumon, olives, oignon', price: 12.90, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 4, name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', price: 12.90, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 5, name: 'Mexicaine', description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', price: 14.90, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', category: 'Classic' },
        { id: 6, name: 'Chèvre', description: 'Crème fraîche, fromage, chèvre, olives, oignon', price: 13.90, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop', category: 'Premium' },
        { id: 7, name: 'Chicken', description: 'Crème fraîche, fromage, poulet fumé, champignons', price: 13.90, image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1000&auto=format&fit=crop', category: 'Premium' },
        { id: 8, name: 'Bolognaise', description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', price: 17.90, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop', category: 'Special' },
        { id: 9, name: 'Coca-Cola', description: '33cl can chilled', price: 2.50, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop', category: 'Drinks' },
        { id: 10, name: 'Tiramisu', description: 'Homemade italian classic', price: 5.90, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop', category: 'Desserts' },
    ];

    const [selectedItem, setSelectedItem] = useState(menuItems[0]);
    const [exitingItem, setExitingItem] = useState(null); // The item leaving
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);
    // const [showCheckout, setShowCheckout] = useState(false); // Replaced by CartContext
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Classic');

    const {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        getCartTotal
    } = useCart();

    const handleCategorySelect = (category) => {
        setActiveCategory(category);
        const firstItem = menuItems.find(item => item.category === category);
        if (firstItem) handleItemSelect(firstItem);
    };

    const handleAddToCart = () => {
        addToCart({
            ...selectedItem,
            quantity: quantity,
            size: 'Standard' // Default size if not specified
        });
        setQuantity(1); // Reset quantity after adding
    };

    const handleItemSelect = (item) => {
        if (selectedItem.id === item.id) return;

        // Start transition
        setExitingItem(selectedItem);
        setSelectedItem(item);
        setQuantity(1);
        setLiked(false);

        // Clear exiting item after animation completes (match CSS duration)
        setTimeout(() => {
            setExitingItem(null);
        }, 400);
    };

    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden relative">

            {/* Mobile Overlay - REMOVED */}

            {/* Left Sidebar / Thumbnail List */}
            <div className={`
                relative shrink-0 z-40 bg-white/90 backdrop-blur-md md:bg-white/50 
                w-24 md:w-32 lg:w-40 h-full flex flex-col items-center py-6 pb-48
                overflow-y-auto scroll-smooth transition-all duration-300
            `}>
                <button
                    onClick={() => setShowAuthSidebar(true)}
                    className="mb-6 p-4 rounded-[1.5rem] border border-gray-100 shadow-sm bg-white text-gray-600 hover:text-gray-900 hover:shadow-md transition-all active:scale-95"
                >
                    <HiBars3 className="w-6 h-6 block" />
                </button>

                <div className="space-y-6 w-full px-3 flex flex-col items-center">
                    {menuItems.filter(item => item.category === activeCategory).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            className={`relative group w-full flex flex-col items-center justify-center transition-all duration-300`}
                        >
                            <div className={`
                                w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-300
                                ${selectedItem.id === item.id
                                    ? 'bg-orange-100 rounded-[1.8rem] p-1.5'
                                    : 'rounded-full p-0 scale-90 opacity-70 hover:opacity-100 hover:scale-100'}
                            `}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className={`w-full h-full object-cover rounded-full shadow-md ${selectedItem.id === item.id ? 'shadow-orange-500/10' : ''}`}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area - Fixed (No Scroll) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-0 pb-48">

                {/* Header Section */}
                {/* Header Section */}
                <div className="px-5 pt-4 pb-1 shrink-0 z-20">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-6">
                        {/* Mobile Back Button (Hamburger Trigger) - DISABLED/REMOVED as requested */}
                        <div className="md:hidden">
                            {/* Button removed */}
                        </div>

                        <h1 className="text-xl md:text-2xl font-black text-gray-900 mx-auto tracking-tight">PIZZA TIME</h1>

                        <div className="flex items-center gap-2 text-gray-400">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors relative"
                            >
                                <HiShoppingBag className="w-6 h-6" />
                                {cartItems.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center justify-start gap-4 md:gap-8 text-sm md:text-base mb-2 overflow-x-auto no-scrollbar py-1">
                        {['Classic', 'Premium', 'Special', 'Drinks', 'Desserts'].map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategorySelect(category)}
                                className={`font-bold pb-1 whitespace-nowrap transition-colors ${activeCategory === category
                                    ? 'text-gray-900 border-b-2 border-orange-500'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hero Image & Animation Container */}
                <div className="flex-1 flex items-center justify-center p-2 relative min-h-[220px]">
                    {/* Background decorations */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-orange-50/50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                    {/* Central Image Container */}
                    <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-96 md:h-96 relative z-10 aspect-square shrink-0">

                        {/* 1. Steam Effect (Only when stationary/selected) */}
                        {!exitingItem && (
                            <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 w-32 md:w-40 h-24 md:h-32 flex justify-center gap-4 opacity-40 pointer-events-none z-20">
                                <span className="w-3 md:w-4 h-12 md:h-16 bg-gradient-to-t from-gray-200 to-transparent blur-md rounded-full animate-[steamRiseLocal_2s_infinite_ease-out]"></span>
                                <span className="w-3 md:w-4 h-16 md:h-20 bg-gradient-to-t from-gray-200 to-transparent blur-md rounded-full animate-[steamRiseLocal_2.5s_infinite_ease-out_0.5s]"></span>
                                <span className="w-3 md:w-4 h-10 md:h-12 bg-gradient-to-t from-gray-200 to-transparent blur-md rounded-full animate-[steamRiseLocal_3s_infinite_ease-out_0.2s]"></span>
                            </div>
                        )}

                        {/* 2. Exiting Item (Rotates out to left) */}
                        {exitingItem && (
                            <div
                                className="absolute inset-0 w-full h-full rounded-full overflow-hidden border-none shadow-none animate-[wheelExitLeft_0.4s_ease-in_forwards] z-20"
                                style={{ transformOrigin: '50% 250%' }}
                            >
                                <img
                                    src={exitingItem.image}
                                    alt={exitingItem.name}
                                    className="w-full h-full object-cover animate-[pizzaSpinOut_0.4s_ease-in_forwards]"
                                />
                            </div>
                        )}

                        {/* 3. Entering/Selected Item (Rotates in from right) */}
                        <div
                            key={selectedItem.id}
                            className={`absolute inset-0 w-full h-full rounded-full overflow-hidden border-none shadow-none z-10 transition-transform duration-500
                                ${exitingItem ? 'animate-[wheelEnterRight_0.4s_ease-out_forwards]' : 'hover:scale-105'}`}
                            style={{ transformOrigin: '50% 250%' }}
                        >
                            <img
                                src={selectedItem.image}
                                alt={selectedItem.name}
                                className={`w-full h-full object-cover ${exitingItem ? 'animate-[pizzaSpinIn_0.4s_ease-out_forwards]' : ''}`}
                            />
                        </div>

                    </div>
                </div>

            </div>

            {/* Details Card - Fixed Bottom Overlay */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-50">
                <div className="px-5 py-3 flex justify-between items-start mb-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <h2 className="text-lg md:text-2xl font-black text-gray-900 mb-0.5 truncate h-7 flex items-center">{selectedItem.name}</h2>
                        <div className="flex items-start gap-2 mb-0 h-10 overflow-hidden">
                            <p className="text-gray-500 text-xs leading-tight max-w-xs line-clamp-2">{selectedItem.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setLiked(!liked)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0 pt-1"
                    >
                        {liked ? <HiHeart className="w-6 h-6 text-red-500" /> : <HiOutlineHeart className="w-6 h-6" />}
                    </button>
                </div>

                {/* Bottom Action Bar */}
                <div className="px-5 pb-4 flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-orange-500">$</span>
                        <span className="text-2xl font-black text-gray-900">{selectedItem.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Quantity Control (Left) */}
                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5 h-10">
                            <button
                                onClick={() => Math.max(1, setQuantity(q => q > 1 ? q - 1 : 1))}
                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors active:scale-95"
                            >
                                <HiMinus className="w-4 h-4" />
                            </button>
                            <span className="w-4 text-center font-bold text-gray-900 text-sm">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors active:scale-95"
                            >
                                <HiPlus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Button (Right) */}
                        <button
                            onClick={handleAddToCart}
                            className="bg-white border hover:border-orange-200 border-orange-100 text-orange-500 hover:text-orange-600 rounded-[1.2rem] py-2.5 px-6 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 h-10"
                        >
                            <span>Add to</span>
                            <HiShoppingBag className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Sidebar / Checkout - Z-Index Updated to 70 */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full bg-white">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <HiXMark className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                        {cartItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <HiShoppingBag className="w-16 h-16 mb-4 opacity-10" />
                                <p className="font-medium text-gray-400">Your cart is empty</p>
                                <p className="text-sm mt-1 text-gray-400">Add some delicious pizza!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex gap-3 bg-white border border-gray-50 rounded-2xl p-3 shadow-sm">
                                        <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.size)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-orange-500 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                        className="text-gray-400 hover:text-gray-900 active:scale-90 transition-transform"
                                                    >
                                                        <HiMinus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs font-bold text-gray-900 w-3 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                        className="text-gray-400 hover:text-gray-900 active:scale-90 transition-transform"
                                                    >
                                                        <HiPlus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex justify-between mb-2 text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>${getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-6">
                            <span className="text-gray-900 font-bold text-lg">Total</span>
                            <span className="font-black text-2xl text-gray-900">${getCartTotal().toFixed(2)}</span>
                        </div>
                        <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-transform active:scale-[0.98] shadow-lg shadow-gray-900/20">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>

            {/* Auth Sidebar */}
            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName="Pizza Time"
            />
        </div>
    );
};

export default PublicMenuPizza1;
