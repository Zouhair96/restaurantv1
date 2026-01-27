import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserCircle, HiOutlineX, HiOutlineShoppingBag, HiOutlineLogout, HiOutlineLogin, HiOutlineClipboardList, HiOutlineUserAdd, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { HiXMark, HiUser, HiEnvelope, HiLockClosed, HiArrowRightOnRectangle, HiArchiveBox, HiChevronRight } from 'react-icons/hi2';
import { FaInstagram, FaFacebookF, FaTiktok, FaSnapchatGhost, FaGoogle } from 'react-icons/fa6';
import { useClientAuth } from '../../context/ClientAuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations';
import PersistentOrderTracker from '../PersistentOrderTracker';

const PublicMenuSidebar = ({ isOpen, onClose, restaurantName, displayName, designConfig, isDarkMode, setIsDarkMode, themeColor = '#f97316' }) => {
    const { user: authUser, logout: authLogout, activeOrderId, activeOrder, handleCloseTracker } = useClientAuth();
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

    const lang = language.toLowerCase();

    useEffect(() => {
        const storedUser = localStorage.getItem('client_user');
        const token = localStorage.getItem('client_token');
        if (storedUser && token) {
            setClientUser(JSON.parse(storedUser));
            setView('profile');
            fetchOrders(token);
        }

        // Real-time synchronization
        const handleRefresh = () => {
            const token = localStorage.getItem('client_token');
            if (token) fetchOrders(token);
        };

        window.addEventListener('clientOrderPlaced', handleRefresh);
        window.addEventListener('openClientAuth', () => {
            setView('login');
            onClose(); // In case it's used elsewhere, but mainly for the sidebar to reset
            // We need a way to open it, but the parent manages isOpen.
        });

        // Polling for status updates from restaurant
        const interval = setInterval(() => {
            const token = localStorage.getItem('client_token');
            if (token && view === 'profile') fetchOrders(token);
        }, 30000); // Poll every 30 seconds

        return () => {
            window.removeEventListener('clientOrderPlaced', handleRefresh);
            clearInterval(interval);
        };
    }, [view]);

    const fetchOrders = async (token) => {
        if (!restaurantName) {
            console.warn('Cannot fetch orders: restaurantName is undefined');
            return;
        }
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
                    email: formData.email,
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
                                className={`w-2 h-2 rounded-full shadow-sm ${idx <= currentStepIndex ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
                                style={idx <= currentStepIndex ? { backgroundColor: themeColor } : {}}
                            />
                            {idx === currentStepIndex && (
                                <motion.div
                                    layoutId="mini-active-glow"
                                    className="absolute -inset-1 rounded-full opacity-30 blur-sm"
                                    style={{ backgroundColor: themeColor }}
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                            )}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: idx < currentStepIndex ? '100%' : '0%' }}
                                    className="h-full"
                                    style={{ backgroundColor: themeColor }}
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
                        className={`fixed inset-y-0 left-0 z-[100] w-full sm:w-96 border-r shadow-2xl ${isDarkMode
                            ? 'bg-[#0f1115] border-white/10'
                            : 'bg-white border-gray-200'}`}
                    >
                        {/* Header */}
                        <div className={`p-6 border-b flex items-center justify-between transition-colors ${isDarkMode
                            ? 'bg-[#1a1c23] border-white/5'
                            : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                                    <HiOutlineUserCircle size={24} />
                                </div>
                                <div>
                                    <h2 className={`font-black text-lg transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('auth.orderHistory')}</h2>
                                    <p className={`text-xs uppercase tracking-widest font-bold transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{displayName || restaurantName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleLanguage}
                                    className={`p-2 rounded-xl transition-all border font-bold text-xs w-10 flex items-center justify-center ${isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                        : 'bg-black/5 border-black/10 text-gray-900 hover:bg-black/10'
                                        }`}
                                >
                                    {language.toUpperCase()}
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-2 transition-colors rounded-xl"
                                    style={{ color: themeColor, backgroundColor: `${themeColor}10` }}
                                >
                                    <HiOutlineX size={24} />
                                </motion.button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto h-[calc(100vh-170px)]">
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {view === 'welcome' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center -mt-10"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                                        style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                                    >
                                        <HiOutlineUserCircle size={48} />
                                    </motion.div>
                                    <h3 className={`text-2xl font-black mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {t('auth.welcomeTitle')}
                                    </h3>
                                    <p className={`mb-8 px-4 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {t('auth.welcomeSubtitle')}
                                    </p>

                                    <div className="w-full space-y-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setView('login')}
                                            className="w-full py-4 text-white font-black rounded-xl transition-all shadow-lg"
                                            style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                                        >
                                            {t('auth.loginButton')}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setView('signup')}
                                            className={`w-full py-4 border-2 font-black rounded-xl transition-all ${isDarkMode
                                                ? 'border-white/20 text-white hover:bg-white/10'
                                                : 'border-gray-200 text-gray-900 hover:bg-gray-50'
                                                }`}
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
                                        <h3 className={`text-2xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('auth.loginTitle')}</h3>
                                        <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>{t('auth.welcomeSubtitle')}</p>
                                    </div>
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('auth.emailOrPhone')}</label>
                                            <input
                                                type="text"
                                                required
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yum-primary transition-all ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('auth.password')}</label>
                                            <input
                                                type="password"
                                                required
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yum-primary transition-all ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                                            style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                                        >
                                            {loading ? '...' : <><HiOutlineLogin size={20} /> {t('auth.submitLogin')}</>}
                                        </motion.button>
                                    </form>
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setView('forgot-password')}
                                            className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            {t('auth.forgotPassword')}
                                        </button>
                                    </div>
                                    <p className={`mt-4 text-center text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {t('auth.toggleToSignup')} {' '}
                                        <button onClick={() => setView('signup')} className="font-bold hover:underline" style={{ color: themeColor }}>{t('auth.linkSignup')}</button>
                                    </p>
                                </motion.div>
                            )}

                            {view === 'signup' && (
                                <div className="animate-fade-in">
                                    <div className="text-center mb-8">
                                        <h3 className={`text-2xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('auth.signupTitle')}</h3>
                                        <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>{t('auth.welcomeSubtitle')}</p>
                                    </div>
                                    <form onSubmit={handleSignup} className="space-y-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('auth.name')}</label>
                                            <input
                                                type="text"
                                                required
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yum-primary transition-all ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('auth.emailOrPhoneLong')}</label>
                                            <input
                                                type="text"
                                                required
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yum-primary transition-all ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('auth.password')}</label>
                                            <input
                                                type="password"
                                                required
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yum-primary transition-all ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                                            style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                                        >
                                            {loading ? '...' : <><HiOutlineUserAdd size={20} /> {t('auth.submitSignup')}</>}
                                        </button>
                                    </form>
                                    <p className={`mt-8 text-center text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {t('auth.toggleToLogin')} {' '}
                                        <button onClick={() => setView('login')} className="font-bold hover:underline" style={{ color: themeColor }}>{t('auth.linkLogin')}</button>
                                    </p>
                                </div>
                            )}

                            {view === 'forgot-password' && (
                                <div className="animate-fade-in">
                                    <div className="text-center mb-8">
                                        <h3 className={`text-2xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('auth.resetPasswordTitle')}</h3>
                                        <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>{t('auth.resetPasswordSubtitle')}</p>
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); /* Handle reset logic */ }} className="space-y-4">
                                        <div>
                                            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('auth.emailOrPhoneLong')}</label>
                                            <input
                                                type="text"
                                                required
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yum-primary transition-all ${isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-4 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                                            style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                                        >
                                            {t('auth.sendResetLink')}
                                        </button>
                                    </form>
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setView('login')}
                                            className={`text-sm font-medium hover:underline transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                        >
                                            {t('auth.backToLogin')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'profile' && clientUser && (
                                <div className="animate-fade-in space-y-8">
                                    {/* User Summary */}
                                    <div className={`p-6 rounded-2xl border transition-colors ${isDarkMode
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-gray-50 border-gray-100'}`}>
                                        <h4 className={`font-black text-xl mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{clientUser.name}</h4>
                                        <p className={`text-sm mb-6 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{clientUser.email}</p>
                                        <button
                                            onClick={handleLogout}
                                            className={`flex items-center gap-2 transition-colors font-bold text-sm ${isDarkMode
                                                ? 'text-gray-400 hover:text-red-500'
                                                : 'text-gray-500 hover:text-red-500'}`}
                                        >
                                            <HiOutlineLogout size={18} /> {t('header.logout')}
                                        </button>
                                    </div>

                                    {/* Order History Section */}
                                    <div className="relative">
                                        {/* History Toggle Button */}
                                        <button
                                            onClick={() => setShowHistory(!showHistory)}
                                            className={`w-full flex items-center justify-between p-4 mb-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-900 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <HiOutlineClipboardList style={{ color: themeColor }} size={20} />
                                                <span className="font-black uppercase tracking-widest text-xs">{t('auth.orderHistory')}</span>
                                                {orders.length > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 dark:bg-white/5 font-black">{orders.length}</span>
                                                )}
                                            </div>
                                            <motion.div animate={{ rotate: showHistory ? 180 : 0 }}>
                                                <HiChevronRight size={18} className="text-gray-400" />
                                            </motion.div>
                                        </button>

                                        {/* Dropdown Historical Orders */}
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
                                                        <motion.div
                                                            initial="hidden"
                                                            animate="visible"
                                                            variants={{
                                                                visible: { transition: { staggerChildren: 0.1 } }
                                                            }}
                                                            className="space-y-4"
                                                        >
                                                            {orders.map(order => {
                                                                const isActive = activeOrderId && String(order.id) === String(activeOrderId);
                                                                return (
                                                                    <motion.div
                                                                        key={order.id}
                                                                        variants={{
                                                                            hidden: { opacity: 0, y: 10 },
                                                                            visible: { opacity: 1, y: 0 }
                                                                        }}
                                                                        className={`border rounded-2xl p-4 transition-all group ${isDarkMode
                                                                            ? 'bg-white/5 border-white/10 hover:border-white/20'
                                                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                                                                            } ${isActive ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''}`}
                                                                        style={isActive ? { ringColor: themeColor, borderColor: themeColor } : {}}
                                                                    >
                                                                        {isActive && (
                                                                            <MiniStepper status={activeOrder?.status || order.status} themeColor={themeColor} />
                                                                        )}

                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div>
                                                                                <span className={`font-bold block transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order #{String(order.id).slice(0, 8)}</span>
                                                                                <span className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(order.created_at).toLocaleDateString()}</span>
                                                                            </div>
                                                                            <span
                                                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter`}
                                                                                style={order.status === 'completed' ? { backgroundColor: '#22c55e33', color: '#22c55e' } :
                                                                                    order.status === 'cancelled' ? { backgroundColor: '#ef444433', color: '#ef4444' } :
                                                                                        { backgroundColor: `${themeColor}33`, color: themeColor }}
                                                                            >
                                                                                {order.status}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex justify-between items-center mt-4">
                                                                            <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.order_type === 'dine_in' ? `🍽️ ${t('auth.dineIn')}` : `🥡 ${t('auth.takeOut')}`}</span>
                                                                            <span className={`font-black text-lg transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${Number(order.total_price).toFixed(2)}</span>
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    ) : (
                                                        <div className={`text-center py-12 rounded-2xl border border-dashed transition-colors ${isDarkMode
                                                            ? 'bg-white/5 border-white/10'
                                                            : 'bg-gray-50 border-gray-200'}`}>
                                                            <HiOutlineShoppingBag size={48} className={`mx-auto mb-4 transition-colors ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                                                            <p className={`font-bold transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('auth.noOrders')}</p>
                                                            <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>{t('auth.noOrdersDesc')}</p>
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
                        <div className={`p-6 border-t mt-auto flex flex-col items-center gap-4 transition-colors ${isDarkMode
                            ? 'bg-[#1a1c23] border-white/5'
                            : 'bg-gray-50 border-gray-100'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {language === 'en' ? 'Follow Us' : 'Suivez-nous'}
                            </span>
                            <div className="flex items-center justify-center gap-4">
                                {[
                                    { Icon: FaInstagram, color: '#E1306C', label: 'Instagram', href: '#' },
                                    { Icon: FaFacebookF, color: '#1877F2', label: 'Facebook', href: '#' },
                                    { Icon: FaTiktok, color: isDarkMode ? '#FFFFFF' : '#000000', label: 'TikTok', href: '#' },
                                    { Icon: FaSnapchatGhost, color: '#FFFC00', label: 'Snapchat', href: '#' },
                                    { Icon: FaGoogle, color: '#4285F4', label: 'Google Reviews', href: '#' }
                                ].map((social, idx) => (
                                    <motion.a
                                        key={idx}
                                        href={social.href}
                                        whileHover={{ scale: 1.2, y: -4 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5"
                                        title={social.label}
                                    >
                                        <social.Icon size={18} style={{ color: social.Icon === FaSnapchatGhost ? '#FFFC00' : (social.Icon === FaTiktok && !isDarkMode ? '#000000' : social.color) }} className={social.Icon === FaSnapchatGhost ? 'filter drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]' : ''} />
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

export default PublicMenuSidebar;
