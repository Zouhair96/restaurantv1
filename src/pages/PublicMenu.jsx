import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import PublicMenuSidebar from '../components/public-menu/PublicMenuSidebar'
import { HiOutlineUserCircle, HiOutlineMenuAlt2, HiOutlineSun, HiOutlineMoon, HiOutlineX } from 'react-icons/hi'

const PublicMenu = () => {
    const { restaurantName } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [selections, setSelections] = useState({
        size: null,
        friesType: null,
        friesPlacement: null,
        chicken: [],
        sauce: [],
        drink: null,
        extras: []
    })
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [orderDetails, setOrderDetails] = useState({
        orderType: 'dine_in',
        tableNumber: '',
        deliveryAddress: '',
        paymentMethod: 'cash'
    })
    const [submitting, setSubmitting] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [orderStatus, setOrderStatus] = useState(null)
    const [showSidebar, setShowSidebar] = useState(false)
    const [maxStepReached, setMaxStepReached] = useState(1)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme_preference');
        return saved ? saved === 'dark' : true;
    });
    const activeStepRef = useRef(null)

    // Save theme preference
    useEffect(() => {
        localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

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
    const config = data?.menu?.config;
    const menuConfig = typeof config === 'string' ? JSON.parse(config) : (config || {});
    const {
        designConfig = {},
        sizes = [],
        friesOption = [],
        mealsOption = [],
        saucesOption = [],
        drinksOption = [],
        extrasOption = []
    } = menuConfig;

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
            const nextStepId = steps[nextIdx].id
            setCurrentStep(nextStepId)

            // Update max step reached
            const stepNum = typeof nextStepId === 'number' ? nextStepId : totalSteps
            if (stepNum > maxStepReached) {
                setMaxStepReached(stepNum)
            }
        }
    }

    const prevStep = () => {
        const prevIdx = currentStepIndex - 1
        if (prevIdx >= 0) {
            setCurrentStep(steps[prevIdx].id)
        }
    }

    const goToStep = (stepId) => {
        // Only allow jumping to steps already reached
        const stepIndex = steps.findIndex(s => s.id === stepId)
        const stepNum = typeof stepId === 'number' ? stepId : totalSteps

        if (stepNum <= maxStepReached || stepIndex <= currentStepIndex) {
            setCurrentStep(stepId)
        }
    }

    // Auto-advance Step 1: Size selected (only if not revisiting)
    useEffect(() => {
        if (currentStep === 1 && selections.size && maxStepReached === 1) {
            const timer = setTimeout(() => nextStep(), 400);
            return () => clearTimeout(timer);
        }
    }, [selections.size, currentStep, maxStepReached]);

    // Auto-advance Step 2: Fries options complete (only if not revisiting)
    useEffect(() => {
        if (currentStep === 2 && maxStepReached === 2) {
            const hasPlacementOptions = friesOption.some(opt => ['inside', 'outside'].includes(opt));
            const hasTypeSelected = selections.friesType !== null;
            const hasPlacementSelected = selections.friesPlacement !== null;

            if (hasTypeSelected) {
                // Advance if 'sans' (no placement needed) OR no placement options available OR placement already selected
                if (selections.friesType === 'sans' || !hasPlacementOptions || hasPlacementSelected) {
                    const timer = setTimeout(() => nextStep(), 400);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [selections.friesType, selections.friesPlacement, currentStep, friesOption, maxStepReached]);

    // Scroll active step into view centered
    useEffect(() => {
        if (activeStepRef.current) {
            activeStepRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [currentStep]);

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




    const calculateTotal = () => {
        let total = selections.size ? parseFloat(selections.size.price) : 0
        // Add logic for extras pricing if needed
        return total.toFixed(2)
    }

    const handleSubmitOrder = async () => {
        // Validation
        if (orderDetails.orderType === 'dine_in' && !orderDetails.tableNumber.trim()) {
            alert('Please enter a table number')
            return
        }
        if (orderDetails.orderType === 'take_out' && !orderDetails.deliveryAddress.trim()) {
            alert('Please enter a delivery address')
            return
        }

        setSubmitting(true)

        try {
            const response = await fetch('/.netlify/functions/submit-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('client_token') ? `Bearer ${localStorage.getItem('client_token')}` : ''
                },
                body: JSON.stringify({
                    restaurantName: decodeURIComponent(restaurantName),
                    orderType: orderDetails.orderType,
                    tableNumber: orderDetails.tableNumber,
                    deliveryAddress: orderDetails.deliveryAddress,
                    paymentMethod: orderDetails.paymentMethod,
                    items: selections,
                    totalPrice: calculateTotal()
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit order')
            }

            setOrderSuccess(true)

            // Dispatch event for real-time history update in sidebar
            window.dispatchEvent(new CustomEvent('clientOrderPlaced'));

            setTimeout(() => {
                setShowOrderModal(false)
                setOrderSuccess(false)
                // Reset to step 1
                setCurrentStep(1)
                setSelections({
                    size: null,
                    friesType: null,
                    friesPlacement: null,
                    chicken: [],
                    sauce: [],
                    drink: null,
                    extras: []
                })
                setOrderDetails({
                    orderType: 'dine_in',
                    tableNumber: '',
                    deliveryAddress: '',
                    paymentMethod: 'cash'
                })
            }, 2000)

        } catch (err) {
            console.error('Order submission error:', err)
            alert(err.message || 'Failed to submit order. Please try again.')
        } finally {
            setSubmitting(false)
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
            // 1. Handle Single Select Categories
            if (category === 'size' || category === 'drink') {
                if (category === 'size' && prev.size?.id !== value.id) {
                    // Reset progress if size changes
                    setMaxStepReached(1)
                }
                return { ...prev, [category]: value }
            }

            // 2. Handle Fries Special Logic
            if (category === 'friesType') {
                return {
                    ...prev,
                    friesType: value,
                    friesPlacement: value === 'sans' ? null : prev.friesPlacement
                }
            }
            if (category === 'friesPlacement') {
                if (prev.friesType === 'sans') return prev
                return { ...prev, friesPlacement: value }
            }

            // 3. Handle Array Categories
            const current = prev[category] || []
            const exists = current.includes(value)

            // 4. Apply Limits based on Size 'S'
            const isSizeS = prev.size?.size === 'S'
            if (isSizeS) {
                if (category === 'chicken') {
                    // Step 3: Limit 1 (Radio behavior)
                    if (!exists) return { ...prev, [category]: [value] }
                }
                if (category === 'sauce') {
                    // Step 4: Limit 2
                    if (!exists && current.length >= 2) return prev
                }
            }

            // 5. Default Toggle Logic (Array)
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
                            <h3 className={`text-3xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Choose Your Size</h3>
                            <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select the perfect portion for your craving</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sizes.map((size, idx) => {
                                const isSelected = selections.size?.id === size.id;
                                return (
                                    <button
                                        key={size.id}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                        onClick={() => handleToggleSelection('size', size)}
                                        className={`p-6 rounded-3xl border-2 transition-all group animate-fade-in ${isSelected
                                            ? 'bg-yum-primary/10 border-yum-primary'
                                            : isDarkMode
                                                ? 'bg-white/5 border-white/10 hover:border-white/30'
                                                : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${isSelected
                                                ? 'bg-yum-primary text-white'
                                                : isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                🌮
                                            </div>
                                            <div>
                                                <span className={`block font-black text-xl transition-colors ${isSelected ? (isDarkMode ? 'text-white' : 'text-yum-primary') : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{size.size}</span>
                                                <span className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Base Option</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-2xl font-black transition-colors ${isSelected ? (isDarkMode ? 'text-white' : 'text-yum-primary') : ''}`} style={{ color: isSelected ? '' : designConfig.accentColor }}>
                                                ${Number(size.price).toFixed(2)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
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
                            <h3 className={`text-3xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customize Your Sides</h3>
                            <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select quantity and placement</p>
                        </div>

                        {/* Quantity Section */}
                        <div className="mb-8">
                            <h4 className={`text-sm font-bold uppercase tracking-widest mb-4 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quantity</h4>
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
                                                : isDarkMode
                                                    ? 'bg-white/5 border-white/5 hover:bg-white/10'
                                                    : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected
                                                ? 'bg-yellow-500 text-white'
                                                : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                                                }`}>
                                                {info.icon}
                                            </div>
                                            <span className={`font-bold capitalize transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{info.label}</span>
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
                            <h4 className={`text-sm font-bold uppercase tracking-widest mb-4 transition-colors ${selections.friesType === 'sans' ? (isDarkMode ? 'text-gray-700' : 'text-gray-300') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>Placement</h4>
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
                                                ${isDisabled
                                                    ? 'opacity-30 cursor-not-allowed bg-black/20 border-transparent'
                                                    : isSelected
                                                        ? 'bg-yellow-500/20 border-yellow-500'
                                                        : isDarkMode
                                                            ? 'bg-white/5 border-white/5 hover:bg-white/10'
                                                            : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected
                                                ? 'bg-yellow-500 text-white'
                                                : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                                                }`}>
                                                {info.icon}
                                            </div>
                                            <span className={`font-bold capitalize transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{info.label}</span>
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
                            <button onClick={prevStep} className={`px-8 py-4 font-bold rounded-2xl transition-colors ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Back</button>
                            <button onClick={nextStep} disabled={!selections.friesType && !selections.friesPlacement && friesOption.length > 0} className="px-12 py-4 bg-yum-primary text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-yum-primary/20 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="animate-fade-in space-y-8">
                        <div className="text-center mb-8">
                            <h3 className={`text-3xl font-black mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chicken Choices</h3>
                            <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pick your protein style</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mealsOption.map((mealId, idx) => {
                                const meal = menuOptions.chicken[mealId] || { label: mealId, icon: '🍗' }
                                const isSelected = selections.chicken.includes(mealId)
                                return (
                                    <button
                                        key={mealId}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        onClick={() => handleToggleSelection('chicken', mealId)}
                                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all group animate-fade-in ${isSelected
                                            ? 'bg-yum-primary/20 border-yum-primary shadow-lg shadow-yum-primary/20'
                                            : isDarkMode
                                                ? 'bg-white/5 border-white/5 hover:border-white/20'
                                                : 'bg-white border-gray-100 hover:border-gray-50 shadow-sm'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected
                                            ? 'bg-green-500 text-white'
                                            : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                                            }`}>
                                            {meal.icon}
                                        </div>
                                        <span className={`font-bold capitalize transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{meal.label}</span>
                                        {isSelected && (
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
                            <button onClick={prevStep} className={`px-8 py-4 font-bold rounded-2xl transition-colors ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Back</button>
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {saucesOption.map((sauceId, idx) => {
                                const sauce = menuOptions.sauce[sauceId] || { label: sauceId, icon: '🌶️' }
                                const isSelected = selections.sauce.includes(sauceId)
                                return (
                                    <button
                                        key={sauceId}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        onClick={() => handleToggleSelection('sauce', sauceId)}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group animate-fade-in ${isSelected
                                            ? 'bg-yum-primary/20 border-yum-primary shadow-lg shadow-yum-primary/20'
                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected ? 'bg-red-500 text-white' : 'bg-gray-800'
                                            }`}>
                                            {sauce.icon}
                                        </div>
                                        <span className="font-bold text-white capitalize">{sauce.label}</span>
                                        {isSelected && (
                                            <div className="ml-auto text-red-500">
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {drinksOption.map((drinkId, idx) => {
                                const drink = menuOptions.drink[drinkId] || { label: drinkId, icon: '🥤' }
                                const isSelected = selections.drink === drinkId
                                return (
                                    <button
                                        key={drinkId}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        onClick={() => handleToggleSelection('drink', drinkId)}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group animate-fade-in ${isSelected
                                            ? 'bg-yum-primary/20 border-yum-primary shadow-lg shadow-yum-primary/20'
                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-800'
                                            }`}>
                                            {drink.icon}
                                        </div>
                                        <span className="font-bold text-white capitalize">{drink.label}</span>
                                        {isSelected && (
                                            <div className="ml-auto text-blue-500">
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
                            {extrasOption.map((extraId, idx) => {
                                const extra = menuOptions.extras[extraId] || { label: extraId, icon: '✨' }
                                const isSelected = selections.extras.includes(extraId)
                                return (
                                    <button
                                        key={extraId}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        onClick={() => handleToggleSelection('extras', extraId)}
                                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all group animate-fade-in ${isSelected
                                            ? 'bg-yum-primary/20 border-yum-primary shadow-lg shadow-yum-primary/20'
                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isSelected ? 'bg-yum-primary text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                {extra.icon}
                                            </div>
                                            <div>
                                                <span className="font-black text-white block capitalize">{extra.label}</span>
                                                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Extra Upgrade</span>
                                            </div>
                                        </div>
                                        {isSelected && <div className="w-6 h-6 rounded-full bg-yum-primary flex items-center justify-center text-white text-xs">✓</div>}
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
                            <h3 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Summary</h3>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Review your delicious selection</p>
                        </div>

                        <div className={`rounded-3xl p-8 border transition-all ${isDarkMode
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
                            } space-y-6`}>
                            {/* Selected Size */}
                            <div className={`flex justify-between items-center pb-4 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🌮</span>
                                    <div>
                                        <p className={`text-xs uppercase font-bold tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Selected Size</p>
                                        <p className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selections.size?.size || 'N/A'}</p>
                                    </div>
                                </div>
                                <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${Number(selections.size?.price || 0).toFixed(2)}</p>
                            </div>

                            {/* Sides */}
                            <div>
                                <p className={`text-xs uppercase font-bold tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Extras & Sides</p>
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
                                    {!selections.friesType && !selections.friesPlacement && <span className={isDarkMode ? 'text-gray-600 italic' : 'text-gray-400 italic'}>No sides selected</span>}
                                </div>
                            </div>

                            {/* Chicken */}
                            <div className={`pb-4 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                                <p className={`text-xs uppercase font-bold tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Preparation</p>
                                <div className="flex flex-wrap gap-2">
                                    {selections.chicken.length > 0 ? selections.chicken.map(c => {
                                        const info = menuOptions.chicken[c] || { label: c, icon: '🍗' }
                                        return <span key={c} className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl text-sm font-bold border border-green-500/20 capitalize">{info.icon} {info.label}</span>
                                    }) : <span className={isDarkMode ? 'text-gray-600 italic' : 'text-gray-400 italic'}>Standard preparation</span>}
                                </div>
                            </div>

                            {/* Sauces & Drink */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className={`text-xs uppercase font-bold tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sauces</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selections.sauce.length > 0 ? selections.sauce.map(s => {
                                            const info = menuOptions.sauce[s] || { label: s, icon: '🌶️' }
                                            return <span key={s} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20 capitalize">{info.icon} {info.label}</span>
                                        }) : <span className={isDarkMode ? 'text-gray-600 italic' : 'text-gray-400 italic'}>No sauce selected</span>}
                                    </div>
                                </div>

                                <div>
                                    <p className={`text-xs uppercase font-bold tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Drink</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selections.drink ? (
                                            (() => {
                                                const info = menuOptions.drink[selections.drink] || { label: selections.drink, icon: '🥤' }
                                                return <span className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-sm font-bold border border-blue-500/20 capitalize">{info.icon} {info.label}</span>
                                            })()
                                        ) : <span className={isDarkMode ? 'text-gray-600 italic' : 'text-gray-400 italic'}>No drink selected</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Extras */}
                            <div>
                                <p className={`text-xs uppercase font-bold tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Extras & Gratinage</p>
                                <div className="flex flex-wrap gap-2">
                                    {selections.extras.length > 0 ? selections.extras.map(e => {
                                        const info = menuOptions.extras[e] || { label: e, icon: '✨' }
                                        return <span key={e} className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl text-sm font-bold border border-purple-500/20 capitalize">{info.icon} {info.label}</span>
                                    }) : <span className={isDarkMode ? 'text-gray-600 italic' : 'text-gray-400 italic'}>No extras added</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => setShowOrderModal(true)}
                                className="w-full py-5 bg-yum-primary text-white font-black text-xl rounded-2xl hover:bg-red-500 transition-all shadow-2xl shadow-yum-primary/30"
                            >
                                Place Order
                            </button>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className={`w-full py-4 font-bold transition-colors ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
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
        <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0f1115]' : 'bg-gray-50'}`}>
            {/* Unified Sticky Navigation Bar */}
            <div className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${isDarkMode
                ? 'bg-[#0f1115]/90 border-white/5'
                : 'bg-white/90 border-gray-200 shadow-sm'
                } space-y-1`}>
                <header className="py-4 px-6">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2.5 rounded-xl transition-all border ${isDarkMode
                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                    : 'bg-black/5 border-black/5 text-gray-500 hover:text-black hover:bg-black/10'
                                    }`}
                                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {isDarkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
                            </button>
                            <button
                                onClick={() => setShowSidebar(true)}
                                className={`p-2.5 rounded-xl transition-all border ${isDarkMode
                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                    : 'bg-black/5 border-black/5 text-gray-500 hover:text-black hover:bg-black/10'
                                    }`}
                                title="Open Menu"
                            >
                                <HiOutlineMenuAlt2 size={24} />
                            </button>
                        </div>
                        <h2 className={`text-xl font-black tracking-tight uppercase transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            {data.restaurant}
                        </h2>
                    </div>
                </header>

                {/* Navigation Steps Indicator */}
                <div className="max-w-4xl mx-auto px-4 sm:px-0">
                    <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar sm:justify-center">
                        <div className="flex flex-nowrap sm:flex-wrap gap-3">
                            {steps.map((step, index) => {
                                const isReached = (typeof step.id === 'number' ? step.id : totalSteps) <= maxStepReached;
                                const isActive = currentStep === step.id;

                                return (
                                    <button
                                        key={step.id}
                                        ref={isActive ? activeStepRef : null}
                                        onClick={() => isReached && goToStep(step.id)}
                                        disabled={!isReached}
                                        className={`flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-500 ${isActive
                                            ? 'bg-yum-primary text-white shadow-xl shadow-red-500/40 scale-110 mx-6 z-10'
                                            : isReached
                                                ? isDarkMode
                                                    ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100'
                                                : isDarkMode
                                                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className={`${isActive ? 'text-2xl' : 'text-xl'} transition-all`}>{step.icon}</span>
                                        <span className={`font-black ${isActive ? 'block' : 'hidden md:block'} text-sm tracking-tight`}>{step.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <PublicMenuSidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
                restaurantName={data.restaurant}
                designConfig={designConfig}
                isDarkMode={isDarkMode}
            />

            <div className={`transition-all duration-300 ${showSidebar ? 'sm:ml-96 blur-sm sm:blur-0' : ''} px-4 sm:px-6 lg:px-8 py-8`}>
                <div className="max-w-4xl mx-auto">

                    <div
                        className={`relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in mb-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-100'
                            }`}
                        style={{
                            borderLeft: `8px solid ${designConfig.accentColor}`
                        }}
                    >
                        {/* Progress Header */}
                        <div className="px-6 pt-6 md:px-12 md:pt-12 flex justify-between items-center mb-6">
                            <div className="flex gap-1 sm:gap-2">
                                {steps.map((s, idx) => (
                                    <div
                                        key={s.id}
                                        className={`h-1.5 w-8 sm:w-12 rounded-full transition-all duration-500 ${idx <= currentStepIndex
                                            ? 'bg-yum-primary'
                                            : isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className={`font-bold text-[10px] sm:text-sm tracking-widest uppercase transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                {currentStepIndex + 1} / {totalSteps}
                            </span>
                        </div>

                        <div className="px-6 pb-12 md:px-12 md:pb-12">
                            {/* Menu Header */}
                            <div className={`mb-12 text-center border-b pb-12 transition-colors ${isDarkMode ? 'border-white/5' : 'border-gray-100'
                                }`}>
                                <h1
                                    className={`text-3xl sm:text-5xl md:text-7xl font-black mb-4 tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}
                                    style={{
                                        fontFamily: designConfig.fontTheme === 'handwritten' ? 'cursive' :
                                            designConfig.fontTheme === 'modern' ? 'Outfit, sans-serif' : 'inherit'
                                    }}
                                >
                                    {designConfig.mainTitle}
                                </h1>
                                <div className="flex justify-center items-center gap-2 sm:gap-4">
                                    <div className="h-1 w-8 sm:w-12 rounded-full" style={{ backgroundColor: designConfig.accentColor }}></div>
                                    <p className={`text-sm sm:text-xl font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                        {designConfig.subtitle}
                                    </p>
                                    <div className="h-1 w-8 sm:w-12 rounded-full" style={{ backgroundColor: designConfig.accentColor }}></div>
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

            {showOrderModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !submitting && setShowOrderModal(false)}
                    />
                    <div className={`relative w-full max-w-lg rounded-3xl p-8 shadow-2xl transition-all duration-300 animate-scale-up border ${isDarkMode
                        ? 'bg-[#151921] border-white/10'
                        : 'bg-white border-gray-100'
                        }`}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Complete Order</h3>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                <HiOutlineX className="w-6 h-6" />
                            </button>
                        </div>

                        {orderStatus === 'success' || orderSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
                                <h4 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Received!</h4>
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Your order has been placed successfully. You can track it in your profile.</p>
                                <button
                                    onClick={() => {
                                        setShowOrderModal(false)
                                        setOrderSuccess(false)
                                        setOrderStatus(null)
                                    }}
                                    className="mt-8 w-full py-4 bg-yum-primary text-white font-bold rounded-xl hover:bg-red-500 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Order Type */}
                                <div className="mb-6">
                                    <label className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>How would you like your order?</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setOrderDetails({ ...orderDetails, orderType: 'dine_in' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${orderDetails.orderType === 'dine_in'
                                                ? 'bg-yum-primary/10 border-yum-primary text-yum-primary'
                                                : isDarkMode
                                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                                                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <div className="text-2xl mb-1">🍴</div>
                                            <div className="font-bold text-sm">Dine In</div>
                                        </button>
                                        <button
                                            onClick={() => setOrderDetails({ ...orderDetails, orderType: 'take_out' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${orderDetails.orderType === 'take_out'
                                                ? 'bg-yum-primary/10 border-yum-primary text-yum-primary'
                                                : isDarkMode
                                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                                                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <div className="text-2xl mb-1">🥡</div>
                                            <div className="font-bold text-sm">Take Out</div>
                                        </button>
                                    </div>
                                </div>

                                {orderDetails.orderType === 'dine_in' ? (
                                    <div className="mb-6">
                                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Table Number</label>
                                        <input
                                            type="text"
                                            value={orderDetails.tableNumber}
                                            onChange={(e) => setOrderDetails({ ...orderDetails, tableNumber: e.target.value })}
                                            placeholder="Enter table number"
                                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-yum-primary transition-all ${isDarkMode
                                                ? 'bg-white/5 border-white/5 text-white placeholder-gray-500'
                                                : 'bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400'}`}
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Delivery Address</label>
                                        <textarea
                                            value={orderDetails.deliveryAddress}
                                            onChange={(e) => setOrderDetails({ ...orderDetails, deliveryAddress: e.target.value })}
                                            placeholder="Enter delivery address"
                                            rows="3"
                                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-yum-primary resize-none transition-all ${isDarkMode
                                                ? 'bg-white/5 border-white/5 text-white placeholder-gray-500'
                                                : 'bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400'}`}
                                        />
                                    </div>
                                )}

                                {/* Payment Method */}
                                <div className="mb-6">
                                    <label className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setOrderDetails({ ...orderDetails, paymentMethod: 'cash' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${orderDetails.paymentMethod === 'cash'
                                                ? 'bg-green-500/10 border-green-500 text-green-500'
                                                : isDarkMode
                                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                                                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <div className="text-2xl mb-1">💵</div>
                                            <div className="font-bold text-sm">Cash</div>
                                        </button>
                                        <button
                                            onClick={() => setOrderDetails({ ...orderDetails, paymentMethod: 'credit_card' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${orderDetails.paymentMethod === 'credit_card'
                                                ? 'bg-green-500/10 border-green-500 text-green-500'
                                                : isDarkMode
                                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                                                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <div className="text-2xl mb-1">💳</div>
                                            <div className="font-bold text-sm">Credit Card</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className={`mb-6 p-4 rounded-xl border transition-all ${isDarkMode
                                    ? 'bg-white/5 border-white/5'
                                    : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className={isDarkMode ? 'text-gray-400 font-bold' : 'text-gray-500 font-bold'}>Total</span>
                                        <span className="text-2xl font-black text-yum-primary">${calculateTotal()}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowOrderModal(false)}
                                        disabled={submitting}
                                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors disabled:opacity-50 ${isDarkMode
                                            ? 'bg-white/10 text-white hover:bg-white/20'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={submitting}
                                        className="flex-1 py-3 px-4 bg-yum-primary hover:bg-red-500 rounded-xl font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                Submitting...
                                            </>
                                        ) : 'Submit Order'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PublicMenu
