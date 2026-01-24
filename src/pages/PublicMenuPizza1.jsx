import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus } from 'react-icons/hi2';
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
    ];

    const [selectedItem, setSelectedItem] = useState(menuItems[0]);
    const [exitingItem, setExitingItem] = useState(null); // The item leaving
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);

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

            {/* Left Sidebar / Thumbnail List */}
            <div className="w-24 md:w-32 lg:w-40 h-full flex flex-col items-center py-6 overflow-y-auto no-scrollbar scroll-smooth relative z-10 bg-white/50 backdrop-blur-sm">
                <Link to="/" className="mb-6 p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white text-gray-600">
                    <HiArrowLeft className="w-5 h-5" />
                </Link>

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
                        {/* Mobile Back Button (if needed, otherwise hidden as per design which has it in sidebar/top-left) */}
                        <div className="md:hidden"></div>

                        <h1 className="text-lg font-bold text-gray-900 mx-auto">Menu</h1>

                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="font-mono font-bold text-gray-900 text-lg">0{selectedItem.id}</span>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            {/* Grid Icon Placeholder */}
                            <div className="grid grid-cols-2 gap-0.5 w-5 h-5 opacity-60">
                                <span className="bg-gray-800 rounded-sm"></span><span className="bg-gray-800 rounded-sm"></span>
                                <span className="bg-gray-800 rounded-sm"></span><span className="bg-gray-800 rounded-sm"></span>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center justify-center gap-8 text-sm md:text-base mb-2">
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors">Platta</button>
                        <button className="text-gray-900 font-bold border-b-2 border-orange-500 pb-1">With Bread</button>
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors">With Rice</button>
                    </div>
                </div>

                {/* Hero Image & Animation Container */}
                <div className="flex-1 flex items-center justify-center p-2 relative min-h-[220px]">
                    {/* Background decorations */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-orange-50/50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                    {/* Central Image Container */}
                    <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 relative z-10 aspect-square shrink-0">

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
                <div className="px-6 pb-6 md:pb-12 animate-fade-in-up mt-auto">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{selectedItem.name}</h2>
                            <div className="flex items-start gap-2 mb-1">
                                <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-xs line-clamp-2 md:line-clamp-none">{selectedItem.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setLiked(!liked)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                            {liked ? <HiHeart className="w-7 h-7 text-red-500" /> : <HiOutlineHeart className="w-7 h-7" />}
                        </button>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-orange-500">$</span>
                            <span className="text-3xl font-black text-gray-900">{selectedItem.price.toFixed(2)}</span>
                        </div>

                        <button className="bg-white border hover:border-orange-200 border-orange-100 text-orange-500 hover:text-orange-600 rounded-[1.2rem] py-2 px-5 font-bold text-sm md:text-lg shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <span>Add to</span>
                            <HiShoppingBag className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicMenuPizza1;
