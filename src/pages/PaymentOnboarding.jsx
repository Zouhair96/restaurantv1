import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PaymentOnboarding = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [step, setStep] = useState(1)

    useEffect(() => {
        // If user already has payment method, redirect to dashboard
        if (user?.stripe_payment_method_id) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    const handleSetupPayment = async () => {
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/stripe-setup-intent', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (response.ok && data.clientSecret) {
                // In production, you would load Stripe.js and use Elements here
                // For now, we'll simulate the flow
                setStep(2)

                // Simulate successful card entry (in production, this would be Stripe Elements)
                setTimeout(() => {
                    setStep(3)
                    setTimeout(() => {
                        navigate('/dashboard')
                    }, 2000)
                }, 2000)
            } else {
                throw new Error(data.error || 'Failed to initialize payment setup')
            }
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleSkip = () => {
        // For demo purposes, allow skip but show warning
        if (window.confirm('⚠️ Without a payment method, your menu will be disabled after the first order. Are you sure you want to skip?')) {
            navigate('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#6c5ce7] to-[#8e44ad] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl p-8 md:p-12">
                {/* Progress Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === step ? 'bg-[#6c5ce7] w-8' :
                                i < step ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-[#6c5ce7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[#6c5ce7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 mb-3">Welcome to Margio! 🎉</h1>
                            <p className="text-gray-600 text-lg mb-2">One last step before you start selling...</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mb-8 border-2 border-[#6c5ce7]/20">
                            <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-2xl">💳</span>
                                Add Your Payment Method
                            </h3>
                            <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                We operate on a <strong>2% commission model</strong>. You only pay when you make sales!
                                Your card will be charged automatically every Monday for the previous week's orders.
                            </p>
                            <div className="bg-white/80 p-4 rounded-xl">
                                <p className="text-xs text-gray-600 font-bold mb-2">✅ Why we need this:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• <strong>No upfront costs</strong> - Pay only for what you sell</li>
                                    <li>• <strong>Automatic billing</strong> - No invoices, no hassle</li>
                                    <li>• <strong>Secure & encrypted</strong> - Powered by Stripe</li>
                                </ul>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleSetupPayment}
                                disabled={loading}
                                className="flex-1 bg-[#6c5ce7] text-white font-black py-4 rounded-2xl hover:bg-[#5b4cc4] transition-all shadow-lg shadow-[#6c5ce7]/30 disabled:opacity-50 text-lg"
                            >
                                {loading ? 'Connecting to Stripe...' : 'Add Payment Method →'}
                            </button>
                            <button
                                onClick={handleSkip}
                                className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm"
                            >
                                Skip for now
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 text-center mt-6">
                            🔒 Your payment information is secured by Stripe. We never see or store your card details.
                        </p>
                    </>
                )}

                {step === 2 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-[#6c5ce7] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Securing Your Card...</h2>
                        <p className="text-gray-500">Please wait while we set up your payment method</p>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">All Set! 🚀</h2>
                        <p className="text-gray-600 text-lg">Redirecting you to your dashboard...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PaymentOnboarding
