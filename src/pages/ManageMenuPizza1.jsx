import React, { useState, useRef, useEffect } from 'react';
import { HiPencil, HiTrash, HiXMark, HiCloudArrowUp, HiPhoto, HiPlus, HiArrowRightOnRectangle } from 'react-icons/hi2';

const ManageMenuPizza1 = () => {
    // Initial State mimicking DB
    const [items, setItems] = useState([
        { id: 1, name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois', price: 11.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
        { id: 2, name: 'Calzone', description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf', price: 11.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
        { id: 3, name: 'Pêcheur', description: 'Sauce tomate, fromage, thon, saumon, olives, oignon', price: 12.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
        { id: 4, name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', price: 12.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
        { id: 5, name: 'Mexicaine', description: 'Sauce tomate, fromage, bœuf haché, poivron, olives, oignon', price: 14.90, category: 'Classic', categoryColor: 'bg-blue-100 text-blue-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
        { id: 6, name: 'Chèvre', description: 'Crème fraîche, fromage, chèvre, olives, oignon', price: 13.90, category: 'Premium', categoryColor: 'bg-purple-100 text-purple-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
        { id: 7, name: 'Chicken', description: 'Crème fraîche, fromage, poulet fumé, champignons', price: 13.90, category: 'Premium', categoryColor: 'bg-purple-100 text-purple-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
        { id: 8, name: 'Bolognaise', description: 'Sauce chili BBQ, fromage, sauce bolognaise, pepperoni', price: 17.90, category: 'Special', categoryColor: 'bg-orange-100 text-orange-800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000' },
    ]);

    // Load from local storage on mount
    useEffect(() => {
        const storedManagerItems = localStorage.getItem('pizza_time_manager_items');
        if (storedManagerItems) {
            try {
                const parsedItems = JSON.parse(storedManagerItems);
                if (Array.isArray(parsedItems)) {
                    // Filter out nulls or invalid items to prevent crashes
                    const validItems = parsedItems.filter(item => item && item.id);
                    setItems(validItems);
                }
            } catch (error) {
                console.error('Failed to parse manager items:', error);
            }
        }
    }, []);

    // Save to local storage whenever items change
    useEffect(() => {
        localStorage.setItem('pizza_time_manager_items', JSON.stringify(items));
    }, [items]);

    const [categories, setCategories] = useState(['Classic', 'Premium', 'Special', 'Drinks', 'Desserts']);
    const [newCategory, setNewCategory] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditClick = (item) => {
        setEditingItem({ ...item });
        setIsEditModalOpen(true);
    };

    const handleAddItem = () => {
        setEditingItem({ id: null, name: '', description: '', price: 0, category: categories[0], image: '' });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        let updatedItems;
        if (editingItem.id) {
            // Update existing
            updatedItems = items.map(i => i.id === editingItem.id ? editingItem : i);

            // Sync with Public Menu if it exists there
            const publicMenuData = localStorage.getItem('pizza_time_menu_items');
            if (publicMenuData) {
                let publicMenu = JSON.parse(publicMenuData);
                const publicIndex = publicMenu.findIndex(i => i.id === editingItem.id || i.name === editingItem.name);
                if (publicIndex >= 0) {
                    publicMenu[publicIndex] = editingItem;
                    localStorage.setItem('pizza_time_menu_items', JSON.stringify(publicMenu));
                }
            }
        } else {
            // Create new
            const newId = Math.max(...items.map(i => i.id), 0) + 1;
            updatedItems = [...items, { ...editingItem, id: newId }];
        }
        setItems(updatedItems);
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const itemToDelete = items.find(i => i.id === id);
            setItems(items.filter(i => i.id !== id));

            // Sync Delete with Public Menu
            if (itemToDelete) {
                const publicMenuData = localStorage.getItem('pizza_time_menu_items');
                if (publicMenuData) {
                    let publicMenu = JSON.parse(publicMenuData);
                    const newPublicMenu = publicMenu.filter(i => i.id !== id && i.name !== itemToDelete.name);
                    localStorage.setItem('pizza_time_menu_items', JSON.stringify(newPublicMenu));
                }
            }
        }
    };



    const handleAddToMenu = (item) => {
        // Read existing public menu
        const existingData = localStorage.getItem('pizza_time_menu_items');
        let publicMenu = existingData ? JSON.parse(existingData) : [];

        // Check if item exists (by name/id) and update or append
        const index = publicMenu.findIndex(i => i.name === item.name); // Using name as unique key for now or generate distinct ID logic
        if (index >= 0) {
            publicMenu[index] = item; // Update
        } else {
            publicMenu.push(item); // Add
        }

        // Save back
        localStorage.setItem('pizza_time_menu_items', JSON.stringify(publicMenu));
        alert(`"${item.name}" added to Public Menu!`);
    };

    // Swipe Logic
    const [swipedItemId, setSwipedItemId] = useState(null);
    const touchStart = useRef(null);
    const touchEnd = useRef(null);

    const handleTouchStart = (e) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = (id) => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            setSwipedItemId(id);
        }
        if (isRightSwipe && swipedItemId === id) {
            setSwipedItemId(null);
        }
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            setEditingItem({ ...editingItem, image: imageUrl });
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            setEditingItem({ ...editingItem, image: imageUrl });
        }
    };

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleCategoryChange = (id, newCategory) => {
        setItems(items.map(i => i.id === id ? { ...i, category: newCategory } : i));
    };

    const handlePriceChange = (id, newPrice) => {
        setItems(items.map(i => i.id === id ? { ...i, price: parseFloat(newPrice) || 0 } : i));
    };

    const handleSave = () => {
        alert('Changes saved! (Mock Action)');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Menu Management</h1>
                    <p className="text-gray-500 text-sm md:text-base">Manage your restaurant's menu items. Update descriptions, categories, and adjust unit prices.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="New category..."
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-0"
                        />
                        <button
                            onClick={handleAddCategory}
                            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all"
                        >
                            Add
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleAddItem}
                        className="flex-1 md:flex-none px-6 py-3 bg-yum-primary text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-red-500 whitespace-nowrap"
                    >
                        <HiPlus className="w-5 h-5" /> Add Item
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 md:flex-none px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all whitespace-nowrap"
                    >
                        Save
                    </button>
                </div>
            </header>



            {/* Mobile Card View (Visible on small screens) */}
            {/* Mobile Card View (Visible on small screens) */}
            <div className="flex flex-col gap-4 md:hidden overflow-hidden">
                <p className="text-xs text-center text-gray-400 mb-2">Tip: Swipe item left to edit, duplicate or delete</p>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="relative h-28 w-full rounded-2xl overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => handleTouchEnd(item.id)}
                    >
                        {/* Actions Background Layer */}
                        <div className="absolute inset-0 flex justify-end">
                            <button onClick={() => handleAddToMenu(item)} className="h-full w-20 bg-green-500 text-white flex items-center justify-center" title="Add to Public Menu">
                                <HiArrowRightOnRectangle size={24} />
                            </button>
                            <button onClick={() => handleEditClick(item)} className="h-full w-20 bg-blue-500 text-white flex items-center justify-center">
                                <HiPencil size={24} />
                            </button>
                            <button onClick={() => handleDeleteClick(item.id)} className="h-full w-20 bg-red-500 text-white flex items-center justify-center">
                                <HiTrash size={24} />
                            </button>
                        </div>

                        {/* Foreground Content Layer */}
                        <div
                            className={`absolute inset-0 bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 flex gap-4 items-center transition-transform duration-300 ease-out ${swipedItemId === item.id ? '-translate-x-60' : 'translate-x-0'}`}
                            onClick={() => swipedItemId === item.id && setSwipedItemId(null)} // Click to close swipe
                        >
                            {/* Image */}
                            <div className="shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden relative group">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <HiPhoto className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-black text-gray-900 dark:text-white truncate">{item.name}</h3>
                                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">€{item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1 truncate">{item.category}</p>
                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            </div>

                            {/* Chevon/Hint */}
                            {swipedItemId !== item.id && (
                                <div className="h-8 w-1 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View (Hidden on small screens) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest">Item Name</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest">Category</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest">Description</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest w-32">Unit Price (€)</th>
                            <th className="p-6 text-sm font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                <td className="p-6 font-bold text-gray-900 dark:text-white">{item.name}</td>
                                <td className="p-6">
                                    <select
                                        value={item.category}
                                        onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-6 text-sm text-gray-500 max-w-md truncate" title={item.description}>
                                    {item.description}
                                </td>
                                <td className="p-6">
                                    <div className="relative w-32">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-bold">€</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-gray-100 hover:border-gray-300 focus:border-blue-500 dark:border-gray-700 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-700/50 font-mono font-bold text-gray-900 dark:text-white transition-all outline-none"
                                        />
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleAddToMenu(item)}
                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Add to Public Menu"
                                        >
                                            <HiArrowRightOnRectangle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Details"
                                        >
                                            <HiPencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Item"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Edit Item Details</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {!editingItem.id && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <select
                                            value={editingItem.category}
                                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Initial Price (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Item Photo</label>
                                    <div
                                        className="relative w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer overflow-hidden group"
                                        onDrop={handleImageDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={() => document.getElementById('photo-upload').click()}
                                    >
                                        {editingItem.image ? (
                                            <>
                                                <img src={editingItem.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                                                <div className="z-10 flex flex-col items-center">
                                                    <HiCloudArrowUp className="w-8 h-8 mb-2 text-blue-500" />
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Click or Drop to Replace</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <HiCloudArrowUp className="w-8 h-8 mb-2" />
                                                <span className="text-sm font-medium">Click to upload or drag & drop</span>
                                                <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <textarea
                                        rows="4"
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ManageMenuPizza1;
