import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            // Stash the event so it can be triggered later
            setDeferredPrompt(e)
            // Show our custom install prompt
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        // Remember dismissal for 7 days
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }

    // Check if user dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed)
            const sevenDays = 7 * 24 * 60 * 60 * 1000
            if (Date.now() - dismissedTime < sevenDays) {
                setShowPrompt(false)
            }
        }
    }, [])

    if (!showPrompt) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
            >
                <div className="max-w-md mx-auto pointer-events-auto">
                    <div className="bg-gradient-to-r from-[#6c5ce7] to-[#8e44ad] rounded-3xl shadow-2xl p-6 border-2 border-white/20">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-3xl">🍽️</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-black text-lg mb-1">
                                    Install YumYum App
                                </h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Get instant order updates and track your food in real-time!
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleInstall}
                                        className="flex-1 bg-white text-[#6c5ce7] font-black py-3 rounded-xl hover:bg-gray-100 transition-all shadow-lg"
                                    >
                                        Install Now
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="px-4 bg-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/30 transition-all"
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-2xl mb-1">⚡</div>
                                    <p className="text-white/80 text-xs font-bold">Fast Access</p>
                                </div>
                                <div>
                                    <div className="text-2xl mb-1">🔔</div>
                                    <p className="text-white/80 text-xs font-bold">Live Updates</p>
                                </div>
                                <div>
                                    <div className="text-2xl mb-1">📱</div>
                                    <p className="text-white/80 text-xs font-bold">App-Like</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default PWAInstallPrompt
