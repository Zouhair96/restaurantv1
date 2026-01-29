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
    const [loyaltyStats, setLoyaltyStats] = useState({
        loyal_clients: 0,
        offers_applied: 0,
        loyalty_revenue: '0.00'
    })

    useEffect(() => {
        if (user) {
            loadMenus()
            fetchLoyaltyStats()
        }
    }, [user])

    const fetchLoyaltyStats = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/loyalty-analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setLoyaltyStats(data)
            }
        } catch (error) {
            console.error('Error fetching loyalty stats:', error)
        }
    }

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

            {/* Loyalty Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loyal Clients</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">{loyaltyStats.loyal_clients}</span>
                        <span className="text-green-500 font-bold text-xs ring-1 ring-green-100 px-2 py-0.5 rounded-full">Real-time</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Offers Applied</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">{loyaltyStats.offers_applied}</span>
                        <span className="text-blue-500 font-bold text-xs ring-1 ring-blue-100 px-2 py-0.5 rounded-full">Total</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Revenue (Loyalty)</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">${parseFloat(loyaltyStats.loyalty_revenue).toLocaleString()}</span>
                        <span className="text-gray-400 font-medium text-xs">Direct Revenue</span>
                    </div>
                </div>
            </div>



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
        </div >
    )
}

export default Overview
