import React, { useState, useEffect } from 'react';
import { HiOutlineUserCircle, HiOutlineX, HiOutlineShoppingBag, HiOutlineLogout, HiOutlineLogin, HiOutlineClipboardList, HiOutlineUserAdd } from 'react-icons/hi';

const PublicMenuSidebar = ({ isOpen, onClose, restaurantName, designConfig }) => {
    const [view, setView] = useState('login'); // 'login', 'signup', 'profile'
    const [clientUser, setClientUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

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
        <div className={`fixed inset-y-0 left-0 z-[100] w-full sm:w-96 bg-[#0f1115] border-r border-white/10 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1a1c23]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yum-primary/20 flex items-center justify-center text-yum-primary">
                        <HiOutlineUserCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-lg">My Profile</h2>
                        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">{restaurantName}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <HiOutlineX size={24} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto h-[calc(100vh-88px)]">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                        {error}
                    </div>
                )}

                {view === 'login' && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-white mb-2">Welcome Back!</h3>
                            <p className="text-gray-400 text-sm">Log in to track your orders and earn rewards.</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yum-primary transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yum-primary transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-yum-primary text-white font-black rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Logging in...' : <><HiOutlineLogin size={20} /> Login</>}
                            </button>
                        </form>
                        <p className="mt-8 text-center text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <button onClick={() => setView('signup')} className="text-yum-primary font-bold hover:underline">Sign up</button>
                        </p>
                    </div>
                )}

                {view === 'signup' && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-white mb-2">Join Us!</h3>
                            <p className="text-gray-400 text-sm">Create an account for a personalized experience.</p>
                        </div>
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yum-primary transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yum-primary transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yum-primary transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-yum-primary text-white font-black rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Creating account...' : <><HiOutlineUserAdd size={20} /> Sign Up</>}
                            </button>
                        </form>
                        <p className="mt-8 text-center text-gray-500 text-sm">
                            Already have an account?{' '}
                            <button onClick={() => setView('login')} className="text-yum-primary font-bold hover:underline">Login</button>
                        </p>
                    </div>
                )}

                {view === 'profile' && clientUser && (
                    <div className="animate-fade-in space-y-8">
                        {/* User Summary */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="text-white font-black text-xl mb-1">{clientUser.name}</h4>
                            <p className="text-gray-500 text-sm mb-6">{clientUser.email}</p>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm"
                            >
                                <HiOutlineLogout size={18} /> Logout
                            </button>
                        </div>

                        {/* Order History */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <HiOutlineClipboardList className="text-yum-primary" size={20} />
                                <h3 className="text-white font-black uppercase tracking-widest text-sm">Order History</h3>
                            </div>

                            <div className="space-y-4">
                                {orders.length > 0 ? orders.map(order => (
                                    <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-white font-bold block">Order #{order.id}</span>
                                                <span className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-yum-primary/20 text-yum-primary'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-gray-400 text-sm">{order.order_type === 'dine_in' ? '🍽️ Dine In' : '🥡 Take Out'}</span>
                                            <span className="text-white font-black text-lg">${Number(order.total_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <HiOutlineShoppingBag size={48} className="mx-auto text-gray-700 mb-4" />
                                        <p className="text-gray-500 font-bold">No orders yet</p>
                                        <p className="text-gray-600 text-xs mt-1">Your delicious meals will appear here!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicMenuSidebar;
