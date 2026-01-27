import React, { useState, useEffect } from 'react';
import { HiHeart, HiOutlineHeart, HiShoppingBag, HiMinus, HiPlus, HiChevronRight } from 'react-icons/hi2';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Checkout from '../components/menu/Checkout';
import Cart from '../components/menu/Cart';
import WelcomeSequence from '../components/public-menu/WelcomeSequence';
import { useLanguage } from '../context/LanguageContext';
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar';
import PersistentOrderTracker from '../components/PersistentOrderTracker';
import { useClientAuth } from '../context/ClientAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserCircle, HiOutlineLogout, HiOutlineLogin, HiOutlineClipboardList, HiOutlineUserAdd, HiOutlineShoppingBag, HiOutlineClipboard } from 'react-icons/hi';
import { HiXMark, HiOutlineClipboardDocumentList } from 'react-icons/hi2';

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
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const { addToCart, setIsCartOpen } = useCart();
    const { t, localize } = useLanguage();
    const { user: clientUser, activeOrderId, activeOrder, handleCloseTracker, isTopTrackerHidden } = useClientAuth();

    useEffect(() => {
        const handleOpenAuth = () => {
            setShowAuthSidebar(true);
        };
        window.addEventListener('openClientAuth', handleOpenAuth);
        return () => window.removeEventListener('openClientAuth', handleOpenAuth);
    }, []);

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

    const categories = ['All', ...new Set(menuItems.map(item => localize(item, 'category')))];
    const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter(i => localize(i, 'category') === activeCategory);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24
            }
        }
    };

    if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {activeOrder && !isTopTrackerHidden && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
                <PersistentOrderTracker
                    order={activeOrder}
                    onClose={handleCloseTracker}
                    themeColor={config.themeColor}
                />
            )}
            {/* Header */}
            <header className="bg-white px-6 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAuthSidebar(true)}
                        className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
                        style={{ color: config.themeColor }}
                    >
                        <HiOutlineUserCircle size={24} />
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{isMasterView ? 'Master List' : config.restaurantName || restaurantName}</h1>
                </div>
                <div className="flex gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            style={activeCategory === cat ? { backgroundColor: config.themeColor } : {}}
                        >
                            {cat === 'All' ? t('auth.menu.all') : cat}
                        </button>
                    ))}
                </div>
            </header>

            <motion.div
                layout
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto w-full p-6 space-y-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map(item => (
                        <motion.div
                            key={item.id}
                            layout
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="bg-white rounded-[2rem] p-4 flex gap-6 hover:shadow-xl transition-shadow group border border-gray-50"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shrink-0 shadow-sm">
                                <motion.img
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.4 }}
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 py-2 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{localize(item, 'name')}</h3>
                                        <motion.span
                                            key={item.price}
                                            initial={{ scale: 1.2, color: config.themeColor }}
                                            animate={{ scale: 1, color: config.themeColor }}
                                            className="text-xl font-black"
                                        >
                                            ${parseFloat(item.price).toFixed(2)}
                                        </motion.span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: localize(item, 'description') }} />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-gray-50 text-gray-400 rounded-lg">{localize(item, 'category')}</span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { addToCart({ ...item, quantity: 1 }); setIsCartOpen(true); }}
                                        className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                                        style={{ backgroundColor: config.themeColor }}
                                    >
                                        {t('auth.menu.addToCart')}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Sidebar preserved for Auth triggers */}
            <PublicMenuSidebar
                isOpen={showAuthSidebar}
                onClose={() => setShowAuthSidebar(false)}
                restaurantName={restaurantName}
                displayName={isMasterView ? 'Master List' : config.restaurantName || restaurantName}
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
                restaurantName={isMasterView ? 'Master List' : config.restaurantName || restaurantName}
                themeColor={config.themeColor}
                promoConfig={config}
            />
        </div >
    );
};

export default PublicMenuList;
