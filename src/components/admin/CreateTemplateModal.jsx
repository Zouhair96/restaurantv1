import React, { useState } from 'react';
import { HiCheck, HiXMark, HiRocketLaunch, HiViewColumns, HiQueueList, HiRectangleGroup, HiSparkles, HiDevicePhoneMobile } from 'react-icons/hi2';

const CreateTemplateModal = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [templateKey, setTemplateKey] = useState('');
    const [baseLayout, setBaseLayout] = useState('grid');
    const [icon, setIcon] = useState('🍕');
    const [isSaving, setIsSaving] = useState(false);

    const layouts = [
        { id: 'grid', name: 'Grid Flow', icon: <HiRectangleGroup className="w-6 h-6" />, desc: 'Large tiles, best for visuals (Current)' },
        { id: 'list', name: 'List Flow', icon: <HiQueueList className="w-6 h-6" />, desc: 'Compact rows, best for large menus' },
        { id: 'magazine', name: 'Magazine', icon: <HiViewColumns className="w-6 h-6" />, desc: 'Asymmetric masonry, modern look' },
        { id: 'minimal', name: 'Minimalist', icon: <HiSparkles className="w-6 h-6" />, desc: 'Clean typography, elegant focus' },
        { id: 'swipe', name: 'Card Swipe', icon: <HiDevicePhoneMobile className="w-6 h-6" />, desc: 'Mobile-first app experience' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/templates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    template_key: templateKey.toLowerCase().replace(/\s+/g, '-'),
                    base_layout: baseLayout,
                    icon,
                    allowed_plans: ['enterprise'], // Default to highest tier
                    config: {}
                })
            });

            if (response.ok) {
                onSuccess();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to create template');
            }
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Server error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1a1c23] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white dark:border-white/10 max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight uppercase">Forge New Template</h3>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest text-[10px] mt-1">Multi-Layout Design Engine</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                        <HiXMark className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Template Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (!templateKey) setTemplateKey(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                }}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="e.g. Sushi Zen"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Identifier (Unique Key)</label>
                            <input
                                type="text"
                                value={templateKey}
                                onChange={(e) => setTemplateKey(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="sushi-v1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 text-center">Select Visual Engine (Base Layout)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {layouts.map(layout => (
                                <button
                                    key={layout.id}
                                    onClick={() => setBaseLayout(layout.id)}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${baseLayout === layout.id
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600'
                                        : 'border-gray-50 dark:border-white/5 text-gray-400 hover:border-gray-200 dark:hover:border-white/10'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${baseLayout === layout.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/5'}`}>
                                        {layout.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{layout.name}</span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-center text-xs text-gray-400 font-medium italic">
                            * {layouts.find(l => l.id === baseLayout)?.desc}
                        </p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Emoji Icon</label>
                        <div className="flex gap-2 flex-wrap">
                            {['🍕', '🍔', '🌮', '🍣', '🍱', '🍜', '🥗', '🍝', '🥩', '🍰'].map(e => (
                                <button
                                    key={e}
                                    onClick={() => setIcon(e)}
                                    className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all ${icon === e ? 'bg-indigo-500 shadow-lg scale-110' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 font-black rounded-2xl border border-gray-100 dark:border-white/10 uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !name || !templateKey}
                        className="flex-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        {isSaving ? 'Forging...' : <><HiRocketLaunch className="w-5 h-5" /> Assemble Template</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTemplateModal;
