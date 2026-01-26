import React, { useState, useEffect } from 'react';
import { HiShoppingBag, HiHeart, HiXMark, HiCheck } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout';
import Cart from '../components/menu/Cart';
import WelcomeSequence from '../components/public-menu/WelcomeSequence';

const PublicMenuSwipe = ({ restaurantName: propRestaurantName, templateKey: propTemplateKey }) => {
    const { restaurantName: urlRestaurantName, templateKey: urlTemplateKey } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const templateKey = propTemplateKey || urlTemplateKey || 'pizza1';
    const isMasterView = !restaurantName;

    const [isLoading, setIsLoading] = useState(true);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const { addToCart, setIsCartOpen } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = isMasterView
                    ? `/.netlify/functions/templates?templateKey=${templateKey}`
                    : `/.netlify/functions/public-menu?restaurantName=${encodeURIComponent(restaurantName)}`;
                const res = await fetch(endpoint);
                const data = await res.json();
                if (isMasterView && data.items) {
                    setMenuItems(data.items.map(i => ({ ...i, image: i.image_url })));
                } else if (data.menu?.config) {
                    setMenuItems(data.menu.config.items || []);
                }
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchData();
    }, [restaurantName, templateKey, isMasterView]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % menuItems.length);
    };

    const handleAddToCart = () => {
        addToCart({ ...menuItems[currentIndex], quantity: 1 });
        setIsCartOpen(true);
    };

    if (isLoading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading swipes...</div>;
    if (menuItems.length === 0) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">No items found</div>;

    const currentItem = menuItems[currentIndex];

    return (
        <div className="min-h-screen bg-[#0f1115] overflow-hidden flex flex-col p-4 md:p-10 font-sans">
            <header className="py-4 px-2 flex justify-between items-center z-50">
                <button
                    onClick={() => setShowAuthSidebar(true)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
                <h1 className="text-white font-black text-xl tracking-tighter uppercase italic">{isMasterView ? 'Swipe Mode' : restaurantName}</h1>
                <div className="text-gray-500 font-black text-sm">{currentIndex + 1} / {menuItems.length}</div>
            </header>

            <div className="flex-1 relative flex items-center justify-center p-4">
                <div className="relative w-full max-w-md aspect-[3/4] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
                    <img src={currentItem.image} alt={currentItem.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 pt-20">
                        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 inline-block border border-white/20">{currentItem.category}</span>
                        <h3 className="text-3xl font-black text-white leading-tight mb-2 uppercase tracking-tight">{currentItem.name}</h3>
                        <p className="text-gray-300 text-sm font-medium line-clamp-2 mb-4 leading-relaxed">{currentItem.description}</p>
                        <div className="text-3xl font-black text-white">${parseFloat(currentItem.price).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="pb-10 flex gap-6 justify-center items-center z-50">
                <button
                    onClick={handleNext}
                    className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                    <HiXMark className="w-8 h-8" />
                </button>
                <button
                    onClick={handleAddToCart}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-2xl hover:scale-110 active:scale-90 transition-all border-8 border-gray-900/5"
                >
                    <HiShoppingBag className="w-10 h-10" />
                </button>
                <button
                    onClick={handleNext}
                    className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                    <HiCheck className="w-8 h-8" />
                </button>
            </div>

            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={isMasterView ? 'Swipe Mode' : config.restaurantName || restaurantName}
                themeColor="#ffffff"
            />

            <Checkout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                restaurantName={restaurantName}
                themeColor="#ffffff"
            />

            <Cart onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />

            <WelcomeSequence
                restaurantName={isMasterView ? 'Swipe Mode' : config.restaurantName || restaurantName}
                themeColor="#f97316"
                language="fr"
            />
        </div>
    );
};

export default PublicMenuSwipe;
