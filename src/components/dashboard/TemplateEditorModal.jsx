import React, { useState } from 'react'

const TemplateEditorModal = ({ isOpen, onClose, templateType }) => {
    if (!isOpen) return null

    const [currentStep, setCurrentStep] = useState(1)

    // Step 1 State: Sizes
    const [sizes, setSizes] = useState([])
    const [formData, setFormData] = useState({
        size: '',
        price: '',
        image: null
    })
    const [editingId, setEditingId] = useState(null)

    // Step 2 State: Fries Quantity
    const [friesOption, setFriesOption] = useState('moyenne')

    // Step 3 State: Design & Text
    const [designConfig, setDesignConfig] = useState({
        mainTitle: 'Tacos Festival',
        subtitle: 'Fresh & Spicy - Limited Time',
        accentColor: '#FF4500', // Orange Red
        fontTheme: 'modern'
    })

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
        if (currentStep < 4) setCurrentStep(prev => prev + 1)
    }

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1)
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
                        <input
                            type="text"
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            placeholder="e.g. Small, Grande, Family Pack"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yum-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Price ($) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yum-primary focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Variant Image (Optional)</label>
                        <div className="flex gap-4 items-center">
                            <label className="flex-1 cursor-pointer bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center hover:border-yum-primary hover:bg-gray-800/50 transition-all group">
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                <svg className="w-6 h-6 text-gray-500 group-hover:text-yum-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-gray-500 group-hover:text-white">Upload / Gallery</span>
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
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 flex flex-col h-full">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>Configured Sizes</span>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{sizes.length} Items</span>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {sizes.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-lg">
                            <p>No sizes added yet.</p>
                            <p className="text-xs mt-1">Add items using the form on the left.</p>
                        </div>
                    ) : (
                        sizes.map((item) => (
                            <div key={item.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between group hover:border-gray-600 border border-transparent transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center overflow-hidden text-2xl">
                                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : '🌮'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{item.size}</p>
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
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-yellow-500/20 text-yellow-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">🍟</span>
                Choose Fries Quantity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 'sans', label: 'Sans Frites', icon: '🚫', desc: 'Just the main dish' },
                    { id: 'un_peu', label: 'Un Peu', icon: '🍟', desc: 'Small portion' },
                    { id: 'moyenne', label: 'Moyenne', icon: '🍟🍟', desc: 'Standard side' },
                    { id: 'beaucoup', label: 'Beaucoup', icon: '🍟🍟🍟', desc: 'For the hungry!' }
                ].map((option) => (
                    <div
                        key={option.id}
                        onClick={() => setFriesOption(option.id)}
                        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${friesOption === option.id
                            ? 'bg-yum-primary/10 border-yum-primary shadow-lg shadow-yum-primary/20 scale-105'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
                            }`}
                    >
                        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{option.icon}</div>
                        <div className="text-center">
                            <h4 className={`font-bold text-lg ${friesOption === option.id ? 'text-yum-primary' : 'text-white'}`}>
                                {option.label}
                            </h4>
                            <p className="text-gray-400 text-sm mt-1">{option.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-2 ${friesOption === option.id ? 'border-yum-primary bg-yum-primary' : 'border-gray-600'
                            }`}>
                            {friesOption === option.id && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Text Content */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">A</span>
                        Text Content
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-1">Main Headline</label>
                            <input
                                type="text"
                                value={designConfig.mainTitle}
                                onChange={(e) => setDesignConfig({ ...designConfig, mainTitle: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yum-primary transition-colors font-bold text-lg"
                                placeholder="e.g. Taco Tuesday"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-1">Subtitle / Tagline</label>
                            <input
                                type="text"
                                value={designConfig.subtitle}
                                onChange={(e) => setDesignConfig({ ...designConfig, subtitle: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yum-primary transition-colors"
                                placeholder="e.g. 50% Off All Tacos"
                            />
                        </div>
                    </div>
                </div>

                {/* Visual Style */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">🎨</span>
                        Visual Style
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">Accent Color</label>
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
                            <label className="block text-gray-400 text-sm font-medium mb-2">Font Style</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['modern', 'handwritten', 'bold', 'elegant'].map((font) => (
                                    <button
                                        key={font}
                                        onClick={() => setDesignConfig({ ...designConfig, fontTheme: font })}
                                        className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${designConfig.fontTheme === font
                                            ? 'bg-white text-black border-white font-bold'
                                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
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
            case 3: return renderStep2()
            case 4: return <div className="text-white text-center py-20 text-xl font-medium">Final Preview & Publish <br /><span className="text-sm text-gray-400">Coming Soon</span></div>
            default: return renderStep1()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f1115] w-full max-w-5xl h-[90vh] rounded-3xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900/50 p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Template Editor <span className="text-yum-primary">.</span>
                        </h2>
                        <p className="text-gray-400 text-sm">Step {currentStep}: {
                            currentStep === 1 ? 'Configure Sizes' :
                                currentStep === 2 ? 'Fries Options' :
                                    currentStep === 3 ? 'Customize Design' : 'Preview'
                        }</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Steps Progress */}
                <div className="bg-gray-900/30 py-3 border-b border-gray-800">
                    <div className="flex justify-center items-center gap-4">
                        {[1, 2, 3, 4].map(step => (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= step ? 'bg-yum-primary text-white shadow-lg shadow-yum-primary/30' : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    {step}
                                </div>
                                <span className={`text-sm font-medium ${currentStep >= step ? 'text-white' : 'text-gray-600'} hidden sm:block`}>
                                    {step === 1 ? 'Sizes' : step === 2 ? 'Fries' : step === 3 ? 'Design' : 'Preview'}
                                </span>
                                {step < 4 && <div className="w-8 md:w-12 h-0.5 bg-gray-800"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {renderContent()}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`px-6 py-2 rounded-xl font-bold text-gray-400 hover:text-white transition-colors ${currentStep === 1 ? 'opacity-0 cursor-default' : 'opacity-100'
                            }`}
                    >
                        ← Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentStep === 1 && sizes.length === 0}
                        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${(currentStep === 1 && sizes.length > 0) || currentStep > 1
                            ? 'bg-gradient-to-r from-yum-primary to-orange-600 text-white shadow-lg hover:shadow-orange-500/30'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {currentStep === 4 ? 'Publish Menu 🚀' : 'Next Step →'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TemplateEditorModal
