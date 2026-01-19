import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../layouts/AdminLayout'
import IntegrationSettings from '../components/dashboard/IntegrationSettings'
import Simulator from './Simulator'

const AdminDashboard = () => {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState('dashboard')

    useEffect(() => {
        // Redirection for non-admins
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/profile')
            } else {
                fetchUsers()
            }
        }
    }, [user, loading, navigate])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/admin-users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Unauthorized access')
                }
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data)
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
                                { label: 'Total Revenue', value: '4,250€', icon: '💰', color: 'bg-green-500' },
                                { label: 'New this month', value: '+12%', icon: '📈', color: 'bg-pink-500' },
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
                ...
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

                {activeSection === 'integrations' && (
                    <div className="animate-fade-in">
                        <IntegrationSettings />
                    </div>
                )}

                {activeSection === 'simulator' && (
                    <div className="animate-fade-in shadow-2xl rounded-[3rem] overflow-hidden">
                        <Simulator />
                    </div>
                )}
            </div>

        </AdminLayout>
    )
}

export default AdminDashboard
