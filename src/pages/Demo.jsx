import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const Demo = () => {
    const { t } = useLanguage()
    const [cart, setCart] = useState([])
    const [activeCategory, setActiveCategory] = useState('Burgers')
    const [isOrderPlaced, setIsOrderPlaced] = useState(false)

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

    const addToCart = (product) => {
        setCart([...cart, product])
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0)

    const handleOrder = () => {
        setIsOrderPlaced(true)
        setTimeout(() => {
            setCart([])
            setIsOrderPlaced(false)
        }, 3000)
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-yum-primary transform -skew-y-6 origin-top-left z-0"></div>

            <div className="relative z-10 w-full max-w-sm bg-white rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden h-[800px] flex flex-col">
                {/* Phone Notch/Header */}
                <div className="bg-white p-6 pb-2 pt-8 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yum-primary rounded-full flex items-center justify-center text-white font-bold text-xs">M</div>
                        <span className="font-bold text-gray-800">Margio Demo</span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                    </div>
                </div>

                {/* Categories */}
                <div className="px-6 py-4 flex gap-4 overflow-x-auto scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap font-bold transition-all ${activeCategory === cat ? 'bg-yum-dark text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products */}
                <div className="flex-1 overflow-y-auto px-6 pb-32">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{activeCategory}</h2>
                    <div className="space-y-6">
                        {products[activeCategory].map(product => (
                            <div key={product.id} className="flex gap-4 items-center group cursor-pointer" onClick={() => addToCart(product)}>
                                <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 flex items-center justify-center relative">
                                    <img src={product.img} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yum-primary rounded-full text-white flex items-center justify-center text-sm shadow-md opacity-0 group-hover:opacity-100 transition-all">+</div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                                        <span className="font-bold text-yum-primary">{product.price}€</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Cart */}
                <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    {isOrderPlaced ? (
                        <div className="bg-green-100 text-green-600 p-4 rounded-2xl text-center font-bold animate-pulse">
                            Commande envoyée en cuisine ! 👨‍🍳
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="text-gray-400 text-sm">Total commande</span>
                                    <div className="text-2xl font-bold text-gray-800">{cartTotal}€</div>
                                </div>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {cart.slice(-3).map((item, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                            <img src={item.img} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    ))}
                                    {cart.length > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                            +{cart.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleOrder}
                                disabled={cart.length === 0}
                                className="w-full bg-yum-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-yum-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Payer maintenant
                            </button>
                        </>
                    )}
                </div>
            </div>

            <Link to="/" className="fixed top-8 left-8 bg-white text-yum-dark w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg hover:scale-110 transition-transform z-50">
                ✕
            </Link>

            <div className="fixed bottom-8 text-gray-400 text-sm">
                Ceci est une simulation interactive
            </div>
        </div>
    )
}

export default Demo
