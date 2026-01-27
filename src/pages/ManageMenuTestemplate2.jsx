import React, { useState, useRef, useEffect } from 'react';
import { HiPencil, HiTrash, HiXMark, HiCloudArrowUp, HiPhoto, HiPlus, HiCog6Tooth, HiArrowLeft, HiRocketLaunch, HiEye, HiEyeSlash } from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ManageMenuTestemplate2 = ({ isAdminView = false }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { templateKey: urlTemplateKey } = useParams();
    const templateKey = urlTemplateKey || 'testemplate2';

    const [items, setItems] = useState([]);
    const [template, setTemplate] = useState(null);
    const [menuConfig, setMenuConfig] = useState({
        restaurantName: '',
        themeColor: '#F97316', // Default Orange
        logoImage: null,
        useLogo: false,
        showWelcomePromo: true,
        welcomePromoText: "Welcome to our Fast Food Paradise! Enjoy the best burgers and fries in town.",
        loadingDuration: 3,
        promoDuration: 5
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
                // Admin View
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
                // Restaurant View
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
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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

                if (editingItem.is_custom && editingItem.id) {
                    payload.id = editingItem.id;
                }

                const response = await fetch('/.netlify/functions/menu-overrides', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        if (!isAdminView) return;
        if (!window.confirm('Delete this base item?')) return;

        try {
            await fetch('/.netlify/functions/template-items', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            await loadData();
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        } finally {
            setIsSaving(false);
        }
    };

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
                await fetch('/.netlify/functions/templates', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: template.id, config: menuConfig })
                });
                alert('Master settings saved!');
            } else {
                const menuId = template?.restaurant_menu_id;
                const endpoint = menuId ? '/.netlify/functions/menus' : '/.netlify/functions/menus';
                const method = menuId ? 'PUT' : 'POST';
                const body = menuId
                    ? { id: menuId, name: menuConfig.restaurantName, config: menuConfig }
                    : { name: menuConfig.restaurantName, templateType: templateKey, config: menuConfig };

                await fetch(endpoint, {
                    method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                alert('Menu settings saved!');
            }
            setIsSettingsModalOpen(false);
            await loadData();
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Error saving settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div className="space-y-1">
                    <button onClick={() => navigate(isAdminView ? '/admin' : '/dashboard/menu')} className="flex items-center gap-2 text-gray-400 hover:text-green-600 mb-4 font-black transition-all uppercase text-[10px] tracking-widest group">
                        <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl border border-orange-500/20 shadow-inner">
                            {template?.icon || '🍔'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                                {isAdminView ? `Master Blueprint: ${template?.name}` : 'Menu Personalization'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest">
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
                    <a href={isAdminView ? `/menu/${templateKey}` : `/${currentUser?.restaurant_name}`} target="_blank" rel="noreferrer" className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform">
                        <HiEye className="w-6 h-6" />
                    </a>
                    <button
                        onClick={() => { setEditingItem({ name: '', description: '', price: 0, category: 'Burgers', image_url: '', is_hidden: false, is_custom: true }); setIsEditModalOpen(true); }}
                        style={{ backgroundColor: menuConfig.themeColor }}
                        className="flex-1 md:flex-none px-6 py-4 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs uppercase tracking-widest"
                    >
                        <HiPlus className="w-5 h-5" /> {isAdminView ? 'Add Master' : 'Add Custom'}
                    </button>
                    <button onClick={() => setIsSettingsModalOpen(true)} className="p-4 bg-white text-gray-400 hover:text-orange-500 rounded-2xl border-2 border-gray-100 shadow-md transition-colors">
                        <HiCog6Tooth className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 pl-6 pr-4 py-4 rounded-2xl bg-white border border-gray-100 font-bold focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                />
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={selectedCategory === cat ? { backgroundColor: menuConfig.themeColor, color: '#fff' } : {}}
                            className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat ? 'border-transparent' : 'bg-white text-gray-400 border-gray-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                    <div key={item.id} className={`bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 ${item.is_hidden ? 'opacity-50 grayscale' : ''}`}>
                        <div className="relative h-48 bg-gray-100">
                            {item.image_url ? (
                                <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300"><HiPhoto className="w-12 h-12" /></div>
                            )}
                            <span className="absolute top-4 left-4 bg-black/50 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">{item.category}</span>
                            <span className="absolute bottom-4 right-4 bg-orange-500 text-white font-black px-3 py-1 rounded-xl shadow-lg border-2 border-white">${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                        <div className="p-6">
                            <h3 className="font-black text-gray-900 uppercase tracking-tight mb-2 line-clamp-1">{item.name}</h3>
                            <p className="text-gray-400 text-xs font-medium line-clamp-2 h-8">{item.description}</p>

                            <div className="mt-6 flex gap-2">
                                <button onClick={() => { setEditingItem({ ...item }); setIsEditModalOpen(true); }} className="flex-1 py-3 bg-gray-50 hover:bg-orange-500 hover:text-white text-gray-500 font-black rounded-xl text-[10px] uppercase tracking-widest transition-colors">Edit</button>
                                {!isAdminView && (
                                    <button onClick={() => toggleVisibility(item)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors ${item.is_hidden ? 'bg-orange-500 text-white' : 'bg-white border border-gray-100 text-gray-400 hover:text-red-500'}`}>
                                        {item.is_hidden ? 'Show' : 'Hide'}
                                    </button>
                                )}
                                {isAdminView && (
                                    <button onClick={() => handleDeleteItem(item.id)} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors"><HiTrash className="w-4 h-4" /></button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{editingItem.id ? 'Edit Item' : 'New Item'}</h3>
                            <button onClick={() => setIsEditModalOpen(false)}><HiXMark className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                                    <input type="text" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</label>
                                    <input type="number" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                                    <input type="text" value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Burgers, Drinks..." />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Image</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-2xl h-32 flex items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors relative overflow-hidden" onClick={() => document.getElementById('file-up').click()}>
                                        {editingItem.image_url ? <img src={editingItem.image_url} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-gray-400 font-bold uppercase text-xs">Upload Photo</span>}
                                        <input type="file" id="file-up" className="hidden" onChange={async (e) => {
                                            if (e.target.files[0]) setEditingItem({ ...editingItem, image_url: await compressImage(e.target.files[0]) })
                                        }} />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                    <textarea rows="3" value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 focus:ring-2 focus:ring-orange-500 outline-none resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
                            <button onClick={handleSaveItem} style={{ backgroundColor: menuConfig.themeColor }} className="flex-2 py-4 px-8 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl">{isSaving ? 'Saving...' : 'Save Item'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Display Settings</h3>
                            <button onClick={() => setIsSettingsModalOpen(false)}><HiXMark className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">App Name</label>
                                <input type="text" value={menuConfig.restaurantName} onChange={e => setMenuConfig({ ...menuConfig, restaurantName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold outline-none" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="font-bold text-gray-700">Theme Color</span>
                                <input type="color" value={menuConfig.themeColor} onChange={e => setMenuConfig({ ...menuConfig, themeColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button onClick={() => setIsSettingsModalOpen(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
                            <button onClick={handleSaveSettings} style={{ backgroundColor: menuConfig.themeColor }} className="flex-2 py-4 px-8 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl">{isSaving ? 'Applying...' : 'Apply Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default ManageMenuTestemplate2;
