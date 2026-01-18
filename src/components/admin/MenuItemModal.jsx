import React, { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

const MenuItemModal = ({ isOpen, onClose, onSave, item = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'classic',
        price_small: '',
        price_medium: '',
        price_large: '',
        badge: '',
        is_available: true,
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                category: item.category || 'classic',
                price_small: item.price_small || '',
                price_medium: item.price_medium || '',
                price_large: item.price_large || '',
                badge: item.badge || '',
                is_available: item.is_available ?? true,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                category: 'classic',
                price_small: '',
                price_medium: '',
                price_large: '',
                badge: '',
                is_available: true,
            });
        }
    }, [item, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                        {item ? 'Edit Menu Item' : 'Add New Item'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <HiXMark size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows="2"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="classic">Classic</option>
                                <option value="premium">Premium</option>
                                <option value="special">Special</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Badge</label>
                            <input
                                type="text"
                                name="badge"
                                placeholder="e.g. Populaire"
                                value={formData.badge}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Price S (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price_small"
                                required
                                value={formData.price_small}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Price M (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price_medium"
                                required
                                value={formData.price_medium}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Price L (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price_large"
                                required
                                value={formData.price_large}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            name="is_available"
                            id="is_available"
                            checked={formData.is_available}
                            onChange={handleChange}
                            className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                        />
                        <label htmlFor="is_available" className="text-sm font-bold text-gray-700 dark:text-gray-300">Available</label>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            {item ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuItemModal;
