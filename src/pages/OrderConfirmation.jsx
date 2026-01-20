import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineBan, HiOutlineCheck } from 'react-icons/hi'

const OrderConfirmation = () => {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/.netlify/functions/get-public-order?orderId=${orderId}`)
            if (response.ok) {
                const data = await response.json()
                setOrder(data.order)
            } else {
                setError('Order not found')
            }
        } catch (err) {
            setError('Failed to load order')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrder()
        const interval = setInterval(fetchOrder, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [orderId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yum-primary"></div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || "We check everywhere, but couldn't find this order."}</p>
                    <Link to="/" className="px-6 py-3 bg-yum-primary text-white rounded-xl font-bold">Go Home</Link>
                </div>
            </div>
        )
    }

    // Status Logic
    const steps = [
        { status: 'pending', label: 'Order Sent', icon: <HiOutlineClock /> },
        { status: 'engaging', label: 'Preparing', icon: <span className="animate-pulse">👨‍🍳</span> },
        { status: 'ready', label: 'Ready', icon: <HiOutlineCheck /> },
        { status: 'done', label: 'Completed', icon: <HiOutlineCheckCircle /> }
    ]

    const getStatusIndex = (s) => {
        const map = { 'pending': 0, 'engaging': 1, 'ready': 2, 'done': 3, 'cancelled': -1 }
        return map[s] ?? 0
    }

    const currentIndex = getStatusIndex(order.status)
    const isCancelled = order.status === 'cancelled'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6">
            <div className="max-w-xl mx-auto">

                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 mb-6 text-center overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yum-primary to-orange-500"></div>

                    {isCancelled ? (
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
                                <HiOutlineBan />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Cancelled</h1>
                            <p className="text-gray-500 dark:text-gray-400">Please contact the restaurant.</p>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 scale-up-center">
                                <HiOutlineCheckCircle />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Received!</h1>
                            <p className="text-gray-500 dark:text-gray-400">Order #{order.id.slice(0, 8)} • {order.restaurant_name}</p>
                        </div>
                    )}

                    {/* Simple Progress Bar */}
                    {!isCancelled && (
                        <div className="relative pt-4 pb-2">
                            <div className="flex justify-between mb-2">
                                {steps.map((step, idx) => (
                                    <div key={idx} className={`flex flex-col items-center z-10 w-1/4 ${idx <= currentIndex ? 'text-yum-primary' : 'text-gray-300 dark:text-gray-600'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 mb-2 transition-all duration-500 ${idx <= currentIndex ? 'bg-white dark:bg-gray-800 border-yum-primary scale-110 shadow-lg' : 'bg-transparent border-gray-200 dark:border-gray-700'
                                            }`}>
                                            {step.icon}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase transition-colors duration-500 ${idx <= currentIndex ? 'text-yum-primary/80' : 'text-gray-300 dark:text-gray-600'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {/* Track Line */}
                            <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0">
                                <div
                                    className="h-full bg-yum-primary transition-all duration-1000 ease-out"
                                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tracking Details */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-lg p-6 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">You Ordered</h3>
                        <div className="space-y-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xl">
                                            🌮
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white">{item.size?.size} Menu</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                {[item.friesType, ...item.chicken].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">${item.price}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 dark:border-white/5 my-6"></div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-800 dark:text-white">Total</span>
                            <span className="font-black text-yum-primary">${order.total_price}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    Keep this window open to track your order.
                </div>

            </div>
        </div>
    )
}

export default OrderConfirmation
