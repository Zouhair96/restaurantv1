import React from 'react'

const DashboardWidgets = () => {
    return (
        <div className="space-y-8">
            {/* Sales Mini Graph */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Performance</h3>
                <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-xs text-gray-400">Today's Sales</p>
                            <p className="text-2xl font-bold text-white">$1,240</p>
                        </div>
                        <span className="text-green-400 text-sm font-bold">+12%</span>
                    </div>
                    {/* CSS Bar Chart Simulation */}
                    <div className="flex items-end space-x-2 h-16 pt-2">
                        {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-yum-primary/20 rounded-t-sm hover:bg-yum-primary transition-colors" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Alerts */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    AI Insights
                </h3>
                <div className="glass-panel p-4 rounded-2xl space-y-3">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-200">Stock Alert</p>
                            <p className="text-xs text-gray-400">Tomatoes running low. Projected run-out: 8:30 PM.</p>
                            <button className="mt-2 text-xs text-yum-primary hover:text-white font-bold">Auto-Reorder &rarr;</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assistance Chatbot */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Assistant</h3>
                <div className="glass-panel p-4 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-300">"Prepare for rain tonight at 7 PM. Delivery orders may spike."</p>
                    </div>
                </div>
            </div>

            {/* Reservations */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Reservations</h3>
                <div className="glass-panel rounded-2xl divide-y divide-gray-800">
                    {[
                        { time: '19:00', name: 'Mr. Tanaka', size: '4p', status: 'Confirmed' },
                        { time: '19:30', name: 'Sarah J.', size: '2p', status: 'Pending' },
                        { time: '20:00', name: 'VIP Group', size: '8p', status: 'Confirmed' },
                    ].map((res, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-800/50 transition-colors cursor-pointer">
                            <div>
                                <p className="text-sm font-bold text-white">{res.time}</p>
                                <p className="text-xs text-gray-400">{res.name}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs font-bold text-gray-300">{res.size}</span>
                                <span className={`text-[10px] uppercase font-bold ${res.status === 'Confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>{res.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DashboardWidgets
