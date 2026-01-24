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
            <div className="w-24 md:w-32 lg:w-40 h-full border-r border-gray-100 flex flex-col items-center py-8 overflow-y-auto no-scrollbar scroll-smooth relative z-10 bg-white">
                <Link to="/" className="mb-8 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <HiArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>

                <div className="space-y-6 w-full px-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            className={`relative group w-full flex flex-col items-center transition-transform duration-300 ${selectedItem.id === item.id ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                        >
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-lg border-2 transition-all ${selectedItem.id === item.id ? 'border-orange-500 shadow-orange-500/30' : 'border-transparent'}`}>
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            {selectedItem.id === item.id && (
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-orange-500 rounded-l-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-0">

                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-10">
                    <div>
                        <h2 className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-1">Pizza Time</h2>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 animate-fade-in">{selectedItem.category} Menu</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono font-bold text-gray-300">0{selectedItem.id}</span>
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                                <span className="bg-gray-800 rounded-sm"></span>
                                <span className="bg-gray-400 rounded-sm"></span>
                                <span className="bg-gray-400 rounded-sm"></span>
                                <span className="bg-gray-800 rounded-sm"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Image & Animation Container */}
                <div className="flex-1 flex items-center justify-center p-6 relative">
                    {/* Circle Background */}
                    <div className="absolute w-[30vh] h-[30vh] md:w-[50vh] md:h-[50vh] bg-orange-50 rounded-full -z-10 blur-3xl opacity-60"></div>

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
                                className="absolute inset-0 w-full h-full rounded-full overflow-hidden border-4 border-white shadow-none animate-[wheelExitLeft_0.4s_ease-in_forwards] z-20"
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
                            className={`absolute inset-0 w-full h-full rounded-full overflow-hidden border-4 border-white shadow-none z-10 transition-transform duration-500
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
                <div className="p-8 md:p-12 pb-24 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{selectedItem.name}</h2>
                            <p className="text-gray-500 max-w-md leading-relaxed">{selectedItem.description}</p>
                        </div>
                        <button
                            onClick={() => setLiked(!liked)}
                            className="p-3 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            {liked ? <HiHeart className="w-8 h-8 text-red-500" /> : <HiOutlineHeart className="w-8 h-8 text-gray-400" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-8">
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Ingredients</span>
                        <div className="h-px bg-gray-200 flex-1 ml-4"></div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-orange-500">$</span>
                            <span className="text-4xl font-black text-gray-900">{selectedItem.price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                            <button
                                onClick={() => Math.max(1, setQuantity(q => q > 1 ? q - 1 : 1))}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors"
                            >
                                <HiMinus />
                            </button>
                            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors"
                            >
                                <HiPlus />
                            </button>
                        </div>

                        <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] py-4 px-8 font-bold text-lg shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95">
                            <span>Add to Bag</span>
                            <HiShoppingBag className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicMenuPizza1;
