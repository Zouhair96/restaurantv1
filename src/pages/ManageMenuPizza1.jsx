import React, { useState, useRef, useEffect } from 'react';
import { HiPencil, HiTrash, HiXMark, HiCloudArrowUp, HiPhoto, HiPlus, HiCog6Tooth, HiArrowLeft, HiRocketLaunch, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManageMenuPizza1 = ({ isAdminView = false }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { templateKey: urlTemplateKey } = useParams();
    const templateKey = urlTemplateKey || 'pizza1';

    const [items, setItems] = useState([]);
    const [template, setTemplate] = useState(null);
    const [menuConfig, setMenuConfig] = useState({
        restaurantName: '',
        themeColor: '#f97316',
        logoImage: null,
        useLogo: false,
        showWelcomePromo: true,
        welcomePromoText: "Bienvenue sur notre plateforme ! Profitez d’une réduction de 10% sur votre première commande, et pour nos clients fidèles, recevez un repas gratuit après chaque dix commandes !",
        loadingDuration: 5,
        promoDuration: 15
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        loadData();
    }, [isAdminView, templateKey]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (isAdminView) {
                // Admin View: Fetch Base Template and its Items
                const response = await fetch(`/.netlify/functions/templates?templateKey=${templateKey}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data && !data.error) {
                    setTemplate(data);
                    setItems(Array.isArray(data.items) ? data.items : []);
                    setMenuConfig(prev => ({ ...prev, ...data.config, restaurantName: 'Template Base' }));
                }
            } else {
                // Restaurant View: Fetch Merged Items (Base + Overrides)
                const response = await fetch(`/.netlify/functions/menu-overrides?templateKey=${templateKey}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data && !data.error) {
                    setTemplate(data.template);
                    setItems(Array.isArray(data.items) ? data.items : []);
                    setMenuConfig(prev => ({
                        ...prev,
                        ...data.template?.config,
                        ...data.template?.restaurant_config,
                        restaurantName: data.template?.restaurant_config?.restaurantName || data.template?.config?.restaurantName || currentUser?.restaurant_name
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveItem = async () => {
        setIsSaving(true);
        try {
            if (isAdminView) {
                // Admin: Update Base Item
                const method = editingItem.id ? 'PATCH' : 'POST';
                const payload = { ...editingItem };
                if (!editingItem.id) payload.template_id = template.id;

                const response = await fetch('/.netlify/functions/template-items', {
                    method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                if (response.ok) await loadData();
            } else {
                // Restaurant: Update Override or Custom Item
                const payload = {
                    restaurant_template_id: template.restaurant_template_id,
                    template_item_id: editingItem.is_custom ? null : (editingItem.template_item_id || editingItem.id),
                    name_override: editingItem.name,
                    description_override: editingItem.description,
                    price_override: editingItem.price,
                    image_override: editingItem.image_url,
                    category_override: editingItem.category,
                    is_hidden: editingItem.is_hidden
                };

                // If editing a custom item that already exists, use its override ID
                if (editingItem.is_custom && editingItem.id) {
                    payload.id = editingItem.id; // Backend needs special handling for update vs insert custom
                }

                const response = await fetch('/.netlify/functions/menu-overrides', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                if (response.ok) await loadData();
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to save item:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!isAdminView) return; // Only admin can delete base items
        if (!window.confirm('Delete this base item? This will affect ALL restaurants.')) return;

        try {
            await fetch('/.netlify/functions/template-items', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            await loadData();
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const toggleVisibility = async (item) => {
        if (isAdminView) return;
        setIsSaving(true);
        try {
            const payload = {
                template_item_id: item.id,
                is_hidden: !item.is_hidden
            };
            await fetch('/.netlify/functions/menu-overrides', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            await loadData();
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // UI Helpers
    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600;
                    const scale = MAX_WIDTH / img.width;
                    const width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
                    const height = img.width > MAX_WIDTH ? img.height * scale : img.height;
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            if (isAdminView) {
                // Admin: Save to Template Config
                const response = await fetch('/.netlify/functions/templates', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: template.id,
                        config: menuConfig
                    })
                });
                if (response.ok) alert('Master Template Settings saved!');
            } else {
                // Restaurant: Save to Menu Config
                const menuId = template?.restaurant_menu_id;
                if (menuId) {
                    const response = await fetch('/.netlify/functions/menus', {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: menuId,
                            name: menuConfig.restaurantName,
                            config: menuConfig
                        })
                    });
                    if (response.ok) alert('Your Menu Settings saved!');
                } else {
                    // Fallback create if missing (though it shouldn't be)
                    const res = await fetch('/.netlify/functions/menus', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: menuConfig.restaurantName,
                            templateType: templateKey,
                            config: menuConfig
                        })
                    });
                    if (res.ok) alert('Menu Settings created!');
                }
            }
            setIsSettingsModalOpen(false);
            await loadData();
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Error saving settings. Check console.');
        } finally {
            setIsSaving(false);
        }
    };

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate(isAdminView ? '/admin' : '/dashboard/menu')}
                        className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-4 font-black transition-all uppercase text-[10px] tracking-widest group"
                    >
                        <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-3xl border border-indigo-500/20 shadow-inner">
                            {template?.icon || '🍕'}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                                {isAdminView ? `Master Blueprint: ${template?.name}` : 'Menu Personalization'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest">
                                    {isAdminView ? 'Admin Mode' : 'Restaurant Mode'}
                                </span>
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                    {templateKey} template
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isAdminView ? (
                        <a
                            href={`/menu/${templateKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                            <HiEye className="w-6 h-6" />
                            <span className="hidden lg:inline text-xs uppercase tracking-widest">Master Preview</span>
                        </a>
                    ) : (
                        <a
                            href={`/${currentUser?.restaurant_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                            title="View Public Menu"
                        >
                            <HiEye className="w-6 h-6" />
                            <span className="hidden lg:inline text-xs uppercase tracking-widest">View Live Menu</span>
                        </a>
                    )}
                    <button
                        onClick={() => {
                            setEditingItem({ name: '', description: '', price: 0, category: 'Classic', image_url: '', is_hidden: false, is_custom: true });
                            setIsEditModalOpen(true);
                        }}
                        style={{ backgroundColor: menuConfig.themeColor }}
                        className="flex-1 md:flex-none px-6 py-4 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                        <HiPlus className="w-5 h-5" />
                        {isAdminView ? 'Add Master Item' : 'Add Custom Item'}
                    </button>
                    <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="p-4 bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white font-black rounded-2xl border-2 border-indigo-200 shadow-md hover:border-indigo-500 hover:bg-white transition-all active:rotate-45"
                        title="Display Settings"
                    >
                        <HiCog6Tooth className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-6 pr-12 py-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={selectedCategory === cat ? { backgroundColor: menuConfig.themeColor, color: '#fff', boxShadow: `0 10px 15px -3px ${menuConfig.themeColor}40` } : {}}
                            className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat
                                ? 'border-transparent'
                                : 'bg-white dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10 hover:border-gray-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`group relative bg-white dark:bg-[#1a1c23] rounded-[2rem] border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${item.is_hidden ? 'opacity-40 grayscale' : ''}`}
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-300">
                                        <HiPhoto className="w-16 h-16 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                                        {item.category}
                                    </span>
                                    {!isAdminView && item.has_override && (
                                        <span className="bg-green-500/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            Customized
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-4 right-4 bg-indigo-600 text-white font-black px-4 py-1.5 rounded-xl shadow-lg border border-white/20 text-sm">
                                    €{parseFloat(item.price).toFixed(2)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-gray-400 text-xs font-medium italic line-clamp-2 min-h-[2.5rem]">
                                    {item.description}
                                </p>

                                {/* Action Buttons */}
                                <div className="mt-6 flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditingItem({ ...item }); setIsEditModalOpen(true); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-white/5 hover:bg-indigo-600 hover:text-white text-gray-600 dark:text-gray-300 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        <HiPencil className="w-4 h-4" /> {isAdminView ? 'Edit Master' : 'Edit Item'}
                                    </button>

                                    {!isAdminView ? (
                                        <button
                                            onClick={() => toggleVisibility(item)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${item.is_hidden
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                                : 'bg-white dark:bg-white/5 text-gray-400 border border-gray-100 dark:border-white/10 hover:text-red-500'
                                                }`}
                                            title={item.is_hidden ? "Add to Menu" : "Hide from Menu"}
                                        >
                                            {item.is_hidden ? <><HiPlus className="w-4 h-4" /> Add</> : <><HiEyeSlash className="w-4 h-4" /> Hide</>}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-3 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                            title="Delete Master Item"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Status Overlay */}
                            {item.is_hidden && (
                                <div className="absolute inset-0 bg-red-900/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                                    <span className="rotate-12 border-2 border-red-500 text-red-500 px-6 py-2 rounded-xl text-xl font-black uppercase opacity-60 tracking-widest">
                                        Hidden
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white/30 dark:bg-white/5 border-4 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] text-center">
                        <div className="text-7xl mb-6 grayscale opacity-20">🍕</div>
                        <h3 className="text-2xl font-black text-gray-300 dark:text-gray-600 uppercase tracking-tight">No Items Matching Search</h3>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white dark:border-white/10">
                        <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {isAdminView ? 'Edit Master Item' : 'Override Item'}
                                </h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    {isAdminView ? 'Global Definition' : 'Personal Customization'}
                                </p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="e.g. Master Margherita"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className={`w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${!isAdminView ? 'opacity-70' : ''}`}
                                    >
                                        <option value="Classic">Classic</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Desserts">Desserts</option>
                                        <option value="Drinks">Drinks</option>
                                        <option value="Starters">Starters</option>
                                        <option value="Special">Special</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Photo</label>
                                <div
                                    className="relative w-full h-40 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer overflow-hidden group"
                                    onClick={() => document.getElementById('photo-upload').click()}
                                >
                                    {editingItem.image_url ? (
                                        <img src={editingItem.image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                    ) : (
                                        <HiCloudArrowUp className="w-10 h-10 mb-2 opacity-30" />
                                    )}
                                    <span className="text-xs font-black uppercase tracking-widest relative z-10 text-gray-500">Update Photo</span>
                                    <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const compressed = await compressImage(file);
                                            setEditingItem({ ...editingItem, image_url: compressed });
                                        }
                                    }} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    rows="3"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-medium italic focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Enter item description..."
                                />
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-6 py-4 bg-white dark:bg-white/10 text-gray-500 dark:text-white font-black rounded-2xl border border-gray-100 dark:border-white/10 uppercase tracking-widest text-xs">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveItem}
                                disabled={isSaving}
                                style={{ backgroundColor: menuConfig.themeColor }}
                                className="flex-2 px-10 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Saving...' : <><HiRocketLaunch className="w-5 h-5" /> {isAdminView ? 'Update Base' : 'Save Item'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Display Settings Modal */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white dark:border-white/10">
                        <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Display Settings</h3>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Branding & Theme</p>
                            </div>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Restaurant Display Name</label>
                                <input
                                    type="text"
                                    value={menuConfig.restaurantName}
                                    onChange={(e) => setMenuConfig({ ...menuConfig, restaurantName: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold outline-none ring-indigo-500 focus:ring-2"
                                />
                            </div>
                            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Theme Color</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Accent for buttons & filters</p>
                                </div>
                                <input
                                    type="color"
                                    value={menuConfig.themeColor}
                                    onChange={(e) => setMenuConfig({ ...menuConfig, themeColor: e.target.value })}
                                    className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent"
                                />
                            </div>
                            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Show Logo</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Display in public menu header</p>
                                </div>
                                <button
                                    onClick={() => setMenuConfig({ ...menuConfig, useLogo: !menuConfig.useLogo })}
                                    className={`w-14 h-8 rounded-full transition-all relative ${menuConfig.useLogo ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${menuConfig.useLogo ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">Welcome Promotion</h4>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Enable Welcome Pop-up</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Show loading & promo to users</p>
                                        </div>
                                        <button
                                            onClick={() => setMenuConfig({ ...menuConfig, showWelcomePromo: !menuConfig.showWelcomePromo })}
                                            className={`w-14 h-8 rounded-full transition-all relative ${menuConfig.showWelcomePromo ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${menuConfig.showWelcomePromo ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {menuConfig.showWelcomePromo && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Promotion Message</label>
                                                <textarea
                                                    rows="4"
                                                    value={menuConfig.welcomePromoText}
                                                    onChange={(e) => setMenuConfig({ ...menuConfig, welcomePromoText: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-sm text-gray-900 dark:text-gray-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                                    placeholder="Enter your welcoming message..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Loading (s)</label>
                                                    <input
                                                        type="number"
                                                        value={menuConfig.loadingDuration}
                                                        onChange={(e) => setMenuConfig({ ...menuConfig, loadingDuration: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pop-up (s)</label>
                                                    <input
                                                        type="number"
                                                        value={menuConfig.promoDuration}
                                                        onChange={(e) => setMenuConfig({ ...menuConfig, promoDuration: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-3">
                            <button onClick={() => setIsSettingsModalOpen(false)} className="flex-1 px-6 py-4 bg-white dark:bg-white/10 text-gray-500 dark:text-white font-black rounded-2xl border border-gray-100 dark:border-white/10 uppercase tracking-widest text-xs">
                                Back
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                style={{ backgroundColor: menuConfig.themeColor }}
                                className="flex-2 px-10 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Applying...' : <><HiRocketLaunch className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenuPizza1;
