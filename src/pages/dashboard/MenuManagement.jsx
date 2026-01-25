import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { QRCodeSVG } from 'qrcode.react'
import TemplateEditorModal from '../../components/dashboard/TemplateEditorModal'
import { fetchMenus, createMenu, updateMenu, deleteMenu } from '../../utils/menus'

// Assets
import tacosTemplate from '../../assets/tacos_template.png'
import pizzaTemplate from '../../assets/pizza_template.png'
import saladTemplate from '../../assets/salad_template.png'
import s1Template from '../../assets/s1_template.png'
import s2Template from '../../assets/s2_template.png'
import p1Template from '../../assets/p1_template.png'
import p2Template from '../../assets/p2_template.png'
import p3Template from '../../assets/p3_template.png'

const MenuManagement = () => {
    const { user } = useAuth()
    const { t } = useLanguage()
    const navigate = useNavigate()
    const [savedMenus, setSavedMenus] = useState([])
    const [editingMenu, setEditingMenu] = useState(null)
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [templates, setTemplates] = useState([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

    useEffect(() => {
        if (user) {
            loadMenus()
        }
    }, [user])

    useEffect(() => {
        if (user) {
            loadTemplates()
        }
    }, [user])

    const loadTemplates = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/.netlify/functions/templates?plan=${user.subscription_plan || 'starter'}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setTemplates(data)
        } catch (error) {
            console.error('Error loading templates:', error)
        } finally {
            setIsLoadingTemplates(false)
        }
    }

    const loadMenus = async () => {
        try {
            const data = await fetchMenus()
            setSavedMenus(data)
        } catch (error) {
            console.error('Error loading menus:', error)
        }
    }

    const handleSaveMenu = async (name, config) => {
        try {
            if (editingMenu) {
                await updateMenu(editingMenu.id, name, config)
            } else {
                await createMenu(name, selectedTemplate || 'custom', config)
            }
            await loadMenus()
        } catch (error) {
            console.error('Error saving menu:', error)
            alert('Failed to save menu')
        }
    }

    const handleDeleteMenu = async (id, e) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this menu?')) {
            try {
                await deleteMenu(id)
                await loadMenus()
            } catch (error) {
                console.error('Error deleting menu:', error)
            }
        }
    }

    const handleEditMenu = (menu) => {
        if (menu.template_type === 'pizza1') {
            navigate('/manage-menu-pizza1');
            return;
        }
        setEditingMenu(menu)
        setSelectedTemplate(menu.template_type)
        setIsEditorOpen(true)
    }

    const hasMenu = savedMenus.length > 0

    const userPlan = (user?.subscription_plan || 'starter').toLowerCase()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-gray-900 dark:text-white mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Digital Menu Templates</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Select a template available for your {userPlan} plan.</p>
                </div>
            </div>

            {/* Active Menu Widget */}
            {hasMenu && savedMenus.length > 0 && (
                <div className="mb-8 animate-fade-in">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700 shadow-xl">
                        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                {/* Left: Menu Info */}
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-20 h-20 rounded-xl bg-yum-primary/10 flex items-center justify-center border border-yum-primary/20 shrink-0">
                                        <span className="text-4xl">
                                            {savedMenus[0].template_type === 'tacos' ? '🌮' :
                                                savedMenus[0].template_type === 'pizza' ? '🍕' :
                                                    (templates.find(t => t.template_key === savedMenus[0].template_type)?.icon || '🍽️')}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-1">{savedMenus[0].name}</h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 capitalize font-medium">
                                                {savedMenus[0].template_type} Template
                                            </span>
                                            <span className="text-gray-500 font-medium">
                                                {(() => {
                                                    const configData = typeof savedMenus[0].config === 'string' ? JSON.parse(savedMenus[0].config) : savedMenus[0].config
                                                    const sizeCount = configData.sizes?.length || 0
                                                    const steps = [configData.friesOption, configData.mealsOption, configData.saucesOption, configData.drinksOption, configData.extrasOption]
                                                    const activeSteps = steps.filter(opt => opt && opt.length > 0).length
                                                    return `${sizeCount} Sizes • ${activeSteps} Customized Categories`
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center: QR Code */}
                                <div className="hidden lg:flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                                    <QRCodeSVG value={`${window.location.origin}/${user.restaurant_name}`} size={80} />
                                    <span className="text-[10px] text-gray-400 mt-1 font-bold tracking-wider uppercase">Scan Me</span>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleEditMenu(savedMenus[0])}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold transition-all border border-gray-200 dark:border-gray-700 group shadow-sm dark:shadow-none"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">✏️</span> Edit
                                    </button>

                                    <a
                                        href={`${window.location.origin}/${user.restaurant_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">👁️</span> Show
                                    </a>

                                    <button
                                        onClick={(e) => handleDeleteMenu(savedMenus[0].id, e)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-500 rounded-xl font-bold transition-all border border-red-200 dark:border-red-900/30 group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">🗑️</span> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => {
                    const isActive = savedMenus[0]?.template_type === template.template_key;
                    const isLocked = hasMenu && !isActive;

                    return (
                        <div
                            key={template.id}
                            onClick={() => {
                                if (isLocked) return;
                                if (hasMenu && isActive) return; // Already created, use widget at top

                                if (template.template_key === 'pizza1') {
                                    navigate('/manage-menu-pizza1');
                                    return;
                                }

                                setSelectedTemplate(template.template_key);
                                setEditingMenu(null);
                                setIsEditorOpen(true);
                            }}
                            className={`group relative rounded-[2.5rem] overflow-hidden transition-all duration-300 border-2 ${isLocked
                                ? 'opacity-40 grayscale cursor-not-allowed border-transparent'
                                : isActive
                                    ? 'border-green-500 shadow-xl cursor-default'
                                    : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02] border-transparent hover:border-indigo-500'}`}
                        >
                            <div className="aspect-[9/16] bg-black relative">
                                {template.image_url ? (
                                    <img
                                        src={template.image_url}
                                        alt={template.name}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-900/20"></div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                                    {isLocked ? (
                                        <div className="text-center px-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                                                <span className="text-3xl">🔒</span>
                                            </div>
                                            <p className="text-white font-black uppercase tracking-widest text-sm">Locked</p>
                                            <p className="text-gray-400 text-[10px] mt-1">Delete active menu to change</p>
                                        </div>
                                    ) : isActive ? (
                                        <div className="text-center px-4">
                                            <div className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto border border-green-500/30">
                                                <span className="text-3xl text-green-500">✓</span>
                                            </div>
                                            <p className="text-green-500 font-black uppercase tracking-widest text-sm">Active Template</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <span className="text-4xl">{template.icon || '🍽️'}</span>
                                            </div>
                                            <button className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/40">
                                                Select Template
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Label */}
                                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{template.icon || '🍽️'}</span>
                                        <div>
                                            <h3 className="text-white font-black text-xl uppercase tracking-tight">{template.name}</h3>
                                            <p className="text-gray-300 text-xs font-medium">{template.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {templates.length === 0 && !isLoadingTemplates && (
                    <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                        <div className="text-4xl mb-4 opacity-50">📋</div>
                        <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase">No Templates Available</h3>
                        <p className="text-gray-400">There are no templates deployed for your {userPlan} plan yet.</p>
                    </div>
                )}
            </div>

            <TemplateEditorModal
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false)
                    setEditingMenu(null)
                    setSelectedTemplate(null)
                }}
                templateType={selectedTemplate || 'tacos'}
                initialData={editingMenu}
                onSave={handleSaveMenu}
                restaurantName={user.restaurant_name}
            />
        </div>
    )
}

export default MenuManagement
