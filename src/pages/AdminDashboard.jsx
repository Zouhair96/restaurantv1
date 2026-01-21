import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../layouts/AdminLayout'

const AdminDashboard = () => {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState('dashboard')

    const [stats, setStats] = useState({
        total_revenue: '0.00',
        total_orders: 0,
        monthly_revenue: '0.00',
        monthly_growth_users: 0
    })
    const [platformSettings, setPlatformSettings] = useState({
        stripe_config: { commission_rate: 0.02, currency: 'eur' },
        general_config: { platform_name: 'YumYum', contact_email: 'admin@yumyum.com' },
        stripe_secret_key: { secret_key: '', is_set: false },
        stripe_webhook_secret: { secret_key: '', is_set: false }
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        // Redirection for non-admins
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/profile')
            } else {
                fetchData()
            }
        }
    }, [user, loading, navigate])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            // Parallel Fetch
            const [usersRes, statsRes, settingsRes] = await Promise.all([
                fetch('/.netlify/functions/admin-users', { headers }),
                fetch('/.netlify/functions/admin-stats', { headers }),
                fetch('/.netlify/functions/get-admin-settings', { headers })
            ])

            if (!usersRes.ok || !statsRes.ok) throw new Error('Failed to fetch dashboard data')

            const usersData = await usersRes.json()
            const statsData = await statsRes.json()

            setUsers(usersData)
            setStats(statsData)

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json()
                setPlatformSettings(prev => ({ ...prev, ...settingsData }))
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoadingData(false)
        }
    }

    if (loading || (isLoadingData && user?.role === 'admin')) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0f1115] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6359E9]"></div>
            </div>
        )
    }

    if (user?.role !== 'admin') {
        return null // Will redirect
    }

    return (
        <AdminLayout
            activeSection={activeSection}
            onSectionChange={setActiveSection}
        >
            <div className="space-y-8 animate-fade-in">
                {activeSection === 'dashboard' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue-500' },
                                { label: 'Active Subscriptions', value: users.filter(u => u.subscription_status === 'active').length, icon: '💎', color: 'bg-[#6359E9]' },
                                { label: 'Total Revenue', value: `${stats.total_revenue}€`, icon: '💰', color: 'bg-green-500' },
                                { label: 'New Users (Month)', value: `+${stats.monthly_growth_users}`, icon: '📈', color: 'bg-pink-500' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 ${stat.color}/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                                            {stat.icon}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Updates</span>
                                    </div>
                                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-1">{stat.label}</h3>
                                    <div className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold">
                        Error: {error}
                    </div>
                )}

                {activeSection === 'users' && (
                    /* Users Table Card */
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-white/10 shadow-xl shadow-indigo-500/5 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight uppercase">User Management</h2>
                                <p className="text-gray-400 text-[13px] font-medium">Manage restaurant partners and subscription levels.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {users.length} Total Partners
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest border-b border-gray-50 dark:border-white/5">
                                        <th className="px-8 py-5">User & Restaurant</th>
                                        <th className="px-8 py-5">Access Level</th>
                                        <th className="px-8 py-5">Plan</th>
                                        <th className="px-8 py-5">Owed Balance</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5">Joined Date</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[13px]">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 uppercase">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800 dark:text-white">{u.name}</div>
                                                        <div className="text-[11px] text-gray-400 font-medium">@{u.restaurant_name || 'no-restaurant'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {u.role === 'admin' ? (
                                                    <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-white/10">
                                                        Partner
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${u.subscription_plan === 'Enterprise' ? 'bg-orange-500' : u.subscription_plan === 'Pro' ? 'bg-indigo-500' : 'bg-gray-400'}`}></span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{u.subscription_plan || 'Starter'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-gray-700 dark:text-gray-300 font-black">
                                                {u.role === 'restaurant' ? (
                                                    <span className={parseFloat(u.owed_commission_balance) > 0 ? "text-orange-500" : "text-gray-400"}>
                                                        {parseFloat(u.owed_commission_balance || 0).toFixed(2)}€
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${u.subscription_status === 'active'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500'
                                                    : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'
                                                    }`}>
                                                    {u.subscription_status || 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-gray-400 font-medium">
                                                {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 text-gray-400 hover:text-[#6359E9] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && !isLoadingData && (
                                        <tr>
                                            <td colSpan="6" className="p-16 text-center">
                                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 opacity-50">
                                                    🔍
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-bold">No users matching your criteria.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSection === 'analytics' && (
                    <div className="h-[600px] bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-white/10 flex flex-col items-center justify-center text-center p-8 transition-colors">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl shadow-indigo-500/5">
                            📊
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight uppercase mb-2">Platform Analytics</h2>
                        <p className="text-gray-400 max-w-sm">Deep insights into user engagement, revenue growth, and platform health. Coming soon.</p>
                    </div>
                )}

                {activeSection === 'settings' && (
                    <div className="space-y-8 max-w-4xl">
                        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-white/10 p-10 overflow-hidden relative group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight uppercase mb-2">Platform Commission Setup</h2>
                                        <p className="text-gray-400 max-w-2xl font-medium text-sm">Configure your platform's global revenue sharing and connection settings.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            setIsSaving(true)
                                            try {
                                                const token = localStorage.getItem('token')
                                                const headers = {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                                // Save all settings
                                                await Promise.all(Object.entries(platformSettings).map(([key, value]) =>
                                                    fetch('/.netlify/functions/update-admin-settings', {
                                                        method: 'POST',
                                                        headers,
                                                        body: JSON.stringify({ key, value })
                                                    })
                                                ))
                                                setSaveSuccess(true)
                                                // Refetch to sync "Stored" status and mask keys
                                                await fetchData()
                                                setTimeout(() => setSaveSuccess(false), 3000)
                                            } catch (err) {
                                                setError('Failed to save settings')
                                            } finally {
                                                setIsSaving(false)
                                            }
                                        }}
                                        disabled={isSaving}
                                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${saveSuccess ? 'bg-green-500 text-white' : 'bg-[#6359E9] text-white hover:scale-105 active:scale-95 shadow-xl shadow-[#6359E9]/20'
                                            }`}
                                    >
                                        {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved' : 'Save Changes'}
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                                            <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Commission Settings</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Commission Rate (%)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={(platformSettings.stripe_config.commission_rate * 100).toFixed(1)}
                                                            onChange={(e) => setPlatformSettings({
                                                                ...platformSettings,
                                                                stripe_config: { ...platformSettings.stripe_config, commission_rate: parseFloat(e.target.value) / 100 }
                                                            })}
                                                            className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6359E9]/50"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Currency</label>
                                                    <select
                                                        value={platformSettings.stripe_config.currency}
                                                        onChange={(e) => setPlatformSettings({
                                                            ...platformSettings,
                                                            stripe_config: { ...platformSettings.stripe_config, currency: e.target.value }
                                                        })}
                                                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6359E9]/50"
                                                    >
                                                        <option value="eur">EUR (€)</option>
                                                        <option value="usd">USD ($)</option>
                                                        <option value="gbp">GBP (£)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-[#6359E9]/10 rounded-3xl border border-[#6359E9]/20">
                                            <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Platform Branding</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Name</label>
                                                    <input
                                                        type="text"
                                                        value={platformSettings.general_config.platform_name}
                                                        onChange={(e) => setPlatformSettings({
                                                            ...platformSettings,
                                                            general_config: { ...platformSettings.general_config, platform_name: e.target.value }
                                                        })}
                                                        className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6359E9]/50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-3xl mb-4">🏦</div>
                                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Stripe Connection</div>
                                            <div className="text-xl font-black text-green-500 uppercase tracking-tight">System Connected</div>
                                            <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 w-full">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                    <span>Active Rate</span>
                                                    <span className="text-indigo-500">{(platformSettings.stripe_config.commission_rate * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-indigo-500 h-full" style={{ width: `${platformSettings.stripe_config.commission_rate * 100}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 w-full">
                                                <a
                                                    href="https://dashboard.stripe.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-black/10"
                                                >
                                                    Stripe Dashboard
                                                </a>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-black dark:bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl">🔐</div>
                                                <h3 className="font-black text-white uppercase tracking-tight text-lg">Sensitive API Keys</h3>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Stripe Secret Key (sk_...)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            placeholder={platformSettings.stripe_secret_key.is_set ? "••••••••••••••••" : "Paste your secret key..."}
                                                            value={platformSettings.stripe_secret_key.secret_key}
                                                            onChange={(e) => setPlatformSettings({
                                                                ...platformSettings,
                                                                stripe_secret_key: { ...platformSettings.stripe_secret_key, secret_key: e.target.value }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#6359E9]/50 transition-all"
                                                        />
                                                        {platformSettings.stripe_secret_key.is_set && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black bg-green-500/20 text-green-400 px-2 py-1 rounded-md uppercase tracking-wider">Stored</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Webhook Secret (whsec_...)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            placeholder={platformSettings.stripe_webhook_secret.is_set ? "••••••••••••••••" : "Paste your webhook secret..."}
                                                            value={platformSettings.stripe_webhook_secret.secret_key}
                                                            onChange={(e) => setPlatformSettings({
                                                                ...platformSettings,
                                                                stripe_webhook_secret: { ...platformSettings.stripe_webhook_secret, secret_key: e.target.value }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#6359E9]/50 transition-all"
                                                        />
                                                        {platformSettings.stripe_webhook_secret.is_set && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black bg-green-500/20 text-green-400 px-2 py-1 rounded-md uppercase tracking-wider">Stored</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-6 text-[11px] text-gray-500 font-medium leading-relaxed">
                                                Keys are <b>encrypted at rest</b> using AES-256. Once saved, the full key is never visible in the dashboard for security.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-white/10">
                                <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase mb-4 tracking-tight">Security Note</h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                    Your <b>Stripe Secret Key</b> is managed securely through environment variables. This ensures that sensitive credentials are never stored in plain text in your database or exposed in the frontend.
                                </p>
                            </div>

                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-white/10">
                                <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase mb-4 tracking-tight">Revenue Flow</h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                    When {platformSettings.general_config.platform_name} processes an order, the {platformSettings.stripe_config.currency.toUpperCase()} amount is split:
                                    <span className="text-green-500 block mt-1">98% → Restaurant Connected Bank</span>
                                    <span className="text-indigo-500 block">{(platformSettings.stripe_config.commission_rate * 100).toFixed(1)}% → Platform Primary Balance</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

        </AdminLayout>
    )
}

export default AdminDashboard
