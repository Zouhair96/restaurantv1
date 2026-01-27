import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import LiveOrders from '../../components/dashboard/LiveOrders'
import OrderDetailsModal from '../../components/dashboard/OrderDetailsModal'
import { fetchMenus, deleteMenu } from '../../utils/menus'

const Overview = () => {
    const { user } = useAuth()
    const [savedMenus, setSavedMenus] = useState([])
    const [templates, setTemplates] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [modalHandlers, setModalHandlers] = useState({
        onStatusUpdate: null,
        getStatusColor: null
    })

    useEffect(() => {
        if (user) {
            loadMenus()
        }
    }, [user])

    const loadMenus = async () => {
        try {
            const data = await fetchMenus()
            setSavedMenus(data || [])

            // Also fetch available templates for this plan
            const token = localStorage.getItem('token')
            const plan = user?.subscription_plan?.toLowerCase() || 'starter'
            const templatesRes = await fetch(`/.netlify/functions/templates?plan=${plan}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (templatesRes.ok) {
                const templatesData = await templatesRes.json();
                setTemplates(Array.isArray(templatesData) ? templatesData : []);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        }
    }

    const handleDeleteMenu = async (id, e) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this menu?')) {
            try {
                await deleteMenu(id)
                await loadMenus()
            } catch (error) {
                console.error('Error deleting menu:', error)
            }
        }
    }

    const handleClearOrders = async () => {
        if (!window.confirm('WARNING: This will permanently delete ALL orders and reset your sales history to zero. This cannot be undone. Are you sure you want to empty your history?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/clear-orders', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('All orders have been cleared. Starting with a fresh history! 🚀');
                window.dispatchEvent(new CustomEvent('dashboardRefresh'));
            } else {
                throw new Error('Failed to clear orders');
            }
        } catch (error) {
            console.error('Error clearing orders:', error);
            alert('Failed to clear orders. Please try again.');
        }
    }

    const hasMenu = savedMenus.length > 0

    return (
        <div className="space-y-8">
            {/* Health Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 bg-[#6c5ce7] bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] rounded-[2rem] p-8 border border-white/20 relative overflow-hidden group shadow-xl shadow-purple-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Restaurant Health</h2>
                            <p className="text-purple-100 text-sm max-w-md">Your overall rating based on sales performance, customer reviews, and preparation time efficiency.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className="block text-5xl font-black text-white">4.8</span>
                                <span className="text-xs font-bold text-purple-200 uppercase tracking-widest">Excellent</span>
                            </div>
                            <div className="h-20 w-20 relative">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="96, 100" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                        <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-bold text-lg">Emergency Mode</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Activate for Rush Hour 2x</p>
                </div>

                <div
                    onClick={handleClearOrders}
                    className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700 group border-dashed"
                >
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full mb-3 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                        <svg className="w-8 h-8 text-orange-500 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-bold text-lg">Empty Cash</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Reset All Order History</p>
                </div>
            </div>

            {/* Active Menu Widget */}
            {hasMenu && savedMenus.length > 0 && (
                <div className="animate-fade-in">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700 shadow-xl">
                        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                {/* Left: Menu Info */}
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-20 h-20 rounded-xl bg-yum-primary/10 flex items-center justify-center border border-yum-primary/20 shrink-0">
                                        <span className="text-4xl">
                                            {savedMenus[0].template_type === 'tacos' ? '🌮' :
                                                savedMenus[0].template_type === 'pizza' ? '🍕' : '🍽️'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">{savedMenus[0].name}</h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 capitalize font-medium">
                                                {savedMenus[0].template_type} Template
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center: QR Code */}
                                <div className="hidden lg:flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <QRCodeSVG value={`${window.location.origin}/${user.restaurant_name}`} size={80} />
                                    <span className="text-[10px] text-gray-400 mt-1 font-bold tracking-wider uppercase">Scan Me</span>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Link
                                        to="/dashboard/menu"
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold transition-all border border-gray-200 dark:border-gray-700 group shadow-sm dark:shadow-none"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">✏️</span> Edit
                                    </Link>

                                    <a
                                        href={`${window.location.origin}/${user.restaurant_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">👁️</span> Show
                                    </a>

                                    <button
                                        onClick={(e) => savedMenus[0] && handleDeleteMenu(savedMenus[0].id, e)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-500 rounded-xl font-bold transition-all border border-red-200 dark:border-red-900/30 group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">🗑️</span> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Menu Templates Section Removed to avoid duplication with Menu Management page */}

            {/* Live Orders Section */}
            <LiveOrders onSelectOrder={(order, handler, getter) => {
                setSelectedOrder(order)
                setModalHandlers({ onStatusUpdate: handler, getStatusColor: getter })
            }} />

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={(id, status, driver) => {
                    if (modalHandlers.onStatusUpdate) {
                        modalHandlers.onStatusUpdate(id, status, driver).then(updatedOrder => {
                            if (updatedOrder) {
                                setSelectedOrder(updatedOrder)
                            }
                        })
                    }
                }}
                getStatusColor={modalHandlers.getStatusColor}
            />
        </div>
    )
}

export default Overview
