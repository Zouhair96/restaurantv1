import React, { useState, useEffect } from 'react';
import { HiShoppingBag } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import Checkout from '../components/menu/Checkout';
import Cart from '../components/menu/Cart';
import WelcomeSequence from '../components/public-menu/WelcomeSequence';

const PublicMenuMagazine = ({ restaurantName: propRestaurantName, templateKey: propTemplateKey }) => {
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
                    setConfig({ themeColor: data.config?.themeColor || '#ec4899' });
                } else if (data.menu?.config) {
                    setMenuItems(data.menu.config.items || []);
                    setConfig(data.menu.config);
                }
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchData();
    }, [restaurantName, templateKey, isMasterView]);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-10 font-serif">
            <header className="mb-12 border-b-4 border-black pb-8 relative">
                <button
                    onClick={() => setShowAuthSidebar(true)}
                    className="absolute right-0 top-0 p-2 text-black hover:bg-black hover:text-white transition-all border-2 border-black"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h1 className="text-6xl md:text-8xl font-black uppercase italic leading-none">{isMasterView ? 'Magazine' : restaurantName}</h1>
                <p className="mt-4 text-xl font-bold uppercase tracking-[0.3em]">The Daily Menu / Issue 01</p>
            </header>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {menuItems.map((item, idx) => (
                    <div key={item.id} className="break-inside-avoid bg-gray-50 p-6 rounded-sm border-2 border-black hover:bg-black hover:text-white transition-all group relative overflow-hidden">
                        <div className="mb-4 aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-3xl font-black uppercase mb-2 leading-tight">{item.name}</h3>
                        <p className="text-sm font-medium mb-6 leading-relaxed opacity-70">{item.description}</p>
                        <div className="flex items-center justify-between border-t-2 border-current pt-4">
                            <span className="text-2xl font-black">${parseFloat(item.price).toFixed(2)}</span>
                            <button
                                onClick={() => { addToCart({ ...item, quantity: 1 }); setIsCartOpen(true); }}
                                className="w-12 h-12 bg-black text-white group-hover:bg-white group-hover:text-black flex items-center justify-center rounded-full transition-colors border border-current"
                            >
                                <HiShoppingBag className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={isMasterView ? 'Magazine' : config.restaurantName || restaurantName}
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
                restaurantName={isMasterView ? 'Magazine' : config.restaurantName || restaurantName}
                themeColor={config.themeColor}
                promoConfig={config}
            />
        </div>
    );
};

export default PublicMenuMagazine;
