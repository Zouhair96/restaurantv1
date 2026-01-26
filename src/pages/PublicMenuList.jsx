import React, { useState, useEffect } from 'react';
import { HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiChevronRight } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';

const PublicMenuList = ({ restaurantName: propRestaurantName, templateKey: propTemplateKey }) => {
    const { restaurantName: urlRestaurantName, templateKey: urlTemplateKey } = useParams();
    const restaurantName = propRestaurantName || urlRestaurantName;
    const templateKey = propTemplateKey || urlTemplateKey || 'pizza1';
    const isMasterView = !restaurantName;

    const [menuItems, setMenuItems] = useState([]);
    const [config, setConfig] = useState({ themeColor: '#10b981' });
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
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
                    setConfig({ themeColor: data.config?.themeColor || '#10b981' });
                } else if (data.menu?.config) {
                    setMenuItems(data.menu.config.items || []);
                    setConfig(data.menu.config);
                }
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchData();
    }, [restaurantName, templateKey, isMasterView]);

    const categories = ['All', ...new Set(menuItems.map(item => item.category))];
    const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);

    if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white px-6 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAuthSidebar(true)}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{isMasterView ? 'Master List' : restaurantName}</h1>
                </div>
                <div className="flex gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            style={activeCategory === cat ? { backgroundColor: config.themeColor } : {}}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* List */}
            <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-[2rem] p-4 flex gap-6 hover:shadow-xl transition-all group border border-gray-50">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shrink-0 shadow-sm">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="flex-1 py-2 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{item.name}</h3>
                                    <span className="text-xl font-black text-green-600" style={{ color: config.themeColor }}>${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1 leading-relaxed font-medium">{item.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-gray-50 text-gray-400 rounded-lg">{item.category}</span>
                                <button
                                    onClick={() => { addToCart({ ...item, quantity: 1 }); setIsCartOpen(true); }}
                                    className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                                    style={{ backgroundColor: config.themeColor }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={isMasterView ? 'Master List' : config.restaurantName || restaurantName}
                themeColor={config.themeColor}
            />
        </div>
    );
};

export default PublicMenuList;
