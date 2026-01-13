import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'

const Checkout = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    // Default plan fallback if navigated directly
    const defaultPlan = {
        name: 'Pro',
        price: '$79',
        features: ['Advanced Analytics', 'AI Menu Suggestions', 'Unlimited Staff', 'Priority Support']
    }

    const plan = location.state?.plan || defaultPlan

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
        <MainLayout>
            <div className="bg-gray-50 flex-grow py-12">
                <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Column: Summary & Benefits */}
                    <div className="space-y-8">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to {plan.name}</h1>
                            <p className="text-gray-500">Unlocking the full power of YumYum Dashboard.</p>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div className="flex justify-between items-center text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">
                                <span>{plan.name} Plan (Monthly)</span>
                                <span>{plan.price}</span>
                            </div>

                            <div className="space-y-2">
                                <p className="font-bold text-gray-700">What's Included:</p>
                                <ul className="space-y-2">
                                    {plan.features && plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-gray-600 text-sm">
                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex justify-between items-center pt-4 text-xl font-bold text-gray-900 border-t border-gray-100 mt-4">
                                <span>Total Due Today</span>
                                <span>{plan.price}</span>
                            </div>
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
                    <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secure Checkout
                            </div>
                        </div>

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
                                    `Pay ${plan.price}`
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Checkout
