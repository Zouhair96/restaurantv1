import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiBars3, HiBuildingStorefront, HiXMark, HiTrash, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import OrdersDropdown from '../components/public-menu/OrdersDropdown';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout';
import Cart from '../components/menu/Cart';
import WelcomeSequence from '../components/public-menu/WelcomeSequence';
import { useClientAuth } from '../context/ClientAuthContext';
import PersistentOrderTracker from '../components/PersistentOrderTracker';

const PublicMenuGrid = ({ restaurantName: propRestaurantName, templateKey: propTemplateKey }) => {
    const { user: clientUser, activeOrderId, handleCloseTracker } = useClientAuth();
    const { restaurantName: urlRestaurantName, templateKey: urlTemplateKey } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const templateKey = propTemplateKey || urlTemplateKey || 'pizza1';
    const isMasterView = !restaurantName;

    // State
    const [menuItems, setMenuItems] = useState([]);
    const [config, setConfig] = useState({
        restaurantName: 'Menu Preview',
        themeColor: '#6366f1',
        logoImage: null,
        useLogo: false
    });
    const [isAuthHovered, setIsAuthHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);

    useEffect(() => {
        const handleOpenAuth = () => {
            setIsOrdersDropdownOpen(false);
            setShowAuthSidebar(true);
        };
        window.addEventListener('openClientAuth', handleOpenAuth);
        return () => window.removeEventListener('openClientAuth', handleOpenAuth);
    }, []);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [trackerStatus, setTrackerStatus] = useState(null);

    // Fetch Menu Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (isMasterView) {
                    const response = await fetch(`/.netlify/functions/templates?templateKey=${templateKey}`);
                    const data = await response.json();
                    if (data && data.items) {
                        setMenuItems(data.items.map(item => ({ ...item, image: item.image_url })));
                        setConfig({
                            restaurantName: data.name || 'MASTER BLUEPRINT',
                            themeColor: data.config?.designConfig?.accentColor || data.config?.themeColor || '#6366f1',
                            logoImage: null,
                            useLogo: false
                        });
                    }
                } else {
                    const response = await fetch(`/.netlify/functions/public-menu?restaurantName=${encodeURIComponent(restaurantName)}`);
                    if (!response.ok) throw new Error('Failed to load menu');
                    const data = await response.json();
                    if (data.menu && data.menu.config) {
                        setMenuItems(data.menu.config.items || []);
                        setConfig({
                            ...data.menu.config,
                            restaurantName: data.menu.config.restaurantName || data.restaurant || restaurantName
                        });
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [restaurantName, isMasterView, templateKey]);

    const [selectedItem, setSelectedItem] = useState(null);
    useEffect(() => {
        if (menuItems.length > 0 && !selectedItem) {
            setSelectedItem(menuItems[0]);
        }
    }, [menuItems]);

    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const { cartItems, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, getCartTotal } = useCart();

    const categories = ['All', ...new Set(menuItems.map(item => item.category))];
    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart({ ...selectedItem, quantity });
            setIsCartOpen(true);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 flex flex-col md:flex-row overflow-hidden relative">
            {activeOrderId && trackerStatus !== 'completed' && trackerStatus !== 'cancelled' && (
                <PersistentOrderTracker
                    orderId={activeOrderId}
                    onClose={handleCloseTracker}
                    themeColor={config.themeColor}
                    onStatusChange={setTrackerStatus}
                />
            )}
            <style>{`
                :root { --theme-color: ${config.themeColor}; }
                .text-theme { color: var(--theme-color); }
                .bg-theme { background-color: var(--theme-color); }
                .border-theme { border-color: var(--theme-color); }
            `}</style>

            {/* Left Sidebar / Thumbnail List */}
            <div className="relative shrink-0 z-40 bg-white/90 backdrop-blur-md w-24 md:w-32 lg:w-40 h-full flex flex-col items-center py-6 overflow-y-auto scroll-smooth transition-all duration-300">
                <div className="flex flex-col gap-4 w-full px-3">
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setSelectedItem(item); setQuantity(1); }}
                            className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-500 group ${selectedItem?.id === item.id ? 'ring-4 ring-offset-2 ring-theme scale-95 shadow-lg' : 'hover:scale-105 opacity-60 hover:opacity-100 shadow-sm'}`}
                        >
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className={`absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors ${selectedItem?.id === item.id ? 'bg-transparent' : ''}`} />
                        </button>
                    ))}
                </div>

                {/* Profile Button */}
                <button
                    onClick={() => setIsOrdersDropdownOpen(!isOrdersDropdownOpen)}
                    className="mt-auto mb-6 p-4 rounded-2xl bg-white shadow-lg border border-gray-100 hover:scale-110 active:scale-95 transition-all text-gray-500 hover:text-theme relative"
                >
                    <HiBars3 className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden shadow-2xl z-30">
                {/* Dynamic Category Bar */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-theme text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsOrdersDropdownOpen(!isOrdersDropdownOpen)}
                            className="p-2 ml-4 text-gray-400 hover:text-gray-900 transition-colors relative"
                        >
                            <HiOutlineClipboardDocumentList className="w-6 h-6" />
                            {activeOrderId && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.themeColor }}></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isOrdersDropdownOpen && (
                                <OrdersDropdown
                                    isOpen={isOrdersDropdownOpen}
                                    onClose={() => setIsOrdersDropdownOpen(false)}
                                    restaurantName={restaurantName}
                                    displayName={config.restaurantName}
                                    themeColor={config.themeColor}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content */}
                {selectedItem && (
                    <div className="flex-1 flex flex-col relative animate-fade-in group/main">
                        <div className="flex-1 relative overflow-hidden bg-gray-50 flex items-center justify-center p-8">
                            <div className="relative w-full max-w-lg aspect-square">
                                <img src={selectedItem.image} alt={selectedItem.name}
                                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-1000 group-hover/main:scale-105" />
                            </div>
                        </div>

                        {/* Item Details */}
                        <div className="p-8 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="bg-theme/10 text-theme px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedItem.category}</span>
                                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight leading-none">{selectedItem.name}</h1>
                                    <p className="text-gray-500 font-medium leading-relaxed max-w-md">{selectedItem.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</span>
                                    <span className="text-3xl font-black text-theme">${parseFloat(selectedItem.price).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4 bg-gray-100 rounded-2xl p-2 px-4">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:text-theme transition-colors"><HiMinus className="w-5 h-5" /></button>
                                    <span className="w-8 text-center font-black text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="p-2 hover:text-theme transition-colors"><HiPlus className="w-5 h-5" /></button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 ml-6 h-14 bg-theme text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    <HiShoppingBag className="w-6 h-6" /> Add to Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cart Button (Floating) */}
            <button
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center text-gray-900 hover:scale-110 active:scale-90 transition-all group"
            >
                <div className="relative">
                    <HiShoppingBag className="w-7 h-7" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-3 -right-3 w-6 h-6 bg-theme text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white">
                            {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                        </span>
                    )}
                </div>
            </button>

            {/* Sidebars */}
            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={config.restaurantName}
                themeColor={config.themeColor}
            />

            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor={config.themeColor}
            />

            <Cart onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />

            <WelcomeSequence
                restaurantName={config.restaurantName}
                themeColor={config.themeColor}
                promoConfig={config}
            />
        </div>
    );
};

export default PublicMenuGrid;
