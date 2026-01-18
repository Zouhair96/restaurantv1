import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPencil, HiTrash, HiPlus } from 'react-icons/hi2';
import MenuItemModal from '../components/admin/MenuItemModal';

const ManageMenu = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [menu, setMenu] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, [slug]);

    const fetchMenu = async () => {
        try {
            const response = await fetch(`/.netlify/functions/get-menu-by-slug?slug=${slug}`);
            if (!response.ok) throw new Error('Menu not found');
            const data = await response.json();
            setMenu(data.menu);
            setItems(data.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch('/.netlify/functions/manage-generated-menu-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', itemId }),
            });

            if (!response.ok) throw new Error('Failed to delete item');
            setItems(items.filter(item => item.id !== itemId));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSaveItem = async (formData) => {
        try {
            setIsSaving(true);
            const response = await fetch('/.netlify/functions/manage-generated-menu-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: editingItem ? 'update' : 'add',
                    itemId: editingItem?.id,
                    menuId: menu.id,
                    itemData: formData,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save item');

            if (editingItem) {
                setItems(items.map(item => item.id === editingItem.id ? data.item : item));
            } else {
                setItems([...items, data.item]);
            }

            setIsModalOpen(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Menu Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <HiArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                    Manage: {menu?.menu_name}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Edit menu items, prices, and availability
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/menu/${slug}`)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
                        >
                            View Public Menu
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Add Item Button */}
                <div className="mb-6">
                    <button
                        onClick={handleAddItem}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                        <HiPlus size={20} />
                        Add New Item
                    </button>
                </div>

                {/* Items List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            Menu Items ({items.length})
                        </h2>
                    </div>

                    {items.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">🍽️</div>
                            <p className="text-gray-600 dark:text-gray-400 font-bold">
                                No items yet. Add your first menu item!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {items.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {item.name}
                                                </h3>
                                                {item.badge && (
                                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-tighter rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full ${item.is_available
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {item.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 max-w-2xl">
                                                {item.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                <span className="text-orange-500">S: €{item.price_small}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-orange-500">M: €{item.price_medium}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-orange-500">L: €{item.price_large}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditItem(item)}
                                                className="p-3 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl transition-colors"
                                                title="Edit Item"
                                            >
                                                <HiPencil size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-3 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                                                title="Delete Item"
                                            >
                                                <HiTrash size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                        Digital Menu Management System v1.0
                    </p>
                </div>
            </main>

            {/* Item Modal */}
            <MenuItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                item={editingItem}
            />
        </div>
    );
};

export default ManageMenu;
