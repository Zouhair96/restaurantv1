import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiBuildingStorefront, HiXMark } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

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
    const [showCheckout, setShowCheckout] = useState(false);
    const [showLeftSidebar, setShowLeftSidebar] = useState(false);

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

            {/* Mobile Overlay */}
            {showLeftSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setShowLeftSidebar(false)}
                />
            )}

            {/* Left Sidebar / Thumbnail List */}
            <div className={`
                fixed inset-y-0 left-0 z-40 bg-white/90 backdrop-blur-md md:bg-white/50 
                w-24 md:w-32 lg:w-40 h-full flex flex-col items-center py-6 
                overflow-y-auto no-scrollbar scroll-smooth transition-transform duration-300
                md:relative md:translate-x-0
                ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <button
                    onClick={() => setShowLeftSidebar(false)}
                    className="mb-6 p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white text-gray-600 md:cursor-default"
                >
                    <HiBars3 className="w-6 h-6 md:block hidden" />
                    <HiXMark className="w-6 h-6 md:hidden" />
                </button>

                <div className="space-y-6 w-full px-3 flex flex-col items-center">
                    {menuItems.map((item) => (
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-0">

                {/* Header Section */}
                {/* Header Section */}
                <div className="px-5 pt-4 pb-1 shrink-0 z-20">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-6">
                        {/* Mobile Back Button (Hamburger Trigger) */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setShowLeftSidebar(true)}
                                className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
                            >
                                <HiBars3 className="w-6 h-6" />
                            </button>
                        </div>

                        <h1 className="text-xl md:text-2xl font-black text-gray-900 mx-auto tracking-tight">PIZZA TIME</h1>

                        <div className="flex items-center gap-2 text-gray-400">
                            <button
                                onClick={() => setShowCheckout(!showCheckout)}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <HiBuildingStorefront className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center justify-start gap-4 md:gap-8 text-sm md:text-base mb-2 overflow-x-auto no-scrollbar py-1">
                        <button className="text-gray-900 font-bold border-b-2 border-orange-500 pb-1 whitespace-nowrap">Classic</button>
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors whitespace-nowrap">Premium</button>
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors whitespace-nowrap">Special</button>
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors whitespace-nowrap">Drinks</button>
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors whitespace-nowrap">Desserts</button>
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

                {/* Details Card */}
                <div className="px-6 pb-6 md:pb-12 mt-auto shrink-0 z-20 bg-white">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex-1 min-w-0 pr-4">
                            <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-1 truncate h-8 flex items-center">{selectedItem.name}</h2>
                            <div className="flex items-start gap-2 mb-1 h-12 overflow-hidden">
                                <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-xs line-clamp-2 md:line-clamp-none">{selectedItem.description}</p>
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
                    <div className="flex items-end justify-between mt-2">
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-lg font-bold text-orange-500">$</span>
                            <span className="text-3xl font-black text-gray-900">{selectedItem.price.toFixed(2)}</span>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            {/* Quantity Control (Stacked on top) */}
                            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1.5 h-8">
                                <button
                                    onClick={() => Math.max(1, setQuantity(q => q > 1 ? q - 1 : 1))}
                                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors active:scale-95"
                                >
                                    <HiMinus className="w-3 h-3" />
                                </button>
                                <span className="w-4 text-center font-bold text-gray-900 text-sm">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors active:scale-95"
                                >
                                    <HiPlus className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Add Button */}
                            <button className="bg-white border hover:border-orange-200 border-orange-100 text-orange-500 hover:text-orange-600 rounded-[1.2rem] py-2.5 px-6 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95">
                                <span>Add to</span>
                                <HiShoppingBag className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Right Sidebar / Checkout */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${showCheckout ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full bg-white">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                        <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600">
                            <HiMinus className="w-6 h-6 rotate-45" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-gray-500">
                        <HiShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                        <p>Your cart is empty</p>
                        <p className="text-sm mt-1">Add some delicious pizza!</p>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-600">Total</span>
                            <span className="font-bold text-2xl text-gray-900">$0.00</span>
                        </div>
                        <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PublicMenuPizza1;
