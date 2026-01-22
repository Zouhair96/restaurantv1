import React, { useState, useEffect } from 'react'

const BillingSettings = () => {
    const [owedBalance, setOwedBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [clientSecret, setClientSecret] = useState(null)

    useEffect(() => {
        fetchBillingInfo()
    }, [])

    const fetchBillingInfo = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/get-admin-settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                setOwedBalance(data.user?.owed_commission_balance || 0)
            }
        } catch (err) {
            console.error('Failed to fetch billing info', err)
            setError('Could not load billing data.')
        } finally {
            setLoading(false)
        }
    }

    const handleSetupCard = async () => {
        setSaving(true)
        setError(null)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/stripe-setup-intent', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()

            if (response.ok && data.clientSecret) {
                // In a real app, you would now use Stripe Elements here.
                // For this demo, we'll explain the next step.
                alert('Success! Stripe SetupIntent created. In production, this would open the Secure Card Entry form.');
                console.log('Client Secret:', data.clientSecret);
            } else {
                throw new Error(data.error || 'Failed to initialize card setup')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-10 animate-pulse text-gray-400">Loading billing details...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Billing & Commission</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your payment methods and view your platform commission balance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Balance Card */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yum-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Current Owed Balance</h2>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-yum-primary">${parseFloat(owedBalance).toFixed(2)}</span>
                        <span className="text-gray-400 font-bold">Total</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-6 leading-relaxed">
                        This reflects the 2% commission from all orders accepted in the last cycle.
                        Balances are automatically settled every Monday.
                    </p>
                </div>

                {/* Card Management */}
                <div className="bg-[#6c5ce7]/5 dark:bg-[#6c5ce7]/10 p-8 rounded-[2.5rem] border-2 border-dashed border-[#6c5ce7]/30 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#6c5ce7] text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-4">
                        Add a credit or debit card to keep your restaurant online and automate your weekly commission payments.
                    </p>
                    <button
                        onClick={handleSetupCard}
                        disabled={saving}
                        className="px-8 py-3 bg-[#6c5ce7] text-white rounded-xl font-bold hover:bg-[#5b4cc4] transition-all shadow-lg shadow-[#6c5ce7]/30 disabled:opacity-50"
                    >
                        {saving ? 'Connecting to Stripe...' : 'Register New Card'}
                    </button>
                    {error && <p className="text-red-500 text-xs mt-4 font-bold">⚠️ {error}</p>}
                </div>
            </div>

            {/* Policy Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yum-primary rounded-full"></span>
                    The 2-Free-Cancellation Guarantee
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    We understand that mistakes happen. You are allowed **2 free cancellations per day** without any commission charges.
                    From the 3rd cancellation onwards, the 2% platform fee will still apply to protect our marketing efforts.
                    The limit resets every 24 hours.
                </p>
            </div>
        </div>
    )
}

export default BillingSettings
