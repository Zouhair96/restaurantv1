import React, { useState } from 'react'

const TemplateEditorModal = ({ isOpen, onClose, templateType, initialData, onSave, restaurantName }) => {
    if (!isOpen) return null

    const [currentStep, setCurrentStep] = useState(1)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    // Step 1 State: Sizes
    const [sizes, setSizes] = useState(initialData?.config?.sizes || [])
    const [formData, setFormData] = useState({
        size: '',
        price: '',
        image: null
    })
    const [editingId, setEditingId] = useState(null)

    // Step 2 State: Fries Quantity
    const [friesOption, setFriesOption] = useState(initialData?.config?.friesOption || ['moyenne'])

    // Step 3 State: Meals
    const [mealsOption, setMealsOption] = useState(initialData?.config?.mealsOption || [])

    // Step 4 State: Sauces
    const [saucesOption, setSaucesOption] = useState(initialData?.config?.saucesOption || [])

    // Step 5 State: Drinks
    const [drinksOption, setDrinksOption] = useState(initialData?.config?.drinksOption || [])

    // Step 6 State: Extras (Gratinage)
    const [extrasOption, setExtrasOption] = useState(initialData?.config?.extrasOption || [])

    // Step 7 State: Design & Text
    const [designConfig, setDesignConfig] = useState(initialData?.config?.designConfig || {
        mainTitle: 'Tacos Festival',
        subtitle: 'Fresh & Spicy - Limited Time',
        accentColor: '#FF4500', // Orange Red
        fontTheme: 'modern'
    })

    const stepsCount = 8;

    // --- Handlers for Step 1 ---
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setFormData(prev => ({ ...prev, image: url }))
        }
    }

    const handleAddOrUpdate = (e) => {
        e.preventDefault()
        if (!formData.size || !formData.price) return

        // Constraint: Check if size already exists
        const duplicate = sizes.find(s => s.size.toLowerCase() === formData.size.toLowerCase() && s.id !== editingId)
        if (duplicate) {
            alert('This size variant already exists. Please choose a different size name.')
            return
        }

        if (editingId) {
            setSizes(sizes.map(item => item.id === editingId ? { ...formData, id: editingId } : item))
            setEditingId(null)
        } else {
            setSizes([...sizes, { ...formData, id: Date.now() }])
        }
        setFormData({ size: '', price: '', image: null })
    }

    const handleEdit = (item) => {
        setFormData(item)
        setEditingId(item.id)
    }

    const handleDelete = (id) => {
        setSizes(sizes.filter(item => item.id !== id))
    }

    // --- Navigation Handlers ---
    const handleNext = () => {
        if (currentStep < stepsCount) setCurrentStep(prev => prev + 1)
    }

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1)
    }

    const handlePublish = async () => {
        const finalConfig = {
            sizes,
            friesOption,
            mealsOption,
            saucesOption,
            drinksOption,
            extrasOption,
            designConfig
        }


        // Auto-generate name from Restaurant Name or default
        const name = initialData?.name || restaurantName || 'Main Menu'

        try {
            await onSave(name, finalConfig)
            setShowSuccessModal(true)
        } catch (error) {
            alert('Failed to save menu: ' + error.message)
        }
    }

    // --- Renderers ---

    const renderStep1 = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
            {/* Left: Input Form */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-yum-primary uppercase tracking-wider">
                    {editingId ? 'Update Variant' : 'Add New Variant'}
                </h3>

                <form onSubmit={handleAddOrUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Size Name <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-4 gap-3">
                            {['S', 'L', 'XL', 'XXL'].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, size }))}
                                    className={`py-3 rounded-lg font-bold border transition-all ${formData.size === size
                                        ? 'bg-yum-primary text-white border-yum-primary shadow-lg shadow-yum-primary/30'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Price ($) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yum-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Variant Image (Optional)</label>
                        <div className="flex gap-4 items-center">
                            <label className="flex-1 cursor-pointer bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center hover:border-yum-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-yum-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-white">Upload / Gallery</span>
                            </label>

                            {formData.image && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-600 bg-black">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="submit"
                            className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${editingId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-yum-primary hover:bg-red-500'}`}
                        >
                            {editingId ? 'Update Size' : 'Add Size'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null)
                                    setFormData({ size: '', price: '', image: null })
                                }}
                                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Right: List View */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
                    <span>Configured Sizes</span>
                    <span className="text-xs bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-200 dark:border-transparent">{sizes.length} Items</span>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {sizes.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
                            <p>No sizes added yet.</p>
                            <p className="text-xs mt-1">Add items using the form on the left.</p>
                        </div>
                    ) : (
                        sizes.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between group hover:border-gray-300 dark:hover:border-gray-600 border border-gray-200 dark:border-transparent transition-all shadow-sm dark:shadow-none">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-2xl">
                                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : '🌮'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{item.size}</p>
                                        <p className="text-yum-primary font-mono text-sm">${Number(item.price).toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )

    const renderStepFries = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">🍟</span>
                Choose Fries Quantity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'sans', label: 'Sans Frites', icon: '🚫', desc: 'Just the main dish' },
                    { id: 'un_peu', label: 'Un Peu', icon: '🍟', desc: 'Small portion' },
                    { id: 'moyenne', label: 'Moyenne', icon: '🍟🍟', desc: 'Standard side' },
                    { id: 'beaucoup', label: 'Beaucoup', icon: '🍟🍟🍟', desc: 'For the hungry!' },
                    { id: 'inside', label: 'Fries Inside', icon: '🥙', desc: 'Wrapped inside' },
                    { id: 'outside', label: 'Fries Outside', icon: '🍽️', desc: 'Served on side' }
                ].map((option) => {
                    const isSelected = friesOption.includes(option.id)
                    return (
                        <div
                            key={option.id}
                            onClick={() => {
                                setFriesOption(prev => {
                                    if (prev.includes(option.id)) {
                                        return prev.filter(id => id !== option.id)
                                    } else {
                                        return [...prev, option.id]
                                    }
                                })
                            }}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${isSelected
                                ? 'bg-green-100/50 dark:bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20 scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                }`}
                        >
                            <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                            <div className="text-center">
                                <h4 className={`font-bold text-lg ${isSelected ? 'text-green-600 dark:text-green-500' : 'text-gray-700 dark:text-white'}`}>
                                    {option.label}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{option.desc}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderStepMeals = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">🍗</span>
                Choose Meals (Chicken)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'calssique', label: 'Classique', icon: '🍗' },
                    { id: 'tandoori', label: 'Tandoori', icon: '🌶️' },
                    { id: 'curry', label: 'Curry', icon: '🍛' },
                    { id: 'bbq', label: 'BBQ', icon: '🔥' },
                    { id: 'nuggets', label: 'Nuggets', icon: '🥡' },
                    { id: 'crispy', label: 'Crispy', icon: '🥪' },
                    { id: 'filet', label: 'Filet', icon: '🥩' },
                    { id: 'cordon_bleu', label: 'Cordon Bleu', icon: '🧀' },
                    { id: 'fajita', label: 'Fajita', icon: '🌮' },
                    { id: 'minced', label: 'Minced', icon: '🥢' }
                ].map((option) => {
                    const isSelected = mealsOption.includes(option.id)
                    return (
                        <div
                            key={option.id}
                            onClick={() => {
                                setMealsOption(prev => {
                                    if (prev.includes(option.id)) {
                                        return prev.filter(id => id !== option.id)
                                    } else {
                                        return [...prev, option.id]
                                    }
                                })
                            }}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${isSelected
                                ? 'bg-green-100/50 dark:bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20 scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                }`}
                        >
                            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                            <div className="text-center">
                                <h4 className={`font-bold text-lg ${isSelected ? 'text-green-600 dark:text-green-500' : 'text-gray-700 dark:text-white'}`}>
                                    {option.label}
                                </h4>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderStepSauces = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">🌶️</span>
                Choose Sauces
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'ketchup', label: 'Ketchup', icon: '🍅' },
                    { id: 'mayo', label: 'Mayo', icon: '🥛' },
                    { id: 'algerienne', label: 'Algérienne', icon: '🔥' },
                    { id: 'samourai', label: 'Samouraï', icon: '⚔️' },
                    { id: 'blanche', label: 'Blanche', icon: '☁️' },
                    { id: 'biggy', label: 'Biggy', icon: '🍔' },
                    { id: 'andalouse', label: 'Andalouse', icon: '🇪🇸' },
                    { id: 'cheese', label: 'Sauce Cheese', icon: '🧀' }
                ].map((option) => {
                    const isSelected = saucesOption.includes(option.id)
                    return (
                        <div
                            key={option.id}
                            onClick={() => {
                                setSaucesOption(prev => isSelected ? prev.filter(id => id !== option.id) : [...prev, option.id])
                            }}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${isSelected
                                ? 'bg-red-100/50 dark:bg-red-500/10 border-red-500 shadow-lg shadow-red-500/20 scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                }`}
                        >
                            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                            <div className="text-center">
                                <h4 className={`font-bold text-lg ${isSelected ? 'text-red-600 dark:text-red-500' : 'text-gray-700 dark:text-white'}`}>
                                    {option.label}
                                </h4>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderStepDrinks = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">🥤</span>
                Choose Drinks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'coca', label: 'Coca-Cola', icon: '🥤' },
                    { id: 'fanta', label: 'Fanta', icon: '🍊' },
                    { id: 'sprite', label: 'Sprite', icon: '🍋' },
                    { id: 'oasis', label: 'Oasis', icon: '🍎' },
                    { id: 'water', label: 'Eau Minérale', icon: '💧' },
                    { id: 'tea', label: 'Ice Tea', icon: '🍃' },
                    { id: 'tropico', label: 'Tropico', icon: '🏝️' }
                ].map((option) => {
                    const isSelected = drinksOption.includes(option.id)
                    return (
                        <div
                            key={option.id}
                            onClick={() => {
                                setDrinksOption(prev => isSelected ? prev.filter(id => id !== option.id) : [...prev, option.id])
                            }}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${isSelected
                                ? 'bg-blue-100/50 dark:bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                }`}
                        >
                            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                            <div className="text-center">
                                <h4 className={`font-bold text-lg ${isSelected ? 'text-blue-600 dark:text-blue-500' : 'text-gray-700 dark:text-white'}`}>
                                    {option.label}
                                </h4>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderStepExtras = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">✨</span>
                Configure Extras (Gratinage)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'gratinage', label: 'Gratinage', icon: '🧀', desc: 'Baked top' },
                    { id: 'raclette', label: 'Raclette', icon: '🍖', desc: 'Melted cheese' },
                    { id: 'egg', label: 'Oeuf', icon: '🍳', desc: 'Fried egg' },
                    { id: 'bacon', label: 'Bacon Beef', icon: '🥓', desc: 'Smoked beef' },
                    { id: 'double_cheese', label: 'Double Cheese', icon: '🧀🧀', desc: 'Extra creamy' }
                ].map((option) => {
                    const isSelected = extrasOption.includes(option.id)
                    return (
                        <div
                            key={option.id}
                            onClick={() => {
                                setExtrasOption(prev => isSelected ? prev.filter(id => id !== option.id) : [...prev, option.id])
                            }}
                            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${isSelected
                                ? 'bg-purple-100/50 dark:bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20 scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                }`}
                        >
                            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                            <div className="text-center">
                                <h4 className={`font-bold text-lg ${isSelected ? 'text-purple-600 dark:text-purple-500' : 'text-gray-700 dark:text-white'}`}>
                                    {option.label}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{option.desc}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderStepPreview = () => (
        <div className="animate-fade-in max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Configuration Summary */}
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-gray-800 dark:text-white font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Configuration Summary</h3>

                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Template Type</p>
                            <p className="text-gray-800 dark:text-white font-medium capitalize">{templateType || 'Standard Menu'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Total Variants</p>
                            <p className="text-gray-800 dark:text-white font-medium">{sizes.length} Sizes Configured</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Extra Steps</p>
                            <p className="text-gray-800 dark:text-white font-medium">
                                {saucesOption.length > 0 ? '✓ Sauces ' : ''}
                                {drinksOption.length > 0 ? '✓ Drinks ' : ''}
                                {extrasOption.length > 0 ? '✓ Extras' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-500/20">
                    <h4 className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-2">
                        <span>ℹ️</span> Ready to Publish?
                    </h4>
                    <p className="text-blue-600 dark:text-blue-200/70 text-sm">
                        Review your menu card preview on the right. If everything looks good, click the "Publish Menu" button to make it live!
                    </p>
                </div>
            </div>

            {/* Right: Live Preview Card */}
            <div className="w-full lg:w-2/3">
                <div
                    className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-[1.01]"
                    style={{
                        backgroundColor: '#1a1a1a',
                        borderLeft: `8px solid ${designConfig.accentColor}`
                    }}
                >
                    {/* Header Section */}
                    <div className="p-8 relative overflow-hidden" style={{ backgroundColor: `${designConfig.accentColor}15` }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-white pointer-events-none">
                            MENU
                        </div>
                        <div className="relative z-10">
                            <h2
                                className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight"
                                style={{ fontFamily: designConfig.fontTheme === 'handwritten' ? 'cursive' : 'inherit' }}
                            >
                                {designConfig.mainTitle || 'Menu Title'}
                            </h2>
                            <p className="text-lg text-white/80 font-medium">
                                {designConfig.subtitle || 'Subtitle goes here'}
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">

                        {/* Sizes */}
                        <div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-8 h-0.5" style={{ backgroundColor: designConfig.accentColor }}></span>
                                Available Sizes
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {sizes.map(size => (
                                    <div key={size.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🌮</span>
                                            <span className="font-bold text-white text-lg">{size.size}</span>
                                        </div>
                                        <span className="text-xl font-bold" style={{ color: designConfig.accentColor }}>
                                            ${Number(size.price).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fries & Meals Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {friesOption.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-yellow-500"></span>
                                        Fries Options
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {friesOption.map(opt => (
                                            <span key={opt} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm font-medium capitalize">
                                                {opt.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mealsOption.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-green-500"></span>
                                        Chicken Options
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {mealsOption.map(opt => (
                                            <span key={opt} className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-sm font-medium capitalize">
                                                {opt.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sauces, Drinks, Extras Preview */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            {saucesOption.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider w-20">Sauces:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {saucesOption.map(s => (
                                            <span key={s} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px] font-bold border border-red-500/10 capitalize">{s.replace('_', ' ')}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {drinksOption.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider w-20">Drinks:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {drinksOption.map(d => (
                                            <span key={d} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold border border-blue-500/10 capitalize">{d.replace('_', ' ')}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {extrasOption.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider w-20">Extras:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {extrasOption.map(e => (
                                            <span key={e} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px] font-bold border border-purple-500/10 capitalize">{e.replace('_', ' ')}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Text Content */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">A</span>
                        Text Content
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Main Headline</label>
                            <input
                                type="text"
                                value={designConfig.mainTitle}
                                onChange={(e) => setDesignConfig({ ...designConfig, mainTitle: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:border-yum-primary transition-colors font-bold text-lg"
                                placeholder="e.g. Taco Tuesday"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Subtitle / Tagline</label>
                            <input
                                type="text"
                                value={designConfig.subtitle}
                                onChange={(e) => setDesignConfig({ ...designConfig, subtitle: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:border-yum-primary transition-colors"
                                placeholder="e.g. 50% Off All Tacos"
                            />
                        </div>
                    </div>
                </div>

                {/* Visual Style */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">🎨</span>
                        Visual Style
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Accent Color</label>
                            <div className="flex gap-3">
                                {['#FF4500', '#FFD700', '#32CD32', '#00BFFF', '#FF1493'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setDesignConfig({ ...designConfig, accentColor: color })}
                                        className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${designConfig.accentColor === color ? 'border-white scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Font Style</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['modern', 'handwritten', 'bold', 'elegant'].map((font) => (
                                    <button
                                        key={font}
                                        onClick={() => setDesignConfig({ ...designConfig, fontTheme: font })}
                                        className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${designConfig.fontTheme === font
                                            ? 'bg-white dark:bg-white text-black border-gray-300 dark:border-white font-bold'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderContent = () => {
        switch (currentStep) {
            case 1: return renderStep1()
            case 2: return renderStepFries()
            case 3: return renderStepMeals()
            case 4: return renderStepSauces()
            case 5: return renderStepDrinks()
            case 6: return renderStepExtras()
            case 7: return renderStep2()
            case 8: return renderStepPreview()
            default: return renderStep1()
        }
    }

    if (showSuccessModal) {
        const publicUrl = `${window.location.origin}/${restaurantName}`
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="bg-white dark:bg-gray-900 border border-green-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-green-500/20">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Menu Published!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Your menu is now live and accessible to the world.</p>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 break-all">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Public Link</p>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-yum-primary hover:underline text-sm font-mono">
                            {publicUrl}
                        </a>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-bold text-gray-800 dark:text-white transition-colors"
                        >
                            Close
                        </button>
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2"
                        >
                            Open Link 🚀
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#0f1115] w-full max-w-5xl h-[90vh] rounded-3xl border border-white/20 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden transition-colors duration-300">
                {/* Header */}
                <div className="bg-white dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                            Template Editor <span className="text-yum-primary">.</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Step {currentStep}: {
                            currentStep === 1 ? 'Configure Sizes' :
                                currentStep === 2 ? 'Fries Options' :
                                    currentStep === 3 ? 'Meal Options' :
                                        currentStep === 4 ? 'Sauce Options' :
                                            currentStep === 5 ? 'Drink Options' :
                                                currentStep === 6 ? 'Extra Options' :
                                                    currentStep === 7 ? 'Customize Design' : 'Preview'
                        }</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Steps Progress */}
                <div className="bg-gray-50 dark:bg-gray-900/30 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-center items-center gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(step => (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= step ? 'bg-yum-primary text-white shadow-lg shadow-yum-primary/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                                    }`}>
                                    {step}
                                </div>
                                <span className={`text-[10px] font-medium ${currentStep >= step ? 'text-white' : 'text-gray-600'} hidden md:block`}>
                                    {step === 1 ? 'Sizes' : step === 2 ? 'Fries' : step === 3 ? 'Meals' : step === 4 ? 'Sauces' : step === 5 ? 'Drinks' : step === 6 ? 'Extras' : step === 7 ? 'Design' : 'Preview'}
                                </span>
                                {step < 8 && <div className="w-4 lg:w-8 h-0.5 bg-gray-800"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {renderContent()}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`px-6 py-2 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-colors ${currentStep === 1 ? 'opacity-0 cursor-default' : 'opacity-100'
                            }`}
                    >
                        ← Back
                    </button>

                    <button
                        onClick={currentStep === 8 ? handlePublish : handleNext}
                        disabled={currentStep === 1 && sizes.length === 0}
                        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${(currentStep === 1 && sizes.length > 0) || currentStep > 1
                            ? 'bg-gradient-to-r from-yum-primary to-orange-600 text-white shadow-lg hover:shadow-orange-500/30'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {currentStep === 8 ? 'Publish Menu 🚀' : 'Next Step →'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TemplateEditorModal
