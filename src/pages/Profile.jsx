import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import MainLayout from '../layouts/MainLayout'
import OrderGrid from '../components/dashboard/OrderGrid'
import DashboardWidgets from '../components/dashboard/DashboardWidgets'
import UserProfileInfo from '../components/subscription/UserProfileInfo'
import SubscriptionPlans from '../components/subscription/SubscriptionPlans'
import OnboardingOverlay from '../components/dashboard/OnboardingOverlay'
import TeamMemberCard from '../components/dashboard/TeamMemberCard'
import AddMemberModal from '../components/dashboard/AddMemberModal'
import PromotionCard from '../components/dashboard/PromotionCard'
import CreatePromoModal from '../components/dashboard/CreatePromoModal'
import TemplateEditorModal from '../components/dashboard/TemplateEditorModal'
import { fetchMenus, createMenu, updateMenu, deleteMenu } from '../utils/menus'

// Assets
import tacosTemplate from '../assets/tacos_template.png'
import pizzaTemplate from '../assets/pizza_template.png'
import saladTemplate from '../assets/salad_template.png'

const Profile = () => {
    const { user, loading, unsubscribe } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [activeModule, setActiveModule] = useState('dashboard')
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [showAddMemberModal, setShowAddMemberModal] = useState(false)
    const [showPromoModal, setShowPromoModal] = useState(false)

    // Menus State
    const [savedMenus, setSavedMenus] = useState([])
    const [editingMenu, setEditingMenu] = useState(null)
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [isEditorOpen, setIsEditorOpen] = useState(false)

    useEffect(() => {
        loadMenus()
    }, [user])

    const loadMenus = async () => {
        if (!user) return
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

    // Mock Team Data State
    const [teamMembers, setTeamMembers] = useState([
        { id: 1, name: 'Alex Rivera', role: 'Head Chef', status: 'On Shift', hours: 42, sales: 0 },
        { id: 2, name: 'Sarah Chen', role: 'Manager', status: 'On Shift', hours: 38, sales: 0 },
        { id: 3, name: 'Mike Johnson', role: 'Server', status: 'On Shift', hours: 25, sales: 1250 },
        { id: 4, name: 'Emily Davis', role: 'Bartender', status: 'Off Duty', hours: 30, sales: 850 },
    ])

    // Mock Promotions Data
    const [promotions, setPromotions] = useState([
        { id: 1, name: 'Weekend Happy Hour', type: 'SMS', status: 'Active', sent: 1250, openRate: 98, roi: 4.5, date: 'Ends Sunday' },
        { id: 2, name: 'New Menu Launch', type: 'Email', status: 'Scheduled', sent: 0, openRate: 0, roi: 0, date: 'Starts Nov 15' },
        { id: 3, name: 'Halloween Special', type: 'Push', status: 'Ended', sent: 5000, openRate: 45, roi: 3.2, date: 'Oct 31' },
    ])

    // Check if user has an active subscription
    const hasSubscription = user?.subscription_status === 'active'

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('onboarding') === 'true') {
            setShowOnboarding(true)
            // Clean URL
            navigate('/profile', { replace: true })
        }
    }, [location, navigate])

    const handleSubscribe = (plan) => {
        // Navigate to checkout with full plan details
        navigate('/checkout', { state: { plan } })
    }

    const handleUnsubscribe = async () => {
        try {
            await unsubscribe()
            // State update will trigger re-render and show Plans view
        } catch (error) {
            console.error(error)
            alert('Failed to unsubscribe: ' + error.message)
        }
    }

    const handleCloseOnboarding = () => {
        setShowOnboarding(false)
    }

    // Team Management Handlers
    const handleAddMember = (newMember) => {
        const memberWithId = {
            ...newMember,
            id: Date.now(), // Simple ID generation
            status: 'Off Duty',
            hours: 0,
            sales: 0
        }
        setTeamMembers([...teamMembers, memberWithId])
        setShowAddMemberModal(false)
    }

    const handleRemoveMember = (id) => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            setTeamMembers(teamMembers.filter(m => m.id !== id))
        }
    }

    // Promo Handlers
    const handleCreatePromo = (newPromo) => {
        const promoWithId = {
            ...newPromo,
            id: Date.now(),
            status: 'Scheduled',
            sent: 0,
            openRate: 0,
            roi: 0,
            date: 'Just Created'
        }
        setPromotions([promoWithId, ...promotions])
        setShowPromoModal(false)
    }

    // Loading state
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-yum-dark text-white">Loading...</div>
    }

    if (!user) {
        return (
            <MainLayout>
                <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Please log in to view your profile
                        </h2>
                        <div className="mt-8 text-center">
                            <Link to="/login" className="font-medium text-yum-primary hover:text-red-500">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    // If user is not subscribed, show Profile Info & Plans
    if (!hasSubscription) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <UserProfileInfo user={user} />
                    <SubscriptionPlans onSubscribe={handleSubscribe} />
                </div>
            </MainLayout>
        )
    }

    // --- Dashboard Views ---

    const renderAnalytics = () => (
        <div className="space-y-8">
            {/* Top Section: Overview & Main Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Overview Chart Card (Purple Gradient) */}
                <div className="lg:col-span-2 bg-[#6c5ce7] bg-gradient-to-br from-[#6c5ce7] to-[#8e44ad] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-purple-200 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10 flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-1">Overview</h2>
                            <p className="text-purple-200">Monthly Sales Performance</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                            Monthly ▼
                        </div>
                    </div>

                    {/* Fake Chart Visualization */}
                    <div className="h-64 flex items-end justify-between gap-3 px-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div
                                    className="w-full bg-white/20 rounded-full relative group transition-all duration-300 hover:bg-white/40"
                                    style={{ height: `${h}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                                        ${h * 50}
                                    </div>

                                    {/* Top Dot */}
                                    {i === 11 && (
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                    )}
                                </div>
                                <span className="text-xs text-purple-200 font-medium">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats Summary Bubble */}
                    <div className="mt-8 flex gap-4">
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5 dark:border-white/10">
                            <p className="text-purple-200 text-xs uppercase tracking-wider mb-1">Total Sales</p>
                            <h3 className="text-2xl font-bold">748 Hrs</h3>
                        </div>
                        <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
                            <p className="text-white text-xs uppercase tracking-wider mb-1">Total Orders</p>
                            <h3 className="text-3xl font-black">9,178</h3>
                        </div>
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5 dark:border-white/10">
                            <p className="text-purple-200 text-xs uppercase tracking-wider mb-1">Target</p>
                            <h3 className="text-2xl font-bold">9.2k</h3>
                        </div>
                    </div>
                </div>

                {/* Right Column Widgets */}
                <div className="flex flex-col gap-6">
                    {/* Daily Stats (Purple Blue) */}
                    <div className="bg-[#6c5ce7] rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">
                                👟
                            </div>
                            <div className="text-right">
                                <h3 className="text-xl font-bold">Daily Jogging</h3>
                                <p className="text-indigo-200 text-sm">2km today</p>
                            </div>
                        </div>
                    </div>

                    {/* My Jogging (Pink) */}
                    <div className="flex-1 bg-[#fd79a8] bg-gradient-to-br from-[#fd79a8] to-[#e84393] rounded-[2rem] p-6 text-white shadow-xl shadow-pink-200 relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
                                    🏃
                                </div>
                                <h3 className="text-xl font-bold">My Jogging</h3>
                            </div>

                            <div className="mt-8">
                                <p className="text-pink-100 text-xs uppercase font-bold">Total Time</p>
                                <div className="flex justify-between items-end">
                                    <h2 className="text-4xl font-bold">748 hr</h2>
                                    <button className="w-10 h-10 rounded-full bg-white text-pink-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Info Cards (White glass) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Bicycle Drill", subtitle: "36 km / week", icon: "🚴", color: "text-indigo-500", progress: 45 },
                    { title: "Jogging Hero", subtitle: "12 km / month", icon: "🏃", color: "text-pink-500", progress: 13 },
                    { title: "Healthy Busy", subtitle: "3600 steps", icon: "🧘", color: "text-purple-500", progress: 90 },
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-lg shadow-gray-100 dark:shadow-none border border-gray-50 dark:border-gray-700 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-16 h-16 rounded-2xl bg-${item.color.split('-')[1]}-50 dark:bg-${item.color.split('-')[1]}-900/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 text-shadow-sm`}>
                            {item.icon}
                        </div>
                        <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg">{item.title}</h3>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">{item.subtitle}</p>

                        <div className="w-full mt-auto">
                            <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">
                                <span>Progress</span>
                                <span>{item.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-${item.color.split('-')[1]}-500 transition-all duration-1000 ease-out`}
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex justify-between w-full mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                            <span className="text-xs text-gray-400 dark:text-gray-500">17 / 30km</span>
                            <span className="text-xs font-bold text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-md">2 days left</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const hasMenu = savedMenus.length > 0

    const renderDynamicMenu = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-gray-900 dark:text-white mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Digital Menu Templates</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Select a template to create your restaurant's menu.</p>
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
                                                savedMenus[0].template_type === 'pizza' ? '🍕' : '🍽️'}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tacos Template */}
                <div
                    onClick={() => {
                        if (hasMenu) return
                        setSelectedTemplate('tacos')
                        setEditingMenu(null)
                        setIsEditorOpen(true)
                    }}
                    className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border-2 ${hasMenu
                        ? 'cursor-not-allowed opacity-40 grayscale border-transparent'
                        : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02] border-transparent hover:border-yum-primary'}`}
                >
                    <div className="aspect-[9/16] bg-black relative">
                        <img
                            src={tacosTemplate}
                            alt="Tacos Menu Template"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                            {hasMenu ? (
                                <div className="text-center px-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                                        <span className="text-3xl text-gray-500">🔒</span>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-1">Locked</p>
                                    <p className="text-gray-400 text-xs">Delete current menu to unlock</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="text-3xl">🌮</span>
                                    </div>
                                    <button className="px-6 py-2 bg-yum-primary text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                        Create This Menu
                                    </button>
                                </>
                            )}
                        </div>
                        {/* Label */}
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="text-white font-bold text-lg">Tacos Edition</h3>
                            <p className="text-gray-300 text-xs">Dynamic • High Energy</p>
                        </div>
                    </div>
                </div>

                {/* Pizza Template */}
                <div
                    className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border-2 border-transparent cursor-not-allowed opacity-60 grayscale`}
                >
                    <div className="aspect-[9/16] bg-black relative">
                        <img
                            src={pizzaTemplate}
                            alt="Pizza Menu Template"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                            <div className="w-16 h-16 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center mb-4">
                                <span className="text-3xl grayscale">🍕</span>
                            </div>
                            <p className="text-white font-black text-xl mb-1 uppercase tracking-tighter">Coming Soon</p>
                            <p className="text-gray-400 text-xs font-bold px-4 py-1 bg-gray-900/80 rounded-full border border-gray-700">Not yet developed</p>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="text-white font-bold text-lg">Pizza Party</h3>
                            <p className="text-gray-300 text-xs text-yum-primary font-bold">DEVELOPMENT IN PROGRESS</p>
                        </div>
                    </div>
                </div>

                {/* Other Template (formerly Salad) */}
                <div
                    className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border-2 border-transparent cursor-not-allowed opacity-60 grayscale`}
                >
                    <div className="aspect-[9/16] bg-black relative">
                        <img
                            src={saladTemplate}
                            alt="Other Menu Template"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                            <div className="w-16 h-16 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center mb-4">
                                <span className="text-3xl grayscale">🍽️</span>
                            </div>
                            <p className="text-white font-black text-xl mb-1 uppercase tracking-tighter">Coming Soon</p>
                            <p className="text-gray-400 text-xs font-bold px-4 py-1 bg-gray-900/80 rounded-full border border-gray-700">Not yet developed</p>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="text-white font-bold text-lg">Other / Custom</h3>
                            <p className="text-gray-300 text-xs text-yum-primary font-bold">DEVELOPMENT IN PROGRESS</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )

    const renderDashboardOverview = () => (
        <div className="space-y-8">
            {/* Health Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 bg-[#6c5ce7] bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] rounded-[2rem] p-8 border border-white/20 relative overflow-hidden group shadow-xl shadow-purple-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Restaurant Health</h2>
                            <p className="text-purple-100 text-sm max-w-md">Your overall rating based on sales performance, customer reviews, and preparation time efficiency.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className="block text-5xl font-black text-white">4.8</span>
                                <span className="text-xs font-bold text-purple-200 uppercase tracking-widest">Excellent</span>
                            </div>
                            <div className="h-20 w-20 relative">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="96, 100" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700 group">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                        <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-bold text-lg">Emergency Mode</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Activate for Rush Hour 2x</p>
                </div>
            </div>

            {/* Main Order Area */}
            <OrderGrid />
        </div>
    )

    const renderTeam = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your restaurant staff, roles, and shifts.</p>
                </div>
                <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 bg-yum-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500 transition-colors border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamMembers.map(member => (
                    <TeamMemberCard key={member.id} member={member} onRemove={handleRemoveMember} />
                ))}
            </div>
        </div>
    )

    const renderPromos = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automated Promotions</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Create marketing campaigns to boost traffic.</p>
                </div>
                <button
                    onClick={() => setShowPromoModal(true)}
                    className="flex items-center gap-2 bg-yum-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500 transition-colors border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map(promo => (
                    <PromotionCard key={promo.id} promo={promo} />
                ))}
            </div>
        </div>
    )

    const renderSettings = () => (
        <div className="space-y-6">
            {/* Account Settings Placeholder */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h2>
                <p className="text-gray-500 text-sm">Update your personal details and password.</p>
                {/* Inputs would go here */}
            </div>

            {/* Subscription Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Subscription Management</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">Current Plan: <span className="text-yum-primary">{user.subscription_plan || 'Pro'}</span></p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mt-1">Active</p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to the dashboard immediately.")) {
                                handleUnsubscribe();
                            }
                        }}
                        className="px-4 py-2 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold transition-all"
                    >
                        Cancel Subscription
                    </button>
                </div>
            </div>
        </div>
    )

    const renderContent = () => {
        switch (activeModule) {
            case 'dashboard':
                return renderDashboardOverview()
            case 'menu':
                return renderDynamicMenu()
            case 'analytics':
                return renderAnalytics()
            case 'team':
                return renderTeam()
            case 'promos':
                return renderPromos()
            case 'settings':
                return renderSettings()
            default:
                return renderDashboardOverview()
        }
    }

    const isAnyModalOpen = showOnboarding || showAddMemberModal || showPromoModal || isEditorOpen

    return (
        <>
            {/* Modals - Placed outside layout to avoid blur inheritance */}
            {showOnboarding && <OnboardingOverlay onClose={handleCloseOnboarding} />}
            <AddMemberModal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} onAdd={handleAddMember} />
            <CreatePromoModal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} onCreate={handleCreatePromo} />

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

            <DashboardLayout
                rightPanel={<DashboardWidgets />}
                activeModule={activeModule}
                onModuleChange={setActiveModule}
                isBlurred={isAnyModalOpen}
            >
                {renderContent()}
            </DashboardLayout>
        </>
    )
}

export default Profile
