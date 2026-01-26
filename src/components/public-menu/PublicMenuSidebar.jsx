import React, { useState, useEffect } from 'react';
import { HiOutlineUserCircle, HiOutlineX, HiOutlineShoppingBag, HiOutlineLogout, HiOutlineLogin, HiOutlineClipboardList, HiOutlineUserAdd, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { HiXMark, HiUser, HiEnvelope, HiLockClosed, HiArrowRightOnRectangle, HiArchiveBox, HiChevronRight } from 'react-icons/hi2';
import { useClientAuth } from '../../context/ClientAuthContext';
import { translations } from '../../translations';
import PersistentOrderTracker from '../PersistentOrderTracker';

const PublicMenuSidebar = ({ isOpen, onClose, restaurantName, displayName, designConfig, isDarkMode, setIsDarkMode, themeColor = '#f97316' }) => {
    const { user: authUser, logout: authLogout, activeOrderId, handleCloseTracker } = useClientAuth();
    const [view, setView] = useState('welcome');
    const [language, setLanguage] = useState('FR'); // 'FR', 'EN'
    const [clientUser, setClientUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const lang = language.toLowerCase();
    const t = translations[lang]?.auth || translations['fr'].auth;
    const headerT = translations[lang]?.header || translations['fr'].header;

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

    return (
        <div className={`fixed inset-y-0 left-0 z-[100] w-full sm:w-96 border-r shadow-2xl transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode
            ? 'bg-[#0f1115] border-white/10'
            : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between transition-colors ${isDarkMode
                ? 'bg-[#1a1c23] border-white/5'
                : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                        <HiOutlineUserCircle size={24} />
                    </div>
                    <div>
                        <h2 className={`font-black text-lg transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{headerT.myOrders}</h2>
                        <p className={`text-xs uppercase tracking-widest font-bold transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{displayName || restaurantName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLanguage(language === 'FR' ? 'EN' : 'FR')}
                        className={`p-2 rounded-xl transition-all border font-bold text-xs w-10 flex items-center justify-center ${isDarkMode
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-black/5 border-black/10 text-gray-900 hover:bg-black/10'
                            }`}
                    >
                        {language}
                    </button>
                    <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                        <HiOutlineX size={24} />
                    </button>
                </div>
            </div>

            <div className="p-6 overflow-y-auto h-[calc(100vh-88px)]">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                        {error}
                    </div>
                )}

                {view === 'welcome' && (
                    <div className="animate-fade-in flex flex-col items-center justify-center h-full text-center -mt-10">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                            <HiOutlineUserCircle size={48} />
                        </div>
                        <h3 className={`text-2xl font-black mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Welcome!
                        </h3>
                        <p className={`mb-8 px-4 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Login to see all our features and enjoy our promos.
                        </p>

                        <div className="w-full space-y-4">
                            <button
                                onClick={() => setView('login')}
                                className="w-full py-4 text-white font-black rounded-xl transition-all shadow-lg"
                                style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setView('signup')}
                                className={`w-full py-4 border-2 font-black rounded-xl transition-all ${isDarkMode
                                    ? 'border-white/20 text-white hover:bg-white/10'
                                    : 'border-gray-200 text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                )}

                {view === 'login' && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h3 className={`text-2xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.loginTitle}</h3>
                            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>{t.welcomeSubtitle}</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.emailOrPhone}</label>
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
                                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.password}</label>
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
                                {loading ? '...' : <><HiOutlineLogin size={20} /> {t.submitLogin}</>}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setView('forgot-password')}
                                className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t.forgotPassword}
                            </button>
                        </div>
                        <p className={`mt-4 text-center text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t.toggleToSignup} {' '}
                            <button onClick={() => setView('signup')} className="font-bold hover:underline" style={{ color: themeColor }}>{t.linkSignup}</button>
                        </p>
                    </div>
                )}

                {view === 'signup' && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h3 className={`text-2xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.signupTitle}</h3>
                            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>{t.welcomeSubtitle}</p>
                        </div>
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.name}</label>
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
                                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.emailOrPhoneLong}</label>
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
                                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.password}</label>
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
                                {loading ? '...' : <><HiOutlineUserAdd size={20} /> {t.submitSignup}</>}
                            </button>
                        </form>
                        <p className={`mt-8 text-center text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t.toggleToLogin} {' '}
                            <button onClick={() => setView('login')} className="font-bold hover:underline" style={{ color: themeColor }}>{t.linkLogin}</button>
                        </p>
                    </div>
                )}

                {view === 'forgot-password' && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h3 className={`text-2xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.resetPasswordTitle}</h3>
                            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>{t.resetPasswordSubtitle}</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); /* Handle reset logic */ }} className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.emailOrPhoneLong}</label>
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
                                {t.sendResetLink}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setView('login')}
                                className={`text-sm font-medium hover:underline transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                                {t.backToLogin}
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
                                <HiOutlineLogout size={18} /> {headerT.logout}
                            </button>
                        </div>

                        {/* Order History */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <HiOutlineClipboardList style={{ color: themeColor }} size={20} />
                                <h3 className={`font-black uppercase tracking-widest text-sm transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.orderHistory}</h3>
                            </div>

                            {/* Ongoing Order Bar */}
                            {activeOrderId && (
                                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5">
                                    <PersistentOrderTracker
                                        orderId={activeOrderId}
                                        onClose={handleCloseTracker}
                                        themeColor={themeColor}
                                        inline={true}
                                    />
                                </div>
                            )}

                            <div className="space-y-4">
                                {orders.length > 0 ? orders.map(order => (
                                    <div key={order.id} className={`border rounded-2xl p-4 transition-all group ${isDarkMode
                                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`font-bold block transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.id}</span>
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
                                            <span className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.order_type === 'dine_in' ? `🍽️ ${t.dineIn}` : `🥡 ${t.takeOut}`}</span>
                                            <span className={`font-black text-lg transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${Number(order.total_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className={`text-center py-12 rounded-2xl border border-dashed transition-colors ${isDarkMode
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-gray-50 border-gray-200'}`}>
                                        <HiOutlineShoppingBag size={48} className={`mx-auto mb-4 transition-colors ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                                        <p className={`font-bold transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.noOrders}</p>
                                        <p className={`text-xs mt-1 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>{t.noOrdersDesc}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default PublicMenuSidebar;
