import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PersistentOrderTracker = ({ orderId, onClose }) => {
    const [orderStatus, setOrderStatus] = useState(null)
    const [isMinimized, setIsMinimized] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) return

        const fetchOrderStatus = async () => {
            try {
                const response = await fetch(`/.netlify/functions/get-public-order?orderId=${orderId}`)
                const data = await response.json()

                if (response.ok) {
                    const prevStatus = orderStatus?.status
                    setOrderStatus(data)

                    // Play sound and show notification when order is ready/completed
                    if (prevStatus && prevStatus !== 'completed' && data.status === 'completed') {
                        playCompletionSound()
                        showNotification('Your order is ready! 🎉')
                    }
                }
            } catch (error) {
                console.error('Failed to fetch order status:', error)
            } finally {
                setLoading(false)
            }
        }

        // Initial fetch
        fetchOrderStatus()

        // Poll every 10 seconds
        const interval = setInterval(fetchOrderStatus, 10000)
        return () => clearInterval(interval)
    }, [orderId, orderStatus?.status])

    const playCompletionSound = () => {
        try {
            // Professional success notification sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
            audio.volume = 0.7 // Slightly lower volume for pleasantness
            audio.play().catch(e => console.warn('Audio play failed:', e))
        } catch (err) {
            console.error('Audio error:', err)
        }
    }

    const showNotification = (message) => {
        // Request permission if not granted
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('🎉 YumYum Order Ready!', {
                    body: message,
                    icon: '/logo.png',
                    badge: '/logo.png',
                    tag: `order-${orderId}`,
                    requireInteraction: true, // Notification stays until user interacts
                    vibrate: [200, 100, 200, 100, 200],
                    actions: [
                        { action: 'view', title: '👀 View Order', icon: '/logo.png' },
                        { action: 'close', title: 'Dismiss' }
                    ],
                    data: {
                        orderId: orderId,
                        url: `/order/${orderId}`
                    }
                })
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('🎉 YumYum Order Ready!', {
                            body: message,
                            icon: '/logo.png',
                            badge: '/logo.png',
                            tag: `order-${orderId}`,
                            requireInteraction: true,
                            vibrate: [200, 100, 200, 100, 200]
                        })
                    }
                })
            }
        }
    }

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { label: 'Order Received', color: 'bg-yellow-500', progress: 25, emoji: '📝' },
            preparing: { label: 'Being Prepared', color: 'bg-blue-500', progress: 50, emoji: '👨‍🍳' },
            ready: { label: 'Ready for Pickup', color: 'bg-green-500', progress: 75, emoji: '✅' },
            completed: { label: 'Completed', color: 'bg-gray-500', progress: 100, emoji: '🎉' }
        }
        return statusMap[status] || statusMap.pending
    }

    if (!orderId || !orderStatus) return null

    const statusInfo = getStatusInfo(orderStatus.status)

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
            >
                <div className="pointer-events-auto">
                    {isMinimized ? (
                        // Minimized pill
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 left-1/2 transform -translate-x-1/2"
                        >
                            <button
                                onClick={() => setIsMinimized(false)}
                                className="bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-2xl border-2 border-gray-200 dark:border-gray-700 flex items-center gap-3 hover:scale-105 transition-transform"
                            >
                                <div className={`w-3 h-3 rounded-full ${statusInfo.color} animate-pulse`} />
                                <span className="font-bold text-sm text-gray-800 dark:text-white">
                                    {statusInfo.emoji} {statusInfo.label}
                                </span>
                            </button>
                        </motion.div>
                    ) : (
                        // Full tracker
                        <div className="bg-white dark:bg-gray-800 shadow-2xl border-b-4 border-yum-primary">
                            <div className="max-w-4xl mx-auto px-4 py-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${statusInfo.color} flex items-center justify-center text-white text-xl`}>
                                            {statusInfo.emoji}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white text-lg">
                                                Order #{String(orderId).slice(0, 8)}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                                                {statusInfo.label}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsMinimized(true)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            title="Minimize"
                                        >
                                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            title="Close"
                                        >
                                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${statusInfo.progress}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className={`h-full ${statusInfo.color}`}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                        <span className={orderStatus.status === 'pending' || orderStatus.status === 'preparing' || orderStatus.status === 'ready' || orderStatus.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>
                                            Received
                                        </span>
                                        <span className={orderStatus.status === 'preparing' || orderStatus.status === 'ready' || orderStatus.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>
                                            Preparing
                                        </span>
                                        <span className={orderStatus.status === 'ready' || orderStatus.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>
                                            Ready
                                        </span>
                                        <span className={orderStatus.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>
                                            Done
                                        </span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                                    <span className="text-xl font-black text-yum-primary">${orderStatus.total_price}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default PersistentOrderTracker
