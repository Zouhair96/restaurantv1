import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PersistentOrderTracker = ({ order, onClose, themeColor = '#6c5ce7', inline = false, noHeader = false }) => {
    const [isMinimized, setIsMinimized] = useState(false)
    const prevStatusRef = React.useRef(order?.status);

    // Watch for status changes to trigger notifications
    useEffect(() => {
        if (!order) return;

        const prevStatus = prevStatusRef.current;
        if (prevStatus && prevStatus !== order.status) {
            // Play sound and show notification when order is ready/completed
            if (order.status === 'completed' || order.status === 'ready') {
                if (prevStatus !== 'completed' && prevStatus !== 'ready') {
                    const message = order.status === 'ready' ? 'Your order is ready! 🎉' : 'Your order is completed! Enjoy! 🍽️';
                    playCompletionSound();
                    speakMessage(order.status === 'ready' ? 'Your order is ready' : 'Your order is completed');
                    showNotification(message);
                }
            }
        }
        prevStatusRef.current = order.status;
    }, [order?.status]);

    const speakMessage = (text) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    const playCompletionSound = () => {
        try {
            // Professional success notification sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
            audio.volume = 0.7
            audio.play().catch(e => console.warn('Audio play failed:', e))

            // Trigger vibration pattern: long, short, long
            if ('vibrate' in navigator) {
                navigator.vibrate([500, 100, 500]);
            }
        } catch (err) {
            console.error('Audio/Vibration error:', err)
        }
    }

    const showNotification = (message) => {
        if (!order?.id) return;

        // Request permission if not granted
        if ('Notification' in window) {
            const options = {
                body: message,
                icon: '/logo.png',
                badge: '/logo.png',
                tag: `order-${order.id}`,
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: {
                    orderId: order.id,
                    url: `/order/${order.id}`
                }
            };

            if (Notification.permission === 'granted') {
                new Notification('🎉 Order Update!', options);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('🎉 Order Update!', options);
                    }
                });
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

    if (!order) return null

    const statusInfo = getStatusInfo(order.status)

    return (
        <AnimatePresence>
            <motion.div
                drag
                dragMomentum={false}
                dragConstraints={{ left: -300, right: 300, top: 0, bottom: 600 }} // Approximate viewport bounds
                initial={inline ? { opacity: 0 } : { x: 100, opacity: 0 }}
                animate={inline ? { opacity: 1 } : { x: 0, opacity: 1 }}
                exit={inline ? { opacity: 0 } : { x: 100, opacity: 0 }}
                className={inline ? 'relative' : 'fixed top-20 right-4 z-[120] w-80 pointer-events-none'}
            >
                <div className={`${inline ? '' : 'pointer-events-auto cursor-default'}`}>
                    {isMinimized ? (
                        // Minimized pill - Draggable
                        <motion.button
                            onClick={() => setIsMinimized(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-2xl border-2 border-gray-100 dark:border-gray-700 flex items-center gap-3 ml-auto cursor-grab active:cursor-grabbing"
                        >
                            <div className={`w-3 h-3 rounded-full ${statusInfo.color} animate-pulse`} />
                            <span className="font-bold text-sm text-gray-800 dark:text-white">
                                {statusInfo.emoji} {statusInfo.label}
                            </span>
                        </motion.button>
                    ) : (
                        // Full tracker card - Draggable
                        <div
                            className={`bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700`}
                            style={{ borderTop: `6px solid ${themeColor}` }}
                        >
                            {/* Drag Handle Top Overlay */}
                            <div className="flex justify-center pt-2 cursor-grab active:cursor-grabbing group">
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors" />
                            </div>

                            <div className="px-5 pb-5 pt-3">
                                {/* Header */}
                                {!noHeader && (
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl ${statusInfo.color} flex items-center justify-center text-white text-xl shadow-lg shadow-current/20`}>
                                                {statusInfo.emoji}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 dark:text-white text-base leading-none mb-1">
                                                    Order #{String(order.id).slice(0, 8)}
                                                </h3>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                                                    {statusInfo.label}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setIsMinimized(true)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400"
                                                title="Minimize"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-red-500"
                                                title="Close"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${statusInfo.progress}%` }}
                                            transition={{ duration: 1, ease: 'circOut' }}
                                            className="h-full rounded-full shadow-lg"
                                            style={{
                                                backgroundColor: themeColor,
                                                boxShadow: `0 0 12px ${themeColor}44`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-gray-400">
                                        <span className={order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' || order.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>Recu</span>
                                        <span className={order.status === 'preparing' || order.status === 'ready' || order.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>Prepa</span>
                                        <span className={order.status === 'ready' || order.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>Pret</span>
                                        <span className={order.status === 'completed' ? 'text-gray-900 dark:text-white' : ''}>Ok</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />

                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Total Order</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">${order.total_price}</p>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {/* Simple visualization of items if needed, or just status emoji */}
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-lg shadow-sm">
                                            🍕
                                        </div>
                                    </div>
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
