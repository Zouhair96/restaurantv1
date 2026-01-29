import React, { useState } from 'react'

const OnboardingOverlay = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative bg-gray-900 border border-yum-primary/50 text-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yum-primary/20 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10 text-center space-y-8">
                    <div className="space-y-2">
                        <span className="inline-block py-1 px-3 rounded-full bg-yum-primary/20 text-yum-primary text-xs font-bold uppercase tracking-widest border border-yum-primary/50">
                            Welcome to the Pro League
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            You're In.
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Your dashboard is ready. We've prepared a few resources to help you master the Margio ecosystem and skyrocket your sales.
                        </p>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Dashboard Tour', time: '2 min', icon: '🎥' },
                            { title: 'Setup Menu AI', time: '5 min', icon: '🤖' },
                            { title: 'Boost 1st Promo', time: '3 min', icon: '🚀' },
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-yum-primary/50 rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-1 group">
                                <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
                                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{item.time}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-yum-primary hover:bg-red-500 text-white font-bold rounded-full shadow-lg hover:shadow-yum-primary/50 transition-all transform hover:-translate-y-1"
                    >
                        Enter Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OnboardingOverlay
