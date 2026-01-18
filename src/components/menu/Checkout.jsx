import React, { useState } from 'react';
import { HiXMark, HiCheckCircle } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';

const Checkout = ({ isOpen, onClose }) => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        deliveryType: 'delivery',
        paymentMethod: 'cash',
        notes: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Here you would normally send the order to your backend
        console.log('Order submitted:', {
            ...formData,
            items: cartItems,
            total: getCartTotal(),
        });

        setIsSubmitted(true);

        // Clear cart and close after 3 seconds
        setTimeout(() => {
            clearCart();
            setIsSubmitted(false);
            onClose();
            setFormData({
                name: '',
                phone: '',
                address: '',
                deliveryType: 'delivery',
                paymentMethod: 'cash',
                notes: '',
            });
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {isSubmitted ? (
                    // Success Screen
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiCheckCircle className="text-green-500" size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                            Commande confirmée!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Merci pour votre commande!
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Nous préparons vos délicieuses pizzas...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                Finaliser la commande
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <HiXMark size={24} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Vos informations
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Nom complet *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                placeholder="Jean Dupont"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                placeholder="06 12 34 56 78"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Type */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Type de commande
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deliveryType: 'delivery' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.deliveryType === 'delivery'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">🚚</div>
                                            <div className="font-bold text-gray-900 dark:text-white">Livraison</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, deliveryType: 'pickup' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.deliveryType === 'pickup'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">🏪</div>
                                            <div className="font-bold text-gray-900 dark:text-white">À emporter</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Address (only for delivery) */}
                                {formData.deliveryType === 'delivery' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Adresse de livraison *
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                            placeholder="123 Rue de la Pizza, 75001 Paris"
                                        />
                                    </div>
                                )}

                                {/* Payment Method */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Mode de paiement
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'cash'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">💵</div>
                                            <div className="font-bold text-gray-900 dark:text-white">Espèces</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.paymentMethod === 'card'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">💳</div>
                                            <div className="font-bold text-gray-900 dark:text-white">Carte</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Notes (optionnel)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Instructions spéciales..."
                                    />
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                                        Résumé de la commande
                                    </h4>
                                    <div className="space-y-2 mb-3">
                                        {cartItems.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {item.quantity}x {item.name} ({item.size})
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {(item.price * item.quantity).toFixed(2)}€
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-white">Total</span>
                                        <span className="text-2xl font-black text-orange-500">
                                            {getCartTotal().toFixed(2)}€
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    Confirmer la commande
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Checkout;
