import React from 'react'

const Analytics = () => {
    return (
        <div className="space-y-8">
            {/* Top Section: Overview & Main Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Overview Chart Card (Purple Gradient) */}
                <div className="lg:col-span-2 bg-[#6c5ce7] bg-gradient-to-br from-[#6c5ce7] to-[#8e44ad] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-purple-200 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10 flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-1">Overview</h2>
                            <p className="text-purple-200">Monthly Sales Performance</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                            Monthly ▼
                        </div>
                    </div>

                    {/* Fake Chart Visualization */}
                    <div className="h-64 flex items-end justify-between gap-3 px-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div
                                    className="w-full bg-white/20 rounded-full relative group transition-all duration-300 hover:bg-white/40"
                                    style={{ height: `${h}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                                        ${h * 50}
                                    </div>

                                    {/* Top Dot */}
                                    {i === 11 && (
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                    )}
                                </div>
                                <span className="text-xs text-purple-200 font-medium">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats Summary Bubble */}
                    <div className="mt-8 flex gap-4">
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5 dark:border-white/10">
                            <p className="text-purple-200 text-xs uppercase tracking-wider mb-1">Total Sales</p>
                            <h3 className="text-2xl font-bold">748 Hrs</h3>
                        </div>
                        <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
                            <p className="text-white text-xs uppercase tracking-wider mb-1">Total Orders</p>
                            <h3 className="text-3xl font-black">9,178</h3>
                        </div>
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5 dark:border-white/10">
                            <p className="text-purple-200 text-xs uppercase tracking-wider mb-1">Target</p>
                            <h3 className="text-2xl font-bold">9.2k</h3>
                        </div>
                    </div>
                </div>

                {/* Right Column Widgets */}
                <div className="flex flex-col gap-6">
                    {/* Daily Stats (Purple Blue) */}
                    <div className="bg-[#6c5ce7] rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">
                                👟
                            </div>
                            <div className="text-right">
                                <h3 className="text-xl font-bold">Daily Jogging</h3>
                                <p className="text-indigo-200 text-sm">2km today</p>
                            </div>
                        </div>
                    </div>

                    {/* My Jogging (Pink) */}
                    <div className="flex-1 bg-[#fd79a8] bg-gradient-to-br from-[#fd79a8] to-[#e84393] rounded-[2rem] p-6 text-white shadow-xl shadow-pink-200 relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
                                    🏃
                                </div>
                                <h3 className="text-xl font-bold">My Jogging</h3>
                            </div>

                            <div className="mt-8">
                                <p className="text-pink-100 text-xs uppercase font-bold">Total Time</p>
                                <div className="flex justify-between items-end">
                                    <h2 className="text-4xl font-bold">748 hr</h2>
                                    <button className="w-10 h-10 rounded-full bg-white text-pink-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Info Cards (White glass) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Bicycle Drill", subtitle: "36 km / week", icon: "🚴", color: "text-indigo-500", progress: 45 },
                    { title: "Jogging Hero", subtitle: "12 km / month", icon: "🏃", color: "text-pink-500", progress: 13 },
                    { title: "Healthy Busy", subtitle: "3600 steps", icon: "🧘", color: "text-purple-500", progress: 90 },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-lg shadow-gray-100 dark:shadow-none border border-gray-50 dark:border-gray-700 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-16 h-16 rounded-2xl bg-${item.color.split('-')[1]}-50 dark:bg-${item.color.split('-')[1]}-900/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow-sm`}>
                            {item.icon}
                        </div>
                        <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg">{item.title}</h3>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">{item.subtitle}</p>

                        <div className="w-full mt-auto">
                            <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">
                                <span>Progress</span>
                                <span>{item.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-${item.color.split('-')[1]}-500 transition-all duration-1000 ease-out`}
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex justify-between w-full mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                            <span className="text-xs text-gray-400 dark:text-gray-500">17 / 30km</span>
                            <span className="text-xs font-bold text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-md">2 days left</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Analytics
