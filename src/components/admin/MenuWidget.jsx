import React, { useState } from 'react';
import { HiTrash, HiEye, HiCog6Tooth } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const MenuWidget = ({ menu, onDelete }) => {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(menu.id);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
    };

    const handleShowTemplate = () => {
        navigate(`/menu/${menu.slug}`);
    };

    const handleManageTemplate = () => {
        navigate(`/manage/${menu.slug}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 overflow-hidden">
                {menu.thumbnail_url ? (
                    <img
                        src={menu.thumbnail_url}
                        alt={menu.menu_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl">🍕</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${menu.status === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                        {menu.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Menu Name */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {menu.menu_name}
                </h3>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{menu.items_count || 0} items</span>
                    <span>•</span>
                    <span>{new Date(menu.created_at).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {/* Show Template */}
                    <button
                        onClick={handleShowTemplate}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105"
                        title="View public menu"
                    >
                        <HiEye size={18} />
                        <span className="text-sm">View</span>
                    </button>

                    {/* Manage Template */}
                    <button
                        onClick={handleManageTemplate}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105"
                        title="Manage menu items"
                    >
                        <HiCog6Tooth size={18} />
                        <span className="text-sm">Manage</span>
                    </button>

                    {/* Delete */}
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105"
                        title="Delete menu"
                    >
                        <HiTrash size={18} />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                            Delete Menu?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete "{menu.menu_name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuWidget;
