import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiCheck, HiXMark, HiRocketLaunch, HiEye, HiCog6Tooth, HiTrash } from 'react-icons/hi2';

const Templates = () => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [plans, setPlans] = useState(['starter', 'pro', 'enterprise']);
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setTemplates(data);
            } else {
                console.error('Templates data is not an array:', data);
                setTemplates([]);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeployClick = (template) => {
        setSelectedTemplate(template);
        setSelectedPlans(template.allowed_plans || []);
        setIsDeployModalOpen(true);
    };

    const togglePlan = (plan) => {
        if (selectedPlans.includes(plan)) {
            setSelectedPlans(selectedPlans.filter(p => p !== plan));
        } else {
            setSelectedPlans([...selectedPlans, plan]);
        }
    };

    const handleSaveDeployment = async () => {
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
                    id: selectedTemplate.id,
                    allowed_plans: selectedPlans
                })
            });

            if (response.ok) {
                await fetchTemplates();
                setIsDeployModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving deployment:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2 uppercase tracking-tight">Template Deployment</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Deploy menu templates to specific subscription tiers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <div key={template.id} className="group bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl border border-white dark:border-white/5 hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6 relative">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-3xl shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                                {template.icon || '🍽️'}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight uppercase">{template.name}</h2>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(template.allowed_plans || []).map(plan => (
                                        <span key={plan} className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                            {plan}
                                        </span>
                                    ))}
                                    {(!template.allowed_plans || template.allowed_plans.length === 0) && (
                                        <span className="text-[10px] text-gray-400 font-bold italic">Not Deployed</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="h-32 bg-gray-50 dark:bg-black/20 rounded-2xl mb-6 border border-gray-100 dark:border-white/5 overflow-hidden flex items-center justify-center relative group-hover:border-indigo-500/30 transition-colors">
                            {template.image_url ? (
                                <img src={template.image_url} alt={template.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                            ) : (
                                <div className="absolute inset-0 bg-indigo-500/5"></div>
                            )}
                            <span className="relative z-10 font-bold text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm text-xs uppercase tracking-widest">Preview</span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    to={`/menu_${template.template_key}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-all border border-gray-100 dark:border-white/10 shadow-sm"
                                >
                                    <HiEye className="w-4 h-4" /> Show
                                </Link>
                                <Link
                                    to={`/manage_menu_${template.template_key}`}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-all border border-gray-100 dark:border-white/10 shadow-sm"
                                >
                                    <HiCog6Tooth className="w-4 h-4" /> Manage
                                </Link>
                            </div>
                            <button
                                onClick={() => handleDeployClick(template)}
                                className="w-full px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 uppercase tracking-widest text-xs"
                            >
                                <HiRocketLaunch className="w-5 h-5" /> Deploy Template
                            </button>
                        </div>
                    </div>
                ))}

                {/* Placeholder for Add New */}
                <button className="bg-white/30 dark:bg-white/5 border-4 border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all min-h-[300px] group">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                        +
                    </div>
                    <span className="font-black text-lg uppercase tracking-tight">Create New Template</span>
                </button>
            </div>

            {/* Deploy Modal */}
            {isDeployModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-[#1a1c23] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white dark:border-white/10 animate-fade-in">
                        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight uppercase">Deploy Template</h3>
                                <p className="text-gray-400 text-sm font-medium">{selectedTemplate?.name}</p>
                            </div>
                            <button onClick={() => setIsDeployModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Select Target Subscription Tiers</label>
                                <div className="space-y-3">
                                    {plans.map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => togglePlan(plan)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedPlans.includes(plan)
                                                ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500'
                                                : 'border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-indigo-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${selectedPlans.includes(plan) ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/5'}`}>
                                                    {selectedPlans.includes(plan) && <HiCheck className="w-4 h-4" />}
                                                </div>
                                                <span className="font-black uppercase tracking-widest text-xs">{plan}</span>
                                            </div>
                                            <span className="text-[10px] font-bold opacity-60">
                                                {plan === 'starter' ? 'Entry Level' : plan === 'pro' ? 'Recommended' : 'All Features'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed italic">
                                * This template will immediately appear in the dashboard of restaurants with the selected subscription plans.
                            </p>
                        </div>

                        <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-3">
                            <button
                                onClick={() => setIsDeployModalOpen(false)}
                                className="flex-1 px-6 py-4 bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 font-black rounded-xl border border-gray-100 dark:border-white/10 uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveDeployment}
                                disabled={isSaving}
                                className="flex-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Processing...' : <><HiRocketLaunch className="w-5 h-5" /> Confirm Deployment</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;
