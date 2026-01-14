import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const PublicMenu = () => {
    const { restaurantName } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                // Decode assuming the URL param might be encoded
                const decodedName = decodeURIComponent(restaurantName)
                const response = await fetch(`/.netlify/functions/public-menu?restaurantName=${encodeURIComponent(decodedName)}`)
                const result = await response.json()

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to load menu')
                }

                setData(result)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (restaurantName) {
            fetchMenu()
        }
    }, [restaurantName])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yum-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">😕 Oops!</h1>
                <p className="text-xl text-gray-400 mb-8">{error}</p>
                <p className="text-gray-500 text-sm">Check the URL or contact the restaurant.</p>
            </div>
        )
    }

    if (!data || !data.menu) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">🍽️ {data?.restaurant || 'Restaurant'}</h1>
                <p className="text-xl text-gray-400">No menu published yet.</p>
            </div>
        )
    }

    const { config } = data.menu
    // Handle case where config is a string (double encoded) or object
    const menuConfig = typeof config === 'string' ? JSON.parse(config) : config
    const { designConfig, sizes, friesOption, mealsOption } = menuConfig

    return (
        <div className="min-h-screen bg-[#0f1115] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div
                    className="relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in"
                    style={{
                        backgroundColor: '#1a1a1a',
                        borderLeft: `8px solid ${designConfig.accentColor}`
                    }}
                >
                    {/* Header Section */}
                    <div className="p-8 md:p-12 relative overflow-hidden" style={{ backgroundColor: `${designConfig.accentColor}15` }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-white pointer-events-none">
                            MENU
                        </div>
                        <div className="relative z-10 text-center md:text-left">
                            <h2
                                className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight"
                                style={{ fontFamily: designConfig.fontTheme === 'handwritten' ? 'cursive' : 'inherit' }}
                            >
                                {designConfig.mainTitle || 'Our Menu'}
                            </h2>
                            <p className="text-xl text-white/80 font-medium max-w-2xl">
                                {designConfig.subtitle || 'Delicious food, made with love.'}
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-12 space-y-12 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">

                        {/* Sizes */}
                        <div>
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-12 h-1 rounded-full" style={{ backgroundColor: designConfig.accentColor }}></span>
                                Menu Options
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sizes.map(size => (
                                    <div key={size.id} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                🌮
                                            </div>
                                            <span className="font-bold text-white text-xl">{size.size}</span>
                                        </div>
                                        <span className="text-2xl font-black" style={{ color: designConfig.accentColor }}>
                                            ${Number(size.price).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fries & Meals Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 border-t border-gray-800">
                            {friesOption && friesOption.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <span className="w-8 h-0.5 bg-yellow-500"></span>
                                        Sides & Fries
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {friesOption.map(opt => (
                                            <span key={opt} className="px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-sm font-bold capitalize flex items-center gap-2">
                                                <span>🍟</span>
                                                {opt.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mealsOption && mealsOption.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <span className="w-8 h-0.5 bg-green-500"></span>
                                        Chicken Choices
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {mealsOption.map(opt => (
                                            <span key={opt} className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-sm font-bold capitalize flex items-center gap-2">
                                                <span>🍗</span>
                                                {opt.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="bg-black/50 p-6 text-center border-t border-gray-800">
                        <p className="text-gray-600 text-sm">Powered by {data.restaurant} • {new Date().getFullYear()}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicMenu
