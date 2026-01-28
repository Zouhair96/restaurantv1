import React from 'react';
import { HiXMark, HiPlus, HiMinus, HiShoppingCart, HiTrash } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';

const Cart = ({ onCheckout }) => {
    const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();

    return (
        <>
            {/* Cart Overlay */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={toggleCart}
                />
            )}

            {/* Cart Sidebar */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <HiShoppingCart className="text-orange-500" size={24} />
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                            Panier ({getCartCount()})
                        </h2>
                    </div>
                    <button
                        onClick={toggleCart}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <HiXMark size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="text-6xl mb-4">🛒</div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Votre panier est vide
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                Ajoutez des pizzas délicieuses!
                            </p>
                        </div>
                    ) : (
                        cartItems.map((item, index) => (
                            <div
                                key={`${item.id}-${item.size}-${index}`}
                                className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                {/* Image */}
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-3xl">🍕</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Taille: {item.size}
                                    </p>
                                    <p className="text-sm font-bold text-orange-500 mt-1">
                                        {Number(item.price).toFixed(2)}€
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 mt-2">
                                        {item.quantity > 1 && (
                                            <button
                                                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                <HiMinus size={14} />
                                            </button>
                                        )}
                                        <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <HiPlus size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromCart(item.id, item.size)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors flex-shrink-0"
                                >
                                    <HiTrash size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                        {/* Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                Total
                            </span>
                            <span className="text-2xl font-black text-orange-500">
                                {Number(getCartTotal()).toFixed(2)}€
                            </span>
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={onCheckout}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            Commander maintenant
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
