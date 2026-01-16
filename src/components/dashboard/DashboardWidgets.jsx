import React, { useState, useEffect } from 'react'

const DashboardWidgets = () => {
    const [salesData, setSalesData] = useState({
        todaySales: 0,
        yesterdaySales: 0,
        growth: 0,
        weeklyStats: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [healthData, setHealthData] = useState(null)
    const [loadingHealth, setLoadingHealth] = useState(true)

    const fetchHealthStats = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch('/.netlify/functions/get-restaurant-health', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setHealthData(data)
            }
        } catch (err) {
            console.error('Error fetching health stats:', err)
        } finally {
            setLoadingHealth(false)
        }
    }

    const fetchSalesStats = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch('/.netlify/functions/get-sales-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch sales stats')
            }

            const data = await response.json()
            setSalesData(data)
        } catch (err) {
            console.error('Error fetching sales stats:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleRefresh = () => {
            fetchSalesStats()
            fetchHealthStats()
        }

        window.addEventListener('dashboardRefresh', handleRefresh)

        fetchSalesStats()
        fetchHealthStats()
        // Refresh every 5 minutes
        const interval = setInterval(handleRefresh, 300000)

        return () => {
            clearInterval(interval)
            window.removeEventListener('dashboardRefresh', handleRefresh)
        }
    }, [])

    // Prepare graph data (last 7 days)
    const graphData = Array(7).fill(0).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toISOString().split('T')[0]
        const stat = salesData.weeklyStats.find(s => s.date.split('T')[0] === dateStr)
        return stat ? parseFloat(stat.daily_total) : 0
    })

    const maxSales = Math.max(...graphData, 10)

    return (
        <div className="space-y-8">
            {/* Sales Mini Graph */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Performance</h3>
                <div className="bg-white dark:bg-gray-800/40 dark:backdrop-blur-md p-6 rounded-[2rem] shadow-sm dark:shadow-none border border-transparent dark:border-white/5 relative overflow-hidden transition-all duration-300">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : error ? (
                        <div className="h-40 flex items-center justify-center text-red-500 text-xs text-center">
                            ⚠️ Error loading sales data
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Today's Sales</p>
                                    <p className="text-3xl font-black text-gray-800 dark:text-gray-100">${salesData.todaySales.toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${salesData.growth >= 0
                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 dark:border-green-500/20'
                                    : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 dark:border-red-500/20'}`}>
                                    {salesData.growth >= 0 ? '+' : ''}{salesData.growth}%
                                </span>
                            </div>
                            <div className="flex items-end space-x-3 h-20 pt-2">
                                {graphData.map((val, i) => (
                                    <div key={i} className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-t-xl overflow-hidden relative group">
                                        <div
                                            className="absolute bottom-0 left-0 w-full bg-indigo-400 dark:bg-indigo-500 transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400"
                                            style={{ height: `${(val / maxSales) * 100}%` }}
                                        ></div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10">
                                            ${val.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Today</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* AI Alerts */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    AI Insights
                </h3>
                <div className="bg-orange-50 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800/40 dark:to-gray-900/40 p-5 rounded-[2rem] space-y-3 border border-orange-100 dark:border-white/5 transition-colors duration-300">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-white dark:bg-gray-700/30 rounded-2xl text-orange-500 dark:text-orange-400 shadow-sm shrink-0 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-800 dark:text-gray-200 font-bold mb-1">Stock Alert</p>
                            <p className="text-xs text-gray-600 dark:text-gray-500 leading-relaxed">Tomatoes running low. Projected run-out: 8:30 PM based on current order velocity.</p>
                            <button className="mt-3 px-4 py-2 bg-white dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 text-xs font-bold rounded-xl hover:shadow-md transition-all dark:border dark:border-orange-500/20">Auto-Reorder &rarr;</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Restaurant Health Widget */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors mb-4">Restaurant Health</h3>
                <div className="bg-white dark:bg-gray-800/40 dark:backdrop-blur-md p-6 rounded-[2rem] shadow-sm dark:shadow-none border border-transparent dark:border-white/5 transition-all duration-300">
                    {loadingHealth ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : healthData ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Overall Status</p>
                                    <h4 className={`text-2xl font-black ${healthData.overallScore > 80 ? 'text-green-500' : healthData.overallScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {healthData.status}
                                    </h4>
                                </div>
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="transparent"
                                            className="text-gray-100 dark:text-gray-700/50"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 28}
                                            strokeDashoffset={2 * Math.PI * 28 * (1 - healthData.overallScore / 100)}
                                            className={`${healthData.overallScore > 80 ? 'text-green-500' : healthData.overallScore > 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-sm font-black text-gray-800 dark:text-gray-100">{healthData.overallScore}%</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {healthData.metrics.map((metric, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 dark:text-gray-400 font-bold">{metric.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-800 dark:text-gray-200 font-black">{metric.value}%</span>
                                                {metric.trend === 'up' && <span className="text-green-500">↑</span>}
                                                {metric.trend === 'down' && <span className="text-red-500">↓</span>}
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${metric.value > 80 ? 'bg-green-500' : metric.value > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${metric.value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-xs text-gray-400">
                            No health data available
                        </div>
                    )}
                </div>
            </div>

            {/* Assistance Chatbot */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Assistant</h3>
                <div className="bg-white dark:bg-gray-800/40 dark:backdrop-blur-md p-5 rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 transition-all duration-300">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-2xl rounded-tl-none transition-colors">
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"Prepare for rain tonight at 7 PM. Delivery orders may spike by 15%."</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservations */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Reservations</h3>
                <div className="bg-white dark:bg-gray-800/40 dark:backdrop-blur-md rounded-[2rem] divide-y divide-gray-100 dark:divide-gray-700/50 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300">
                    {[
                        { time: '19:00', name: 'Mr. Tanaka', size: '4p', status: 'Confirmed' },
                        { time: '19:30', name: 'Sarah J.', size: '2p', status: 'Pending' },
                        { time: '20:00', name: 'VIP Group', size: '8p', status: 'Confirmed' },
                    ].map((res, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="text-xs font-bold bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 text-gray-500 px-2 py-1 rounded-lg group-hover:bg-white dark:group-hover:bg-white/10 group-hover:shadow-sm transition-all">{res.time}</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{res.name}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">4p • Table 4</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${res.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>
                                    {res.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DashboardWidgets
