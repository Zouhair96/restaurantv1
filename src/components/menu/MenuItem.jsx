import React, { useState } from 'react';
import { HiPlus, HiMinus } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';

const MenuItem = ({ item }) => {
    const [selectedSize, setSelectedSize] = useState('11"');
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addToCart } = useCart();

    const sizes = [
        { label: '8"', price: item.prices.small },
        { label: '11"', price: item.prices.medium },
        { label: '17"', price: item.prices.large },
    ];

    const currentPrice = sizes.find((s) => s.label === selectedSize)?.price || item.prices.medium;

    const handleAddToCart = () => {
        setIsAdding(true);
        addToCart({
            id: item.id,
            name: item.name,
            size: selectedSize,
            price: currentPrice,
            quantity: quantity,
            image: item.image,
        });

        // Reset and show success animation
        setTimeout(() => {
            setIsAdding(false);
            setQuantity(1);
        }, 600);
    };

    const incrementQuantity = () => setQuantity((prev) => prev + 1);
    const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20">
                {item.badge && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        {item.badge}
                    </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        🍕
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Name */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {item.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                    {item.description}
                </p>

                {/* Size Selector */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                        Taille
                    </label>
                    <div className="flex gap-2">
                        {sizes.map((size) => (
                            <button
                                key={size.label}
                                onClick={() => setSelectedSize(size.label)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${selectedSize === size.label
                                        ? 'bg-orange-500 text-white shadow-md scale-105'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {size.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price and Quantity */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-black text-orange-500">
                        {currentPrice.toFixed(2)}€
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={decrementQuantity}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                        >
                            <HiMinus size={16} />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
                            {quantity}
                        </span>
                        <button
                            onClick={incrementQuantity}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                        >
                            <HiPlus size={16} />
                        </button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 ${isAdding
                            ? 'bg-green-500 scale-95'
                            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:scale-105'
                        }`}
                >
                    {isAdding ? '✓ Ajouté!' : 'Ajouter au panier'}
                </button>
            </div>
        </div>
    );
};

export default MenuItem;
