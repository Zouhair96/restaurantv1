import React, { useState, useEffect } from 'react';
import { HiXMark, HiPlus, HiPencil, HiTrash, HiTag, HiCloudArrowUp, HiPhoto } from 'react-icons/hi2';

const PromoManagementModal = ({
    isOpen,
    onClose,
    promotions = [],
    items = [],
    categories = [],
    themeColor = '#f97316',
    onSave,
    onDelete
}) => {
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState(getEmptyPromo());

    function getEmptyPromo() {
        return {
            id: null,
            name: '',
            discountType: 'percentage',
            discountValue: 0,
            promoText: '',
            promoImage: '',
            requiresCode: false,
            promoCode: '',
            scope: {
                type: 'all',
                itemIds: [],
                categories: []
            },
            schedule: {
                startDate: '',
                endDate: '',
                alwaysActive: true,
                recurring: {
                    enabled: false,
                    daysOfWeek: [],
                    timeStart: '17:00',
                    timeEnd: '19:00'
                }
            },
            isActive: false,
            createdAt: new Date().toISOString()
        };
    }

    useEffect(() => {
        if (!isOpen) {
            setView('list');
            setEditingPromo(null);
            setFormData(getEmptyPromo());
        }
    }, [isOpen]);

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setFormData({ ...promo });
        setView('form');
    };

    const handleCreateNew = () => {
        setEditingPromo(null);
        setFormData(getEmptyPromo());
        setView('form');
    };

    const handleSave = () => {
        const promoToSave = {
            ...formData,
            id: formData.id || `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        onSave(promoToSave);
        setView('list');
        setFormData(getEmptyPromo());
    };

    const handleDelete = (promoId) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            onDelete(promoId);
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
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const toggleDayOfWeek = (day) => {
        const days = formData.schedule.recurring.daysOfWeek;
        const newDays = days.includes(day)
            ? days.filter(d => d !== day)
            : [...days, day].sort();
        setFormData({
            ...formData,
            schedule: {
                ...formData.schedule,
                recurring: {
                    ...formData.schedule.recurring,
                    daysOfWeek: newDays
                }
            }
        });
    };

    const toggleCategory = (category) => {
        const cats = formData.scope.categories;
        const newCats = cats.includes(category)
            ? cats.filter(c => c !== category)
            : [...cats, category];
        setFormData({
            ...formData,
            scope: {
                ...formData.scope,
                categories: newCats
            }
        });
    };

    const toggleItem = (itemId) => {
        const itemIds = formData.scope.itemIds;
        const newIds = itemIds.includes(itemId)
            ? itemIds.filter(id => id !== itemId)
            : [...itemIds, itemId];
        setFormData({
            ...formData,
            scope: {
                ...formData.scope,
                itemIds: newIds
            }
        });
    };

    if (!isOpen) return null;

    const daysOfWeek = [
        { value: 0, label: 'Sun' },
        { value: 1, label: 'Mon' },
        { value: 2, label: 'Tue' },
        { value: 3, label: 'Wed' },
        { value: 4, label: 'Thu' },
        { value: 5, label: 'Fri' },
        { value: 6, label: 'Sat' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1a1c23] rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white dark:border-white/10 flex flex-col">
                {/* Header */}
                <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${themeColor}20` }}>
                            <HiTag style={{ color: themeColor }} className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                {view === 'list' ? 'Promotions' : (editingPromo ? 'Edit Promotion' : 'New Promotion')}
                            </h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                {view === 'list' ? `${promotions.length} Active Offers` : 'Configure Promotional Offer'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                        <HiXMark className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {view === 'list' ? (
                        <div className="space-y-6">
                            {/* Create New Button */}
                            <button
                                onClick={handleCreateNew}
                                style={{ backgroundColor: themeColor }}
                                className="w-full py-4 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest text-sm"
                            >
                                <HiPlus className="w-5 h-5" /> Create New Promotion
                            </button>

                            {/* Promotions List */}
                            {promotions.length === 0 ? (
                                <div className="py-20 text-center bg-white/30 dark:bg-white/5 border-4 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem]">
                                    <div className="text-7xl mb-6 grayscale opacity-20">🎁</div>
                                    <h3 className="text-2xl font-black text-gray-300 dark:text-gray-600 uppercase tracking-tight">No Promotions Yet</h3>
                                    <p className="text-gray-400 text-sm mt-2">Create your first promotional offer to attract customers!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {promotions.map((promo) => (
                                        <div
                                            key={promo.id}
                                            className={`group relative bg-white dark:bg-[#24262d] rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${promo.isActive
                                                    ? 'border-green-500 shadow-lg shadow-green-500/10'
                                                    : 'border-gray-100 dark:border-white/10 opacity-60'
                                                }`}
                                        >
                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${promo.isActive
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                                    }`}>
                                                    {promo.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            {/* Promo Image */}
                                            {promo.promoImage && (
                                                <div className="mb-4 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                    <img src={promo.promoImage} alt={promo.name} className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            {/* Promo Info */}
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                                                {promo.name}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 italic">
                                                {promo.promoText}
                                            </p>

                                            {/* Discount Badge */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="px-4 py-2 rounded-xl font-black text-sm" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                                                    {promo.discountType === 'percentage'
                                                        ? `${promo.discountValue}% OFF`
                                                        : `$${promo.discountValue} OFF`}
                                                </span>
                                                {promo.requiresCode && (
                                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold">
                                                        Code: {promo.promoCode}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Scope Info */}
                                            <p className="text-xs text-gray-400 mb-4">
                                                <span className="font-bold">Applies to:</span> {
                                                    promo.scope.type === 'all' ? 'All Items' :
                                                        promo.scope.type === 'items' ? `${promo.scope.itemIds.length} Items` :
                                                            promo.scope.type === 'categories' ? promo.scope.categories.join(', ') :
                                                                'Order Total'
                                                }
                                            </p>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(promo)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-white/5 hover:bg-indigo-600 hover:text-white text-gray-600 dark:text-gray-300 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all"
                                                >
                                                    <HiPencil className="w-4 h-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                >
                                                    <HiTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Promotion Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Promotion Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Promotion Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Summer Sale, Happy Hour"
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Discount Type */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Discount Type</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${formData.discountType === 'percentage'
                                                    ? 'text-white shadow-lg'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                                                }`}
                                            style={formData.discountType === 'percentage' ? { backgroundColor: themeColor } : {}}
                                        >
                                            Percentage (%)
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${formData.discountType === 'fixed'
                                                    ? 'text-white shadow-lg'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                                                }`}
                                            style={formData.discountType === 'fixed' ? { backgroundColor: themeColor } : {}}
                                        >
                                            Fixed Amount ($)
                                        </button>
                                    </div>
                                </div>

                                {/* Discount Value */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Discount Value</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Promo Text */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Promotional Message</label>
                                    <textarea
                                        rows="2"
                                        value={formData.promoText}
                                        onChange={(e) => setFormData({ ...formData, promoText: e.target.value })}
                                        placeholder="e.g., Get 20% off all items this summer!"
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-medium italic focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Promo Image */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Promo Image</label>
                                    <div
                                        className="relative w-full h-40 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer overflow-hidden group"
                                        onClick={() => document.getElementById('promo-image-upload').click()}
                                    >
                                        {formData.promoImage ? (
                                            <img src={formData.promoImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Promo" />
                                        ) : (
                                            <HiCloudArrowUp className="w-10 h-10 mb-2 opacity-30" />
                                        )}
                                        <span className="text-xs font-black uppercase tracking-widest relative z-10 text-gray-500">Upload Image</span>
                                        <input
                                            type="file"
                                            id="promo-image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const compressed = await compressImage(file);
                                                    setFormData({ ...formData, promoImage: compressed });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Promo Code Section */}
                                <div className="md:col-span-2 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-sm font-bold text-gray-700 dark:text-white">Require Promo Code</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.requiresCode}
                                            onChange={(e) => setFormData({ ...formData, requiresCode: e.target.checked })}
                                            className="w-6 h-6 accent-indigo-600"
                                        />
                                    </div>
                                    {formData.requiresCode && (
                                        <input
                                            type="text"
                                            value={formData.promoCode}
                                            onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                                            placeholder="e.g., SUMMER20"
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    )}
                                </div>

                                {/* Application Scope */}
                                <div className="md:col-span-2 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Apply To</label>
                                    <select
                                        value={formData.scope.type}
                                        onChange={(e) => setFormData({ ...formData, scope: { ...formData.scope, type: e.target.value, itemIds: [], categories: [] } })}
                                        className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-4"
                                    >
                                        <option value="all">All Items</option>
                                        <option value="items">Specific Items</option>
                                        <option value="categories">Specific Categories</option>
                                        <option value="order">Order Total</option>
                                    </select>

                                    {/* Category Selector */}
                                    {formData.scope.type === 'categories' && categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {categories.filter(cat => cat !== 'All').map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => toggleCategory(category)}
                                                    className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.scope.categories.includes(category)
                                                            ? 'text-white shadow-lg'
                                                            : 'bg-white dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'
                                                        }`}
                                                    style={formData.scope.categories.includes(category) ? { backgroundColor: themeColor } : {}}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Item Selector */}
                                    {formData.scope.type === 'items' && items.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {items.map((item) => (
                                                <label key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-[#24262d] rounded-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:border-indigo-500 transition-all">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.scope.itemIds.includes(item.id)}
                                                        onChange={() => toggleItem(item.id)}
                                                        className="w-5 h-5 accent-indigo-600"
                                                    />
                                                    <span className="text-sm font-bold text-gray-700 dark:text-white">{item.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Schedule Section */}
                                <div className="md:col-span-2 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Schedule</label>

                                    {/* Always Active Toggle */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-700 dark:text-white">Always Active</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.schedule.alwaysActive}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                schedule: { ...formData.schedule, alwaysActive: e.target.checked }
                                            })}
                                            className="w-6 h-6 accent-indigo-600"
                                        />
                                    </div>

                                    {/* Date Range */}
                                    {!formData.schedule.alwaysActive && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2">Start Date</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.schedule.startDate}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        schedule: { ...formData.schedule, startDate: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2">End Date</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.schedule.endDate}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        schedule: { ...formData.schedule, endDate: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Recurring Schedule */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-sm font-bold text-gray-700 dark:text-white">Recurring Schedule</label>
                                            <input
                                                type="checkbox"
                                                checked={formData.schedule.recurring.enabled}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    schedule: {
                                                        ...formData.schedule,
                                                        recurring: { ...formData.schedule.recurring, enabled: e.target.checked }
                                                    }
                                                })}
                                                className="w-6 h-6 accent-indigo-600"
                                            />
                                        </div>

                                        {formData.schedule.recurring.enabled && (
                                            <div className="space-y-4">
                                                {/* Days of Week */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-2">Days of Week</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {daysOfWeek.map((day) => (
                                                            <button
                                                                key={day.value}
                                                                onClick={() => toggleDayOfWeek(day.value)}
                                                                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${formData.schedule.recurring.daysOfWeek.includes(day.value)
                                                                        ? 'text-white shadow-lg'
                                                                        : 'bg-white dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'
                                                                    }`}
                                                                style={formData.schedule.recurring.daysOfWeek.includes(day.value) ? { backgroundColor: themeColor } : {}}
                                                            >
                                                                {day.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Time Range */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-2">Start Time</label>
                                                        <input
                                                            type="time"
                                                            value={formData.schedule.recurring.timeStart}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                schedule: {
                                                                    ...formData.schedule,
                                                                    recurring: { ...formData.schedule.recurring, timeStart: e.target.value }
                                                                }
                                                            })}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-2">End Time</label>
                                                        <input
                                                            type="time"
                                                            value={formData.schedule.recurring.timeEnd}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                schedule: {
                                                                    ...formData.schedule,
                                                                    recurring: { ...formData.schedule.recurring, timeEnd: e.target.value }
                                                                }
                                                            })}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div className="md:col-span-2 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 dark:text-white block mb-1">Activate Promotion</label>
                                            <p className="text-xs text-gray-400">Enable this promotion to make it visible to customers</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-8 h-8 accent-green-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-3 shrink-0">
                    {view === 'form' ? (
                        <>
                            <button
                                onClick={() => setView('list')}
                                className="flex-1 px-6 py-4 bg-white dark:bg-white/10 text-gray-500 dark:text-white font-black rounded-2xl border border-gray-100 dark:border-white/10 uppercase tracking-widest text-xs"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name || !formData.promoText}
                                style={{ backgroundColor: themeColor }}
                                className="flex-2 px-10 py-4 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Promotion
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-white dark:bg-white/10 text-gray-500 dark:text-white font-black rounded-2xl border border-gray-100 dark:border-white/10 uppercase tracking-widest text-xs"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromoManagementModal;
