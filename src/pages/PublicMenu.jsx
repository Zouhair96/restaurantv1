import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const PublicMenu = () => {
    const { restaurantName } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [selections, setSelections] = useState({
        size: null,
        size: null,
        friesType: null,
        friesPlacement: null,
        chicken: [],
        sauce: [],
        drink: null,
        extras: []
    })

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
    const menuConfig = typeof config === 'string' ? JSON.parse(config) : config
    const { designConfig, sizes, friesOption = [], mealsOption = [], saucesOption = [], drinksOption = [], extrasOption = [] } = menuConfig

    const steps = [
        { id: 1, name: 'Select Size', icon: '🌮' },
        ...(friesOption.length > 0 ? [{ id: 2, name: 'Choose Fries', icon: '🍟' }] : []),
        ...(mealsOption.length > 0 ? [{ id: 3, name: 'Pick Chicken', icon: '🍗' }] : []),
        ...(saucesOption.length > 0 ? [{ id: 4, name: 'Select Sauce', icon: '🌶️' }] : []),
        ...(drinksOption.length > 0 ? [{ id: 5, name: 'Pick Drink', icon: '🥤' }] : []),
        ...(extrasOption.length > 0 ? [{ id: 6, name: 'Add Extras', icon: '✨' }] : []),
        { id: 'final', name: 'Review Order', icon: '✨' }
    ]

    const totalSteps = steps.length
    const currentStepIndex = steps.findIndex(s => s.id === currentStep)

    const nextStep = () => {
        const nextIdx = currentStepIndex + 1
        if (nextIdx < totalSteps) {
            setCurrentStep(steps[nextIdx].id)
        }
    }

    const prevStep = () => {
        const prevIdx = currentStepIndex - 1
        if (prevIdx >= 0) {
            setCurrentStep(steps[prevIdx].id)
        }
    }

    const menuOptions = {
        fries: {
            'sans': { label: 'Sans Frites', icon: '🚫' },
            'un_peu': { label: 'Un Peu', icon: '🍟' },
            'moyenne': { label: 'Moyenne', icon: '🍟🍟' },
            'beaucoup': { label: 'Beaucoup', icon: '🍟🍟🍟' },
            'inside': { label: 'Fries Inside', icon: '🥙' },
            'outside': { label: 'Fries Outside', icon: '🍽️' }
        },
        chicken: {
            'calssique': { label: 'Classique', icon: '🍗' },
            'tandoori': { label: 'Tandoori', icon: '🌶️' },
            'curry': { label: 'Curry', icon: '🍛' },
            'bbq': { label: 'BBQ', icon: '🔥' },
            'nuggets': { label: 'Nuggets', icon: '🥡' },
            'crispy': { label: 'Crispy', icon: '🥪' },
            'filet': { label: 'Filet', icon: '🥩' },
            'cordon_bleu': { label: 'Cordon Bleu', icon: '🧀' },
            'fajita': { label: 'Fajita', icon: '🌮' },
            'minced': { label: 'Minced', icon: '🥢' }
        },
        sauce: {
            'ketchup': { label: 'Ketchup', icon: '🍅' },
            'mayo': { label: 'Mayo', icon: '🥛' },
            'algerienne': { label: 'Algérienne', icon: '🔥' },
            'samourai': { label: 'Samouraï', icon: '⚔️' },
            'blanche': { label: 'Blanche', icon: '☁️' },
            'biggy': { label: 'Biggy', icon: '🍔' },
            'andalouse': { label: 'Andalouse', icon: '🇪🇸' },
            'cheese': { label: 'Sauce Cheese', icon: '🧀' }
        },
        drink: {
            'coca': { label: 'Coca-Cola', icon: '🥤' },
            'fanta': { label: 'Fanta', icon: '🍊' },
            'sprite': { label: 'Sprite', icon: '🍋' },
            'oasis': { label: 'Oasis', icon: '🍎' },
            'water': { label: 'Eau Minérale', icon: '💧' },
            'tea': { label: 'Ice Tea', icon: '🍃' },
            'tropico': { label: 'Tropico', icon: '🏝️' }
        },
        extras: {
            'gratinage': { label: 'Gratinage', icon: '🧀' },
            'raclette': { label: 'Raclette', icon: '🍖' },
            'egg': { label: 'Oeuf', icon: '🍳' },
            'bacon': { label: 'Bacon Beef', icon: '🥓' },
            'double_cheese': { label: 'Double Cheese', icon: '🧀🧀' }
        }
    }

    const handleToggleSelection = (category, value) => {
        setSelections(prev => {
            if (category === 'size' || category === 'drink') {
                return { ...prev, [category]: value }
            }
            if (category === 'friesType') {
                return {
                    ...prev,
                    friesType: value,
                    friesPlacement: value === 'sans' ? null : prev.friesPlacement
                }
            }
            if (category === 'friesPlacement') {
                // Prevent selection if sans is active
                if (prev.friesType === 'sans') return prev
                return { ...prev, friesPlacement: value }
            }

            const current = prev[category]
            const exists = current.includes(value)

            // Logic for limits based on size
            const isSizeS = prev.size?.size === 'S'

            if (isSizeS) {
                if (category === 'chicken') {
                    // Limit to 1: If selecting a new one, replace the old one (radio behavior)
                    if (!exists) {
                        return { ...prev, [category]: [value] }
                    }
                }
                if (category === 'sauce') {
                    // Limit to 2: Prevent adding more than 2
                    if (!exists && current.length >= 2) {
                        return prev
                    }
                }
            }

            const updated = exists
                ? current.filter(item => item !== value)
                : [...current, value]

            return { ...prev, [category]: updated }
        })
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Choose Your Size</h3>
                            <p className="text-gray-400">Select the perfect portion for your craving</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sizes.map(size => (
                                <button
                                    key={size.id}
                                    onClick={() => handleToggleSelection('size', size)}
                                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${selections.size?.id === size.id
                                        ? 'bg-yum-primary/20 border-yum-primary shadow-lg shadow-yum-primary/20'
                                        : 'bg-white/5 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${selections.size?.id === size.id ? 'bg-yum-primary text-white' : 'bg-gray-800 text-gray-400'
                                            }`}>
                                            🌮
                                        </div>
                                        <div>
                                            <span className="block font-black text-white text-xl">{size.size}</span>
                                            <span className="text-gray-400 text-sm font-bold">Base Option</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-2xl font-black ${selections.size?.id === size.id ? 'text-white' : ''}`} style={{ color: selections.size?.id === size.id ? '' : designConfig.accentColor }}>
                                            ${Number(size.price).toFixed(2)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end pt-8">
                            <button
                                onClick={nextStep}
                                disabled={!selections.size}
                                className="px-12 py-4 bg-yum-primary text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-yum-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Customize Your Sides</h3>
                            <p className="text-gray-400">Select quantity and placement</p>
                        </div>

                        {/* Quantity Section */}
                        <div className="mb-8">
                            <h4 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Quantity</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {friesOption.filter(opt => ['sans', 'un_peu', 'moyenne', 'beaucoup'].includes(opt)).map(opt => {
                                    const info = menuOptions.fries[opt] || { label: opt, icon: '🍟' }
                                    const isSelected = selections.friesType === opt
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleToggleSelection('friesType', opt)}
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${isSelected
                                                ? 'bg-yellow-500/20 border-yellow-500'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected ? 'bg-yellow-500 text-white' : 'bg-gray-800'
                                                }`}>
                                                {info.icon}
                                            </div>
                                            <span className="font-bold text-white capitalize">{info.label}</span>
                                            {isSelected && (
                                                <div className="ml-auto text-yellow-500">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Placement Section */}
                        <div>
                            <h4 className={`text-sm font-bold uppercase tracking-widest mb-4 ${selections.friesType === 'sans' ? 'text-gray-600' : 'text-gray-400'}`}>Placement</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {friesOption.filter(opt => ['inside', 'outside'].includes(opt)).map(opt => {
                                    const info = menuOptions.fries[opt] || { label: opt, icon: '🍟' }
                                    const isSelected = selections.friesPlacement === opt
                                    const isDisabled = selections.friesType === 'sans'

                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleToggleSelection('friesPlacement', opt)}
                                            disabled={isDisabled}
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all 
                                                ${isDisabled ? 'opacity-30 cursor-not-allowed bg-black/20 border-transparent' :
                                                    isSelected ? 'bg-yellow-500/20 border-yellow-500' : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected ? 'bg-yellow-500 text-white' : 'bg-gray-800'
                                                }`}>
                                                {info.icon}
                                            </div>
                                            <span className="font-bold text-white capitalize">{info.label}</span>
                                            {isSelected && (
                                                <div className="ml-auto text-yellow-500">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between pt-8">
                            <button onClick={prevStep} className="px-8 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors">Back</button>
                            <button onClick={nextStep} disabled={!selections.friesType && !selections.friesPlacement && friesOption.length > 0} className="px-12 py-4 bg-yum-primary text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-yum-primary/20 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Chicken Choices</h3>
                            <p className="text-gray-400">Pick your protein style</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mealsOption.map(opt => {
                                const info = menuOptions.chicken[opt] || { label: opt, icon: '🍗' }
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleToggleSelection('chicken', opt)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selections.chicken.includes(opt)
                                            ? 'bg-green-500/20 border-green-500'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selections.chicken.includes(opt) ? 'bg-green-500 text-white' : 'bg-gray-800'
                                            }`}>
                                            {info.icon}
                                        </div>
                                        <span className="font-bold text-white capitalize">{info.label}</span>
                                        {selections.chicken.includes(opt) && (
                                            <div className="ml-auto text-green-500">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex justify-between pt-8">
                            <button onClick={prevStep} className="px-8 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors">Back</button>
                            <button onClick={nextStep} className="px-12 py-4 bg-yum-primary text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-yum-primary/20">Finalize</button>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Select Your Sauces</h3>
                            <p className="text-gray-400">Add some flavor to your tacos</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {saucesOption.map(opt => {
                                const info = menuOptions.sauce[opt] || { label: opt, icon: '🌶️' }
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleToggleSelection('sauce', opt)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selections.sauce.includes(opt)
                                            ? 'bg-red-500/20 border-red-500'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selections.sauce.includes(opt) ? 'bg-red-500 text-white' : 'bg-gray-800'
                                            }`}>
                                            {info.icon}
                                        </div>
                                        <span className="font-bold text-white capitalize">{info.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex justify-between pt-8">
                            <button onClick={prevStep} className="px-8 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors">Back</button>
                            <button onClick={nextStep} className="px-12 py-4 bg-yum-primary text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-yum-primary/20">Next</button>
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Quench Your Thirst</h3>
                            <p className="text-gray-400">Pick a refreshing drink</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {drinksOption.map(opt => {
                                const info = menuOptions.drink[opt] || { label: opt, icon: '🥤' }
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleToggleSelection('drink', opt)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selections.drink === opt
                                            ? 'bg-blue-500/20 border-blue-500'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selections.drink === opt ? 'bg-blue-500 text-white' : 'bg-gray-800'
                                            }`}>
                                            {info.icon}
                                        </div>
                                        <span className="font-bold text-white capitalize">{info.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex justify-between pt-8">
                            <button onClick={prevStep} className="px-8 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors">Back</button>
                            <button onClick={nextStep} className="px-12 py-4 bg-yum-primary text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-yum-primary/20">Next</button>
                        </div>
                    </div>
                )
            case 6:
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black text-white mb-2">Extra Indulgence</h3>
                            <p className="text-gray-400">Make it even more special</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {extrasOption.map(opt => {
                                const info = menuOptions.extras[opt] || { label: opt, icon: '✨' }
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleToggleSelection('extras', opt)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selections.extras.includes(opt)
                                            ? 'bg-purple-500/20 border-purple-500'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selections.extras.includes(opt) ? 'bg-purple-500 text-white' : 'bg-gray-800'
                                            }`}>
                                            {info.icon}
                                        </div>
                                        <span className="font-bold text-white capitalize">{info.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex justify-between pt-8">
                            <button onClick={prevStep} className="px-8 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors">Back</button>
                            <button onClick={nextStep} className="px-12 py-4 bg-yum-primary text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-yum-primary/20">Finalize</button>
                        </div>
                    </div>
                )
            case 'final':
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-4">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">✨</div>
                            <h3 className="text-3xl font-black text-white mb-2">Order Summary</h3>
                            <p className="text-gray-400">Review your delicious selection</p>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 space-y-6">
                            {/* Selected Size */}
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🌮</span>
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Selected Size</p>
                                        <p className="text-white font-black text-xl">{selections.size?.size || 'N/A'}</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-white">${Number(selections.size?.price || 0).toFixed(2)}</p>
                            </div>

                            {/* Sides */}
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-3">Extras & Sides</p>
                                <div className="flex flex-wrap gap-2">
                                    {selections.friesType && (
                                        (() => {
                                            const info = menuOptions.fries[selections.friesType] || { label: selections.friesType, icon: '🍟' }
                                            return <span className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl text-sm font-bold border border-yellow-500/20 capitalize">{info.icon} {info.label}</span>
                                        })()
                                    )}
                                    {selections.friesPlacement && (
                                        (() => {
                                            const info = menuOptions.fries[selections.friesPlacement] || { label: selections.friesPlacement, icon: '🍟' }
                                            return <span className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl text-sm font-bold border border-yellow-500/20 capitalize">{info.icon} {info.label}</span>
                                        })()
                                    )}
                                    {!selections.friesType && !selections.friesPlacement && <span className="text-gray-600 italic">No sides selected</span>}
                                </div>
                            </div>

                            {/* Chicken */}
                            <div className="pb-4 border-b border-white/5">
                                <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-3">Preparation</p>
                                <div className="flex flex-wrap gap-2">
                                    {selections.chicken.length > 0 ? selections.chicken.map(c => {
                                        const info = menuOptions.chicken[c] || { label: c, icon: '🍗' }
                                        return <span key={c} className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl text-sm font-bold border border-green-500/20 capitalize">{info.icon} {info.label}</span>
                                    }) : <span className="text-gray-600 italic">Standard preparation</span>}
                                </div>
                            </div>

                            {/* Sauces */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-3">Sauces</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selections.sauce.length > 0 ? selections.sauce.map(s => {
                                            const info = menuOptions.sauce[s] || { label: s, icon: '🌶️' }
                                            return <span key={s} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20 capitalize">{info.icon} {info.label}</span>
                                        }) : <span className="text-gray-600 italic">No sauce selected</span>}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-3">Drink</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selections.drink ? (
                                            (() => {
                                                const info = menuOptions.drink[selections.drink] || { label: selections.drink, icon: '🥤' }
                                                return <span className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-sm font-bold border border-blue-500/20 capitalize">{info.icon} {info.label}</span>
                                            })()
                                        ) : <span className="text-gray-600 italic">No drink selected</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Extras */}
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-3">Extras & Gratinage</p>
                                <div className="flex flex-wrap gap-2">
                                    {selections.extras.length > 0 ? selections.extras.map(e => {
                                        const info = menuOptions.extras[e] || { label: e, icon: '✨' }
                                        return <span key={e} className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl text-sm font-bold border border-purple-500/20 capitalize">{info.icon} {info.label}</span>
                                    }) : <span className="text-gray-600 italic">No extras added</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-5 bg-yum-primary text-white font-black text-xl rounded-2xl hover:bg-red-500 transition-all shadow-2xl shadow-yum-primary/30"
                            >
                                Place Order
                            </button>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="w-full py-4 text-gray-500 font-bold hover:text-white transition-colors"
                            >
                                Edit Selection
                            </button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-[#0f1115] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div
                    className="relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in mb-8"
                    style={{
                        backgroundColor: '#1a1a1a',
                        borderLeft: `8px solid ${designConfig.accentColor}`
                    }}
                >
                    {/* Progress Header */}
                    <div className="px-8 pt-8 md:px-12 md:pt-12 flex justify-between items-center mb-6">
                        <div className="flex gap-2">
                            {steps.map((s, idx) => (
                                <div
                                    key={s.id}
                                    className={`h-2 w-12 rounded-full transition-all duration-500 ${idx <= currentStepIndex ? 'bg-yum-primary' : 'bg-gray-800'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">
                            Step {currentStepIndex + 1} / {totalSteps}
                        </span>
                    </div>

                    <div className="px-8 pb-12 md:px-12 md:pb-12">
                        {/* Menu Header */}
                        <div className="mb-12 text-center border-b border-white/5 pb-12">
                            <h1
                                className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter"
                                style={{
                                    fontFamily: designConfig.fontTheme === 'handwritten' ? 'cursive' :
                                        designConfig.fontTheme === 'modern' ? 'Outfit, sans-serif' : 'inherit'
                                }}
                            >
                                {designConfig.mainTitle}
                            </h1>
                            <div className="flex justify-center items-center gap-4">
                                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: designConfig.accentColor }}></div>
                                <p className="text-xl text-gray-400 font-medium">{designConfig.subtitle}</p>
                                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: designConfig.accentColor }}></div>
                            </div>
                        </div>

                        {renderStepContent()}
                    </div>

                    {/* Footer */}
                    <div className="bg-black/20 p-6 text-center border-t border-gray-800/50">
                        <p className="text-gray-600 text-[10px] sm:text-xs uppercase tracking-widest font-bold">
                            Powered by {data.restaurant} • {new Date().getFullYear()} • Secure Ordering
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicMenu
