import React from 'react'

const DashboardWidgets = () => {
    return (
        <div className="space-y-8">
            {/* Sales Mini Graph */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">Performance</h3>
                <div className="bg-white dark:bg-gray-800/40 dark:backdrop-blur-md p-6 rounded-[2rem] shadow-sm dark:shadow-none border border-transparent dark:border-white/5 relative overflow-hidden transition-all duration-300">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Today's Sales</p>
                            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">$1,240</p>
                        </div>
                        <span className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold border border-transparent dark:border-green-500/20">+12%</span>
                    </div>
                    {/* CSS Bar Chart Simulation */}
                    <div className="flex items-end space-x-3 h-20 pt-2">
                        {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-t-xl overflow-hidden relative group">
                                <div className="absolute bottom-0 left-0 w-full bg-indigo-400 dark:bg-indigo-500 transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400" style={{ height: `${h}%` }}></div>
                            </div>
                        ))}
                    </div>
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
