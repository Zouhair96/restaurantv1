import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'

const AdminDashboard = () => {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState(null)

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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yum-primary"></div>
            </div>
        )
    }

    if (user?.role !== 'admin') {
        return null // Will redirect
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#0f1115] text-white p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-2">
                                <span className="text-yum-primary">🛡️</span> Admin Dashboard
                            </h1>
                            <p className="text-gray-400 mt-1">Platform overview and user management.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/profile" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-gray-300 transition-colors">
                                User View
                            </Link>
                            <div className="px-4 py-2 bg-purple-900/30 text-purple-400 rounded-lg font-mono text-sm border border-purple-900/50">
                                Total Users: {users.length}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
                            Error: {error}
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold">User</th>
                                        <th className="p-4 font-bold">Restaurant</th>
                                        <th className="p-4 font-bold">Role</th>
                                        <th className="p-4 font-bold">Plan</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{u.name}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-white bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                                    {u.restaurant_name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {u.role === 'admin' ? (
                                                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs font-bold uppercase">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold uppercase">
                                                        Partner
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize text-gray-300">{u.subscription_plan || 'Free'}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.subscription_status === 'active'
                                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                        : 'bg-gray-700 text-gray-400'
                                                    }`}>
                                                    {u.subscription_status || 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && !isLoadingData && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default AdminDashboard
