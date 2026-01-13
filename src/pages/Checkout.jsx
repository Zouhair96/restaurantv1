import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Checkout = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const plan = location.state?.plan || 'Pro'

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    // Form State
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Mock API call
        setTimeout(() => {
            setIsLoading(false)
            // Redirect to Profile with Onboarding Trigger
            navigate('/profile?onboarding=true')
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Trust Header */}
            <div className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-yum-dark">YumYum</span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest border-l border-gray-300 pl-3">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>256-bit SSL Encrypted</span>
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Column: Summary & Psychology */}
                <div className="space-y-8">
                    {/* Urgency Banner */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3 text-orange-800">
                        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-bold">
                            High demand! Rate locked for <span className="font-mono text-lg">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                        </p>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to {plan}</h1>
                        <p className="text-gray-500">Unlocking the full power of YumYum Dashboard.</p>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="flex justify-between items-center text-gray-800 font-medium pb-4 border-b border-gray-100">
                            <span>{plan} Plan (Monthly)</span>
                            <span>$79.00</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600 font-bold">
                            <span>14-Day Free Trial</span>
                            <span>-$79.00</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 text-xl font-bold text-gray-900 border-t border-gray-100">
                            <span>Today's Total</span>
                            <span>$0.00</span>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            First charge of $79.00 on {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center gap-4 bg-white/50 p-4 rounded-xl">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600">
                            <strong>142 restaurants</strong> joined the Pro League this week.
                        </p>
                    </div>
                </div>

                {/* Right Column: Minimalist Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                            <input type="text" defaultValue={user?.name} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary transition-all bg-gray-50" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
                            <div className="relative">
                                <input type="text" placeholder="0000 0000 0000 0000" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary transition-all pl-12" />
                                <svg className="w-6 h-6 text-gray-400 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                                <input type="text" placeholder="MM/YY" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                <input type="text" placeholder="123" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary transition-all" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-yum-primary hover:bg-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                `Start Free Trial`
                            )}
                        </button>

                        <p className="text-xs text-gray-400 text-center">
                            No commitment. Cancel anytime before the trial ends.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Checkout
