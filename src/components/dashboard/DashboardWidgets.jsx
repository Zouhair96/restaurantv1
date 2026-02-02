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
        }

        window.addEventListener('dashboardRefresh', handleRefresh)

        fetchSalesStats()
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
        const stat = (salesData.weeklyStats || []).find(s => s.date.split('T')[0] === dateStr)
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
        </div>
    )
}

export default DashboardWidgets
