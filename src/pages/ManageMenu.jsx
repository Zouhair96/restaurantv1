import React, { useState, useEffect } from 'react';
import { HiPencil, HiTrash, HiXMark, HiCloudArrowUp, HiPhoto, HiPlus, HiCog6Tooth, HiArrowLeft, HiRocketLaunch, HiEye, HiEyeSlash, HiTag } from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import PromoManagementModal from '../components/dashboard/PromoManagementModal';

const ManageMenu = ({ isAdminView = false }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { templateKey: urlTemplateKey } = useParams();
    const templateKey = urlTemplateKey || 'pizza1'; // Default Fallback, though routing should provide it

    const [items, setItems] = useState([]);
    const [template, setTemplate] = useState(null);
    const [menuConfig, setMenuConfig] = useState({
        restaurantName: '',
        themeColor: '#f97316', // Default Orange, will be overwritten by fetch
        logoImage: null,
        useLogo: false,
        showWelcomePromo: true,
        welcomePromoText: "",
        loadingDuration: 3,
        promoDuration: 5,
        promotions: [], // Promotion management
        applyTax: false,
        taxPercentage: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

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
                    setMenuConfig(prev => ({ ...prev, ...data.config, restaurantName: `Master: ${data.name}` }));
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

                    // Priority: Restaurant Config > Template Config > Defaults
                    const mergedConfig = {
                        ...menuConfig,
                        ...data.template?.config,
                        ...data.template?.restaurant_config
                    };

                    setMenuConfig({
                        ...mergedConfig,
                        restaurantName: data.template?.restaurant_config?.restaurantName || currentUser?.restaurant_name || ''
                    });
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
                    name_en: editingItem.name_en,
                    description_override: editingItem.description,
                    description_en: editingItem.description_en,
                    price_override: editingItem.price,
                    image_override: editingItem.image_url,
                    category_override: editingItem.category,
                    category_en: editingItem.category_en,
                    is_hidden: editingItem.is_hidden
                };

                // If editing a custom item that already exists, use its override ID
                if (editingItem.is_custom && editingItem.id) {
                    payload.id = editingItem.id;
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
                is_hidden: !item.is_hidden,
                // We must send context to identify the override record if it doesn't exist yet
                restaurant_template_id: template.restaurant_template_id
            };

            // "Toggle" logic is slightly complex because we might be CREATING an override just to hide it.
            // But the backend `menu-overrides` POST handler handles Insert/Update upsert logic.
            // We just need to make sure we send the right ID. 
            // If item has `override_id`, better to send that? No, backend logic uses `template_item_id` and `restaurant_template_id` for establishing the link.

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

    const handleSaveSettings = async (configOverride = null) => {
        setIsSaving(true);
        const activeConfig = configOverride || menuConfig;

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
                        config: activeConfig
                    })
                });
                if (response.ok) {
                    // Use a toast or subtle notification instead of alert if possible, 
                    // but for now let's just avoid the alert blocking during auto-saves
                    if (!configOverride) alert('Master Template Settings saved!');
                }
            } else {
                // Restaurant: Save to Menu Config
                const menuId = template?.restaurant_menu_id;
                const endpoint = '/.netlify/functions/menus';
                const method = menuId ? 'PUT' : 'POST';
                const body = menuId
                    ? { id: menuId, name: activeConfig.restaurantName, config: activeConfig }
                    : { name: activeConfig.restaurantName, templateType: templateKey, config: activeConfig };

                const response = await fetch(endpoint, {
                    method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                if (response.ok) {
                    if (!configOverride) alert('Settings Saved!');
                }
            }
            if (!configOverride) setIsSettingsModalOpen(false);
            await loadData();
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Error saving settings.');
        } finally {
            setIsSaving(false);
        }
    };

    // Derived State for Rendering
    const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

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
                            {template?.icon || '🍽️'}
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
                    {/* Public Preview Button */}
                    <a
                        href={isAdminView ? `/menu/${templateKey}` : `/${currentUser?.restaurant_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-gray-900 text-white font-black rounded-2xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        title="View Menu"
                    >
                        <HiEye className="w-6 h-6" />
                    </a>

                    <button
                        onClick={() => {
                            setEditingItem({ name: '', name_en: '', description: '', description_en: '', price: 0, category: 'Food', category_en: 'Food', image_url: '', is_hidden: false, is_custom: true });
                            setIsEditModalOpen(true);
                        }}
                        style={{ backgroundColor: menuConfig.themeColor }}
                        className="flex-1 md:flex-none px-6 py-4 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                        <HiPlus className="w-5 h-5" />
                        {isAdminView ? 'Add Master' : 'Add Custom'}
                    </button>
                    <button
                        onClick={() => setIsPromoModalOpen(true)}
                        style={{ backgroundColor: menuConfig.themeColor }}
                        className="p-4 text-white font-black rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95"
                        title="Manage Promotions"
                    >
                        <HiTag className="w-6 h-6" />
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
                            style={selectedCategory === cat ? { backgroundColor: menuConfig.themeColor, color: '#fff' } : {}}
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
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={`group relative bg-white dark:bg-[#1a1c23] rounded-[2rem] border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${item.is_hidden ? 'opacity-40 grayscale' : ''}`}
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden bg-gray-50 dark:bg-gray-800">
                                {item.image_url ? (
                                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <HiPhoto className="w-16 h-16 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                                        {item.category}
                                    </span>
                                    {/* Show label if customized */}
                                    {!isAdminView && item.has_override && (
                                        <span className="bg-green-500/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            Custom
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-4 right-4 text-white font-black px-4 py-1.5 rounded-xl shadow-lg border border-white/20 text-sm" style={{ backgroundColor: menuConfig.themeColor }}>
                                    ${parseFloat(item.price).toFixed(2)}
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
                                        <HiPencil className="w-4 h-4" /> Edit
                                    </button>

                                    {!isAdminView ? (
                                        <button
                                            onClick={() => toggleVisibility(item)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${item.is_hidden
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                                : 'bg-white dark:bg-white/5 text-gray-400 border border-gray-100 dark:border-white/10 hover:text-red-500'
                                                }`}
                                            title={item.is_hidden ? "Show on Menu" : "Hide from Menu"}
                                        >
                                            {item.is_hidden ? <><HiPlus className="w-4 h-4" /> Add</> : <><HiEyeSlash className="w-4 h-4" /> Hide</>}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-3 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Hidden Overlay */}
                            {item.is_hidden && (
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-grayscale pointer-events-none flex items-center justify-center">
                                    {/* <span className="rotate-12 bg-gray-900 text-white px-6 py-2 rounded-xl text-xl font-black uppercase opacity-60 tracking-widest transform scale-125 border-4 border-white">
                                        Hidden
                                    </span> */}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white/30 dark:bg-white/5 border-4 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] text-center">
                        <div className="text-7xl mb-6 grayscale opacity-20">🍽️</div>
                        <h3 className="text-2xl font-black text-gray-300 dark:text-gray-600 uppercase tracking-tight">No Items Found</h3>
                        <p className="text-gray-400 text-sm mt-2">Use the "Add" button to create your first item.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal (Reused Logic) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white dark:border-white/10">
                        <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {editingItem.id ? 'Edit Item' : 'New Item'}
                                </h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    {isAdminView ? 'Global Definition' : 'Personal Customization'}
                                </p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Name (FR)</label>
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Name (EN)</label>
                                    <input
                                        type="text"
                                        value={editingItem.name_en}
                                        onChange={(e) => setEditingItem({ ...editingItem, name_en: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="English Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category (FR)</label>
                                    <input
                                        type="text"
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="ex: Burgers"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category (EN)</label>
                                    <input
                                        type="text"
                                        value={editingItem.category_en}
                                        onChange={(e) => setEditingItem({ ...editingItem, category_en: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="e.g. Burgers"
                                    />
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
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description (FR)</label>
                                <textarea
                                    rows="2"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-medium italic focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description (EN)</label>
                                <textarea
                                    rows="2"
                                    value={editingItem.description_en}
                                    onChange={(e) => setEditingItem({ ...editingItem, description_en: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-medium italic focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
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
                                {isSaving ? 'Saving...' : <><HiRocketLaunch className="w-5 h-5" /> Save</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Promo Management Modal */}
            <PromoManagementModal
                isOpen={isPromoModalOpen}
                onClose={() => setIsPromoModalOpen(false)}
                promotions={menuConfig.promotions || []}
                items={items}
                categories={categories}
                themeColor={menuConfig.themeColor}
                onSave={(promo) => {
                    const existingPromos = menuConfig.promotions || [];
                    const promoIndex = existingPromos.findIndex(p => p.id === promo.id);
                    let updatedPromos;

                    if (promoIndex >= 0) {
                        // Update existing
                        updatedPromos = [...existingPromos];
                        updatedPromos[promoIndex] = promo;
                    } else {
                        // Add new
                        updatedPromos = [...existingPromos, promo];
                    }

                    const newConfig = { ...menuConfig, promotions: updatedPromos };
                    setMenuConfig(newConfig);

                    // Auto-save to backend using the NEW config immediately
                    handleSaveSettings(newConfig);
                }}
                onDelete={(promoId) => {
                    const updatedPromos = (menuConfig.promotions || []).filter(p => p.id !== promoId);
                    const newConfig = { ...menuConfig, promotions: updatedPromos };
                    setMenuConfig(newConfig);

                    // Auto-save to backend using the NEW config immediately
                    handleSaveSettings(newConfig);
                }}
            />

            {/* Settings Modal - Simplified for brevity, similar structure to previous */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white dark:border-white/10">
                        <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Display Settings</h3>
                            <button onClick={() => setIsSettingsModalOpen(false)}><HiXMark className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Restaurant Name</label>
                                <input type="text" value={menuConfig.restaurantName} onChange={(e) => setMenuConfig({ ...menuConfig, restaurantName: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 font-bold outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Theme Color</label>
                                <input type="color" value={menuConfig.themeColor} onChange={(e) => setMenuConfig({ ...menuConfig, themeColor: e.target.value })} className="w-12 h-12 rounded-xl border-none" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Show Welcome Promo</span>
                                <input type="checkbox" checked={menuConfig.showWelcomePromo} onChange={(e) => setMenuConfig({ ...menuConfig, showWelcomePromo: e.target.checked })} className="w-6 h-6 accent-indigo-600" />
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-black text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300">Apply Taxes</span>
                                        <span className="text-[10px] text-gray-400 font-bold">Enable tax calculation at checkout</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={menuConfig.applyTax}
                                            onChange={(e) => setMenuConfig({ ...menuConfig, applyTax: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                                    </label>
                                </div>

                                {menuConfig.applyTax && (
                                    <div className="animate-fade-in">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tax Percentage (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={menuConfig.taxPercentage}
                                                onChange={(e) => setMenuConfig({ ...menuConfig, taxPercentage: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-100 dark:border-white/10 font-bold outline-none pr-10"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-8 border-t border-gray-100 dark:border-white/5 flex gap-3">
                            <button onClick={() => setIsSettingsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500">Cancel</button>
                            <button onClick={handleSaveSettings} className="flex-2 py-4 px-8 text-white font-bold rounded-2xl" style={{ backgroundColor: menuConfig.themeColor }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ManageMenu;
