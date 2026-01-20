import React, { useState, useEffect } from 'react'

const Activity = () => {
    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => {
        fetchRecentActivity()
    }, [])

    const fetchRecentActivity = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch('/.netlify/functions/get-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const result = await response.json()
            if (response.ok) {
                setRecentActivity(result.orders || [])
            }
        } catch (err) {
            console.error('Error fetching activity:', err)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Stay updated with everything happening in your restaurant.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white">Real-Time Feed</h3>
                    <button
                        onClick={fetchRecentActivity}
                        className="text-xs font-bold text-yum-primary hover:underline uppercase tracking-widest"
                    >
                        Refresh Feed
                    </button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, idx) => (
                            <div key={idx} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6 text-yum-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    New {activity.order_type} Order Received
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Order <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">#{activity.id.slice(0, 8)}</span> for {activity.total_amount}€
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(activity.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                                                {activity.status}
                                            </span>
                                            {activity.payment_method && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                                    {activity.payment_method}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center">
                            <p className="text-gray-400 italic">No activity recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Activity
