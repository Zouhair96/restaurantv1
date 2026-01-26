import React, { useState, useEffect } from 'react';
import { HiShoppingBag } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';

const PublicMenuMinimal = ({ restaurantName: propRestaurantName, templateKey: propTemplateKey }) => {
    const { restaurantName: urlRestaurantName, templateKey: urlTemplateKey } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const templateKey = propTemplateKey || urlTemplateKey || 'pizza1';
    const isMasterView = !restaurantName;

    const [menuItems, setMenuItems] = useState([]);
    const [config, setConfig] = useState({ themeColor: '#374151' });
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthSidebar, setShowAuthSidebar] = useState(false);
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
                    setConfig({ themeColor: data.config?.themeColor || '#374151' });
                } else if (data.menu?.config) {
                    setMenuItems(data.menu.config.items || []);
                    setConfig(data.menu.config);
                }
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchData();
    }, [restaurantName, templateKey, isMasterView]);

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-serif italic text-gray-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-serif selection:bg-stone-200">
            <header className="py-24 px-6 text-center max-w-2xl mx-auto border-b border-stone-200 relative">
                <button
                    onClick={() => setShowAuthSidebar(true)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors uppercase text-[10px] tracking-[0.2em]"
                >
                    Menu
                </button>
                <h1 className="text-5xl font-light tracking-[0.2em] uppercase leading-relaxed">{isMasterView ? 'Minimal' : restaurantName}</h1>
                <div className="w-12 h-[1px] bg-stone-400 mx-auto mt-8"></div>
            </header>

            <div className="max-w-xl mx-auto py-20 px-6 space-y-24">
                {menuItems.map((item) => (
                    <div key={item.id} className="text-center group transition-all duration-1000">
                        <div className="mb-10 aspect-square overflow-hidden bg-stone-100 rounded-sm">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-1000" />
                        </div>
                        <h3 className="text-2xl font-light tracking-widest uppercase mb-3">{item.name}</h3>
                        <p className="text-stone-500 font-serif italic mb-6 leading-relaxed px-4">{item.description}</p>
                        <div className="flex flex-col items-center gap-6">
                            <span className="text-xl font-light tracking-widest text-stone-400">/ ${parseFloat(item.price).toFixed(2)} /</span>
                            <button
                                onClick={() => { addToCart({ ...item, quantity: 1 }); setIsCartOpen(true); }}
                                className="px-10 py-3 border border-stone-300 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-500"
                            >
                                Order Selection
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="py-20 text-center border-t border-stone-100">
                <p className="text-[10px] uppercase tracking-[0.5em] text-stone-300 italic">Established MMXXIV</p>
            </footer>

            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={isMasterView ? 'Minimal' : config.restaurantName || restaurantName}
                themeColor={config.themeColor}
            />
        </div>
    );
};

export default PublicMenuMinimal;
