import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const Demo = () => {
    const { t } = useLanguage()
    const [currentStep, setCurrentStep] = useState(1)
    const [isOrderPlaced, setIsOrderPlaced] = useState(false)
    const [selections, setSelections] = useState({
        burger: null,
        salad: null,
        boisson: null
    })

    const categories = ['Burgers', 'Salades', 'Boissons']

    const products = {
        'Burgers': [
            { id: 1, name: "Le Classic", price: 12, img: "/assets/yumyum_burger.png", desc: "Bœuf, cheddar, salade, tomate, sauce maison" },
            { id: 2, name: "Le Smash", price: 14, img: "/assets/yumyum_burger.png", desc: "Double steak smashé, oignons caramélisés, pickles" },
            { id: 3, name: "Le Chicken", price: 13, img: "/assets/yumyum_burger.png", desc: "Poulet pané, avocat, mayonnaise épicée" },
        ],
        'Salades': [
            { id: 4, name: "Cesar Palace", price: 11, img: "/assets/yumyum_salad.png", desc: "Romaine, poulet, parmesan, croûtons" },
            { id: 5, name: "La Green", price: 12, img: "/assets/yumyum_salad.png", desc: "Quinoa, avocat, edamame, concombre" }
        ],
        'Boissons': [
            { id: 6, name: "Cola", price: 3, img: "/assets/yumyum_coke.png", desc: "33cl" },
            { id: 7, name: "Limonade Maison", price: 4, img: "/assets/yumyum_coke.png", desc: "Citron, menthe, gingembre" }
        ]
    }

    const nextStep = () => setCurrentStep(prev => prev + 1)
    const prevStep = () => setCurrentStep(prev => prev - 1)

    const selectItem = (category, product) => {
        setSelections(prev => ({ ...prev, [category]: product }))
        nextStep()
    }

    const cartTotal = Object.values(selections).reduce((sum, item) => sum + (item?.price || 0), 0)

    const handleOrder = () => {
        setIsOrderPlaced(true)
        setTimeout(() => {
            setSelections({ burger: null, salad: null, boisson: null })
            setCurrentStep(1)
            setIsOrderPlaced(false)
        }, 3000)
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Étape 1: Choisissez votre Burger</h2>
                        <div className="space-y-6">
                            {products['Burgers'].map(product => (
                                <div key={product.id} className="flex gap-4 items-center group cursor-pointer p-4 rounded-2xl bg-gray-50 hover:bg-yum-primary/5 transition-colors" onClick={() => selectItem('burger', product)}>
                                    <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center relative">
                                        <img src={product.img} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800">{product.name}</h3>
                                            <span className="font-bold text-yum-primary">{product.price}€</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">{product.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Étape 2: Une petite salade ?</h2>
                        <div className="space-y-6">
                            {products['Salades'].map(product => (
                                <div key={product.id} className="flex gap-4 items-center group cursor-pointer p-4 rounded-2xl bg-gray-50 hover:bg-yum-primary/5 transition-colors" onClick={() => selectItem('salad', product)}>
                                    <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center relative">
                                        <img src={product.img} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800">{product.name}</h3>
                                            <span className="font-bold text-yum-primary">{product.price}€</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">{product.desc}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={nextStep} className="w-full py-4 bg-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-300">Non merci, suivant</button>
                        </div>
                        <button onClick={prevStep} className="mt-8 text-gray-400 font-bold underline">Retour</button>
                    </div>
                )
            case 3:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Étape 3: Pour accompagner ça ?</h2>
                        <div className="space-y-6">
                            {products['Boissons'].map(product => (
                                <div key={product.id} className="flex gap-4 items-center group cursor-pointer p-4 rounded-2xl bg-gray-50 hover:bg-yum-primary/5 transition-colors" onClick={() => selectItem('boisson', product)}>
                                    <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center relative">
                                        <img src={product.img} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800">{product.name}</h3>
                                            <span className="font-bold text-yum-primary">{product.price}€</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">{product.desc}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={nextStep} className="w-full py-4 bg-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-300">Non merci, suivant</button>
                        </div>
                        <button onClick={prevStep} className="mt-8 text-gray-400 font-bold underline">Retour</button>
                    </div>
                )
            case 4:
                return (
                    <div className="animate-fade-in h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Récapitulatif de votre commande</h2>
                            <div className="space-y-4">
                                {Object.entries(selections).map(([key, item]) => item && (
                                    <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <img src={item.img} className="w-10 h-10 object-contain" />
                                            <span className="font-bold text-gray-800">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-yum-primary">{item.price}€</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="text-gray-400 text-sm">Total à payer</span>
                                    <div className="text-3xl font-black text-gray-900">{cartTotal}€</div>
                                </div>
                                <button onClick={() => setCurrentStep(1)} className="text-yum-primary font-bold underline">Modifier</button>
                            </div>
                            <button
                                onClick={handleOrder}
                                className="w-full bg-yum-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-yum-primary/30 active:scale-95 transition-all"
                            >
                                Payer maintenant
                            </button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-yum-primary transform -skew-y-6 origin-top-left z-0"></div>

            <div className="relative z-10 w-full max-w-sm bg-white rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden h-[800px] flex flex-col">
                {/* Phone Notch/Header */}
                <div className="bg-white p-6 pb-2 pt-8 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yum-primary rounded-full flex items-center justify-center text-white font-bold text-xs">Y</div>
                        <span className="font-bold text-gray-800">YumYum Demo</span>
                    </div>
                    <div className="text-xs font-bold text-gray-400">
                        {currentStep < 4 ? `Step ${currentStep}/3` : 'Review'}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100 flex">
                    <div
                        className="h-full bg-yum-primary transition-all duration-500"
                        style={{ width: `${(Math.min(currentStep, 3) / 3) * 100}%` }}
                    ></div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
                    {isOrderPlaced ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 animate-bounce">👨‍🍳</div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">C'est parti !</h2>
                            <p className="text-gray-400">Votre commande est en préparation.</p>
                        </div>
                    ) : renderStep()}
                </div>
            </div>

            <div className="fixed bottom-8 text-gray-400 text-sm">
                Ceci est une simulation interactive
            </div>
        </div>
    )
}

export default Demo
