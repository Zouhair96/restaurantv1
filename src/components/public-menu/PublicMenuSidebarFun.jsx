import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserCircle, HiOutlineX, HiOutlineShoppingBag, HiOutlineLogout, HiOutlineLogin, HiOutlineClipboardList, HiOutlineUserAdd, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { HiXMark, HiUser, HiEnvelope, HiLockClosed, HiArrowRightOnRectangle, HiArchiveBox, HiChevronRight, HiSparkles } from 'react-icons/hi2';
import { FaInstagram, FaFacebookF, FaTiktok, FaGoogle } from 'react-icons/fa6';
import { FaSnapchatGhost } from 'react-icons/fa';
import { useClientAuth } from '../../context/ClientAuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations';

const PublicMenuSidebarFun = ({ isOpen, onClose, restaurantName, displayName, designConfig, isDarkMode, setIsDarkMode, themeColor = '#f97316', socialMedia, loyaltyInfo }) => {
    const { user: authUser, logout: authLogout, activeOrderId, activeOrder } = useClientAuth();
    const { language, toggleLanguage, t } = useLanguage();
    const [view, setView] = useState('welcome');
    const [clientUser, setClientUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showHistory, setShowHistory] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const lang = language.toLowerCase();

    useEffect(() => {
        const storedUser = localStorage.getItem('client_user');
        const token = localStorage.getItem('client_token');
        if (storedUser && token) {
            setClientUser(JSON.parse(storedUser));
            setView('profile');
            fetchOrders(token);
        }

        const handleRefresh = () => {
            const token = localStorage.getItem('client_token');
            if (token) fetchOrders(token);
        };

        window.addEventListener('clientOrderPlaced', handleRefresh);
        window.addEventListener('openClientAuth', () => {
            setView('login');
            onClose();
        });

        const interval = setInterval(() => {
            const token = localStorage.getItem('client_token');
            if (token && view === 'profile') fetchOrders(token);
        }, 30000);

        return () => {
            window.removeEventListener('clientOrderPlaced', handleRefresh);
            clearInterval(interval);
        };
    }, [view]);

    const fetchOrders = async (token) => {
        if (!restaurantName) return;
        try {
            const response = await fetch(`/.netlify/functions/get-client-orders?restaurantName=${encodeURIComponent(restaurantName)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/.netlify/functions/client-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email.replace(/\s+/g, ''),
                    password: formData.password,
                    restaurantName
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('client_token', data.token);
            localStorage.setItem('client_user', JSON.stringify(data.user));
            setClientUser(data.user);
            setView('profile');
            fetchOrders(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/.netlify/functions/client-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    restaurantName
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Signup failed');

            localStorage.setItem('client_token', data.token);
            localStorage.setItem('client_user', JSON.stringify(data.user));
            setClientUser(data.user);
            setView('profile');
            fetchOrders(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
        setClientUser(null);
        setOrders([]);
        setView('login');
    };

    const MiniStepper = ({ status, themeColor }) => {
        const steps = ['pending', 'preparing', 'ready', 'completed'];
        const currentStepIndex = steps.indexOf(status);

        return (
            <div className="flex items-center justify-between mb-4 mt-2 px-1">
                {steps.map((step, idx) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-1.5 relative">
                            <motion.div
                                animate={idx <= currentStepIndex ? { scale: [1, 1.2, 1], opacity: 1 } : { scale: 1, opacity: 0.3 }}
                                className={`w-3 h-3 rounded-full shadow-sm border-2 border-white ${idx <= currentStepIndex ? 'bg-gradient-to-br from-orange-400 to-pink-500' : 'bg-gray-300'}`}
                            />
                            {idx === currentStepIndex && (
                                <motion.div
                                    layoutId="mini-active-glow"
                                    className="absolute -inset-1 rounded-full opacity-30 blur-sm bg-pink-400"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                            )}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 h-[4px] mx-1 rounded-full overflow-hidden bg-white">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: idx < currentStepIndex ? '100%' : '0%' }}
                                    className="h-full bg-gradient-to-r from-orange-400 to-pink-500"
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-[100] w-full sm:w-96 shadow-2xl flex flex-col bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 border-r-4 border-white"
                    >
                        <style>{`
                            .no-scrollbar::-webkit-scrollbar { display: none; }
                            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                            .text-gradient { background-clip: text; -webkit-background-clip: text; color: transparent; background-image: linear-gradient(to right, #f97316, #ec4899); }
                        `}</style>

                        {/* Header */}
                        <div className="p-6 relative shrink-0 z-10">
                            <div className="flex items-center justify-between">
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleLanguage}
                                    className="w-10 h-10 rounded-full bg-white shadow-lg text-orange-500 font-black text-xs flex items-center justify-center border-2 border-orange-100"
                                >
                                    {language.toUpperCase()}
                                </motion.button>

                                <h2 className="font-black text-xl text-gray-800 tracking-tight">
                                    {displayName || restaurantName}
                                </h2>

                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white shadow-lg text-pink-500 flex items-center justify-center border-2 border-pink-100"
                                >
                                    <HiXMark size={24} />
                                </motion.button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 min-h-0 no-scrollbar relative z-0">
                            {error && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mb-6 p-4 bg-red-100 border-2 border-red-200 rounded-2xl text-red-500 text-sm font-black text-center shadow-lg"
                                >
                                    ⚠️ {error}
                                </motion.div>
                            )}

                            {view === 'welcome' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center -mt-10"
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-white shadow-xl border-4 border-orange-100"
                                    >
                                        <div className="bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-full p-6">
                                            <HiOutlineUserCircle size={48} />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-3xl font-black mb-2 text-gray-800">
                                        {loyaltyInfo?.uiState === 'WELCOME' ? t('auth.welcomeTitle') : t('auth.welcomeBackTitle')}
                                    </h3>
                                    <p className="mb-8 px-4 text-gray-500 font-medium">
                                        {t('auth.welcomeSubtitle')}
                                    </p>

                                    <div className="w-full space-y-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setView('login')}
                                            className="w-full py-4 text-white font-black rounded-2xl shadow-xl bg-gradient-to-r from-orange-400 to-pink-500 text-lg"
                                        >
                                            {t('auth.loginButton')}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setView('signup')}
                                            className="w-full py-4 bg-white text-gray-800 font-black rounded-2xl shadow-lg border-2 border-orange-100 text-lg hover:bg-orange-50"
                                        >
                                            {t('auth.registerButton')}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'login' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-black mb-2 text-gray-800">{t('auth.loginTitle')}</h3>
                                        <p className="text-gray-500 font-medium text-sm">{t('auth.welcomeSubtitle')}</p>
                                    </div>
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="bg-white p-2 rounded-3xl shadow-sm border-2 border-orange-100">
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1 text-orange-400 pl-3 pt-1">{t('auth.emailOrPhone')}</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 bg-transparent text-gray-800 font-bold focus:outline-none"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="bg-white p-2 rounded-3xl shadow-sm border-2 border-orange-100">
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1 text-orange-400 pl-3 pt-1">{t('auth.password')}</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-4 py-2 bg-transparent text-gray-800 font-bold focus:outline-none"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 text-white font-black rounded-2xl shadow-xl bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center gap-2 text-lg"
                                        >
                                            {loading ? '...' : <><HiOutlineLogin size={24} /> {t('auth.submitLogin')}</>}
                                        </motion.button>
                                    </form>
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setView('forgot-password')}
                                            className="text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors"
                                        >
                                            {t('auth.forgotPassword')}
                                        </button>
                                    </div>
                                    <p className="mt-4 text-center text-sm text-gray-500 font-medium">
                                        {t('auth.toggleToSignup')} {' '}
                                        <button onClick={() => setView('signup')} className="font-black text-orange-500 hover:underline">{t('auth.linkSignup')}</button>
                                    </p>
                                </motion.div>
                            )}

                            {view === 'signup' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-black mb-2 text-gray-800">{t('auth.signupTitle')}</h3>
                                        <p className="text-gray-500 font-medium text-sm">{t('auth.welcomeSubtitle')}</p>
                                    </div>
                                    <form onSubmit={handleSignup} className="space-y-4">
                                        <div className="bg-white p-2 rounded-3xl shadow-sm border-2 border-orange-100">
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1 text-orange-400 pl-3 pt-1">{t('auth.name')}</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 bg-transparent text-gray-800 font-bold focus:outline-none"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="bg-white p-2 rounded-3xl shadow-sm border-2 border-orange-100">
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1 text-orange-400 pl-3 pt-1">{t('auth.emailOrPhoneLong')}</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 bg-transparent text-gray-800 font-bold focus:outline-none"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="bg-white p-2 rounded-3xl shadow-sm border-2 border-orange-100">
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1 text-orange-400 pl-3 pt-1">{t('auth.password')}</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-4 py-2 bg-transparent text-gray-800 font-bold focus:outline-none"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 text-white font-black rounded-2xl shadow-xl bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center gap-2 text-lg"
                                        >
                                            {loading ? '...' : <><HiOutlineUserAdd size={24} /> {t('auth.submitSignup')}</>}
                                        </motion.button>
                                    </form>
                                    <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                                        {t('auth.toggleToLogin')} {' '}
                                        <button onClick={() => setView('login')} className="font-black text-orange-500 hover:underline">{t('auth.linkLogin')}</button>
                                    </p>
                                </motion.div>
                            )}

                            {view === 'forgot-password' && (
                                <div className="animate-fade-in">
                                    <div className="text-center mb-8">
                                        <h3 className="text-3xl font-black mb-2 text-gray-800">{t('auth.resetPasswordTitle')}</h3>
                                        <p className="text-gray-500 font-medium text-sm">{t('auth.resetPasswordSubtitle')}</p>
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); /* Handle reset logic */ }} className="space-y-4">
                                        <div className="bg-white p-2 rounded-3xl shadow-sm border-2 border-orange-100">
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1 text-orange-400 pl-3 pt-1">{t('auth.emailOrPhoneLong')}</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 bg-transparent text-gray-800 font-bold focus:outline-none"
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="w-full py-4 text-white font-black rounded-2xl shadow-xl bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center gap-2 text-lg"
                                        >
                                            {t('auth.sendResetLink')}
                                        </motion.button>
                                    </form>
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setView('login')}
                                            className="text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors"
                                        >
                                            {t('auth.backToLogin')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'profile' && clientUser && (
                                <div className="animate-fade-in space-y-8">
                                    {/* User Summary */}
                                    <div className="p-6 rounded-3xl bg-white shadow-lg border-2 border-orange-100 flex flex-col items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-orange-200 to-pink-200 opacity-20" />

                                        {/* Profile Photo Uploader */}
                                        <div className="relative mb-4 group cursor-pointer z-10">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const newUser = { ...clientUser, photo: reader.result };
                                                            setClientUser(newUser);
                                                            localStorage.setItem('client_user', JSON.stringify(newUser));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                                            />
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative shadow-xl border-4 border-white"
                                            >
                                                {clientUser.photo ? (
                                                    <img src={clientUser.photo} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                                                        <HiUser size={48} />
                                                    </div>
                                                )}
                                            </motion.div>
                                            <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md z-10 text-xs border border-gray-100">
                                                ✏️
                                            </div>
                                        </div>

                                        <h4 className="font-black text-2xl mb-1 text-gray-800 z-10">{clientUser.name}</h4>
                                        <p className="text-sm mb-6 text-gray-500 font-medium z-10">{clientUser.email}</p>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 transition-colors font-bold text-sm text-red-400 hover:text-red-500 z-10"
                                        >
                                            <HiOutlineLogout size={18} /> {t('header.logout')}
                                        </button>
                                    </div>

                                    {/* Order History Section */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowHistory(!showHistory)}
                                            className="w-full flex items-center justify-between p-5 mb-4 rounded-3xl bg-white shadow-lg border-2 border-orange-100 transition-all hover:shadow-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-orange-100 p-2 rounded-xl text-orange-500">
                                                    <HiOutlineClipboardList size={24} />
                                                </div>
                                                <span className="font-black uppercase tracking-widest text-sm text-gray-800">{t('auth.orderHistory')}</span>
                                                {orders.length > 0 && (
                                                    <span className="px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-600 font-black">{orders.length}</span>
                                                )}
                                            </div>
                                            <motion.div animate={{ rotate: showHistory ? 180 : 0 }}>
                                                <HiChevronRight size={20} className="text-gray-400" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {showHistory && (
                                                <motion.div
                                                    key="history-panel"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-4 px-1 pb-10"
                                                >
                                                    {orders.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {orders.map(order => {
                                                                const isActive = activeOrderId && String(order.id) === String(activeOrderId);
                                                                return (
                                                                    <motion.div
                                                                        key={order.id}
                                                                        onClick={() => setSelectedOrder(order)}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        className={`border-2 rounded-3xl p-5 cursor-pointer bg-white shadow-sm ${isActive ? 'border-pink-400 ring-4 ring-pink-100' : 'border-gray-100 hover:border-orange-200'}`}
                                                                    >
                                                                        {isActive && (
                                                                            <MiniStepper status={activeOrder?.status || order.status} themeColor={themeColor} />
                                                                        )}

                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div>
                                                                                <span className="font-black block text-gray-800 text-lg">#{String(order.id).slice(0, 8)}</span>
                                                                                <span className="text-xs text-gray-400 font-bold uppercase">{new Date(order.created_at).toLocaleDateString()}</span>
                                                                            </div>
                                                                            <span
                                                                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                                                                style={order.status === 'completed' ? { backgroundColor: '#dcfce7', color: '#166534' } :
                                                                                    order.status === 'cancelled' ? { backgroundColor: '#fee2e2', color: '#991b1b' } :
                                                                                        { backgroundColor: '#ffedd5', color: '#c2410c' }}
                                                                            >
                                                                                {order.status}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-100">
                                                                            <span className="text-sm text-gray-500 font-medium">{order.order_type === 'dine_in' ? `🍽️ ${t('auth.dineIn')}` : `🥡 ${t('auth.takeOut')}`}</span>
                                                                            <span className="font-black text-xl text-gray-800">${Number(order.total_price).toFixed(2)}</span>
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 rounded-3xl bg-white/50 border-2 border-dashed border-gray-200">
                                                            <HiOutlineShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                                                            <p className="font-bold text-gray-400">{t('auth.noOrders')}</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Social Footer */}
                        <div className="p-6 relative z-10 mt-auto flex flex-col items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                {language === 'en' ? 'Follow Us' : 'Suivez-nous'}
                            </span>
                            <div className="flex items-center justify-center gap-3">
                                {[
                                    { key: 'instagram', Icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
                                    { key: 'facebook', Icon: FaFacebookF, color: '#1877F2', label: 'Facebook' },
                                    { key: 'tiktok', Icon: FaTiktok, color: '#000000', label: 'TikTok' },
                                    { key: 'snapchat', Icon: FaSnapchatGhost, color: '#FFFC00', label: 'Snapchat' },
                                    { key: 'google', Icon: FaGoogle, color: '#4285F4', label: 'Google Reviews' }
                                ].filter(social => {
                                    if (!socialMedia) return true;
                                    return socialMedia[social.key]?.show;
                                }).map(social => ({
                                    ...social,
                                    href: socialMedia?.[social.key]?.url || '#'
                                })).map((social, idx) => (
                                    <motion.a
                                        key={idx}
                                        href={social.href}
                                        whileHover={{ scale: 1.2, y: -4, rotate: [-5, 5, 0] }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100"
                                        title={social.label}
                                    >
                                        <social.Icon size={18} style={{ color: social.Icon === FaSnapchatGhost ? '#FFFC00' : social.color }} className={social.Icon === FaSnapchatGhost ? 'filter drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]' : ''} />
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PublicMenuSidebarFun;
