import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
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
                                                    ['s1', 's2', 'p1', 'p2', 'p3'].includes(savedMenus[0].template_type) ? (templateConfig.starter.concat(templateConfig.pro).find(t => t.id === savedMenus[0].template_type)?.icon || '🍽️') : '🍽️'}
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
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="group bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl border border-white dark:border-white/5 hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6 relative">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-3xl shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                                {template.icon || '🍽️'}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight uppercase">{template.name}</h2>
                                <span className="text-xs text-gray-400 font-medium">Template Active</span>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="h-40 bg-gray-50 dark:bg-black/20 rounded-2xl mb-6 border border-gray-100 dark:border-white/5 overflow-hidden flex items-center justify-center relative">
                            {template.image_url ? (
                                <img src={template.image_url} alt={template.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            ) : (
                                <div className="absolute inset-0 bg-indigo-500/5"></div>
                            )}
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <span className="p-3 bg-white/80 dark:bg-black/50 rounded-full backdrop-blur-md shadow-lg text-indigo-600 scale-90 group-hover:scale-100 transition-transform">
                                    <QRCodeSVG value={`${window.location.origin}/${user.restaurant_name}`} size={60} />
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={`${window.location.origin}/${user.restaurant_name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    👁️ Show
                                </a>
                                <Link
                                    to={`/manage_menu_${template.template_key}`}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-all border border-gray-100 dark:border-white/10 shadow-sm"
                                >
                                    ⚙️ Manage
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

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
