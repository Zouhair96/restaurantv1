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
import LiveOrders from '../components/dashboard/LiveOrders'
import OrderDetailsModal from '../components/dashboard/OrderDetailsModal'
import { fetchMenus, createMenu, updateMenu, deleteMenu } from '../utils/menus'

// Assets
import tacosTemplate from '../assets/tacos_template.png'
import pizzaTemplate from '../assets/pizza_template.png'
import saladTemplate from '../assets/salad_template.png'
import s1Template from '../assets/s1_template.png'
import s2Template from '../assets/s2_template.png'
import p1Template from '../assets/p1_template.png'
import p2Template from '../assets/p2_template.png'
import p3Template from '../assets/p3_template.png'

const Profile = () => {
    const { user, loading, unsubscribe, updateUser } = useAuth()
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

    // Order Modal state
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [modalHandlers, setModalHandlers] = useState({
        onStatusUpdate: null,
        getStatusColor: null
    })

    // Activity & Settings State
    const [recentActivity, setRecentActivity] = useState([])
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        restaurantName: user?.restaurant_name || '',
        address: user?.address || '',
        phoneNumber: user?.phone_number || ''
    })

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                restaurantName: user.restaurant_name || '',
                address: user.address || '',
                phoneNumber: user.phone_number || ''
            })
        }
    }, [user])

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

    const fetchRecentActivity = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await fetch('/.netlify/functions/get-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const result = await response.json()
            if (response.ok) {
                setRecentActivity(result.orders || [])
            }
        } catch (err) {
            console.error('Error fetching activity:', err)
        }
    }

    useEffect(() => {
        if (activeModule === 'activity') {
            fetchRecentActivity()
        }
    }, [activeModule])

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

    // Check if user has an active subscription and menus
    const hasSubscription = user?.subscription_status === 'active'
    const hasMenu = savedMenus.length > 0

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('onboarding') === 'true') {
            setShowOnboarding(true)
            // Clean URL
            navigate('/profile', { replace: true })
        }
    }, [location, navigate])

    const handleSubscribe = async (planName) => {
        try {
            await subscribe(planName)
            alert('Subscription updated successfully!')
            // State update will trigger re-render
        } catch (error) {
            console.error(error)
            alert('Failed to update subscription: ' + error.message)
        }
    }

    const handleUnsubscribe = async () => {
        try {
            await unsubscribe()
            // State update will trigger re-render and show Plans view
        } catch (error) {
            console.error(error)
            // Enhanced error message for engagement restriction
            const message = error.message.includes('engagement')
                ? error.message
                : 'Failed to unsubscribe: ' + error.message;
            alert(message)
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

    // If user is not subscribed, show standard Profile Info but use standard layout
    if (!hasSubscription) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <UserProfileInfo user={user} />
                    <div className="mt-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 text-center uppercase tracking-tight">Choose Your Plan</h2>
                        <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto font-medium">
                            Join YumYum and boost your restaurant revenue.
                            <span className="block mt-2 text-xs italic">* All plans come with a 12-month engagement period. Upgrading preserves your engagement end date, while downgrading resets it to 12 months from the switch date.</span>
                        </p>
                        <SubscriptionPlans onSubscribe={(planId) => navigate('/checkout', { state: { plan: { name: planId } } })} />
                    </div>
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




    const templateConfig = {
        starter: [
            { id: 's1', name: 'Starter Template S1', image: s1Template, icon: '📄', description: 'Clean & Minimal' },
            { id: 's2', name: 'Starter Template S2', image: s2Template, icon: '✨', description: 'Modern & Vibrant' }
        ],
        pro: [
            { id: 'p1', name: 'Pro Template P1', image: p1Template, icon: '👑', description: 'Elegant & Dark' },
            { id: 'p2', name: 'Pro Template P2', image: p2Template, icon: '🌿', description: 'Fresh & Trendy' },
            { id: 'p3', name: 'Pro Template P3', image: p3Template, icon: '🏙️', description: 'Urban Street Style' }
        ],
        enterprise: [
            { id: 'tacos', name: 'Tacos Edition', image: tacosTemplate, icon: '🌮', description: 'Dynamic • High Energy' },
            { id: 'pizza', name: 'Pizza Party', image: pizzaTemplate, icon: '🍕', description: 'Full Display • Modern' },
            { id: 'other', name: 'Other / Custom', image: saladTemplate, icon: '🍽️', description: 'Versatile Layout' }
        ]
    }

    const renderDynamicMenu = () => {
        const userPlan = (user?.subscription_plan || 'starter').toLowerCase()
        const availableTemplates = templateConfig[userPlan] || templateConfig.starter

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {availableTemplates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => {
                                if (hasMenu) return
                                setSelectedTemplate(template.id)
                                setEditingMenu(null)
                                setIsEditorOpen(true)
                            }}
                            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border-2 ${hasMenu
                                ? 'cursor-not-allowed opacity-40 grayscale border-transparent'
                                : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02] border-transparent hover:border-yum-primary'}`}
                        >
                            <div className="aspect-[9/16] bg-black relative">
                                <img
                                    src={template.image}
                                    alt={template.name}
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
                                                <span className="text-3xl">{template.icon}</span>
                                            </div>
                                            <button className="px-6 py-2 bg-yum-primary text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                Create This Menu
                                            </button>
                                        </>
                                    )}
                                </div>
                                {/* Label */}
                                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                    <h3 className="text-white font-bold text-lg">{template.name}</h3>
                                    <p className="text-gray-300 text-xs">{template.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        )
    }

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

            {/* Active Menu Widget */}
            {hasMenu && savedMenus.length > 0 && (
                <div className="animate-fade-in">
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

            {/* Live Orders Section */}
            <LiveOrders onSelectOrder={(order, handler, getter) => {
                setSelectedOrder(order)
                setModalHandlers({ onStatusUpdate: handler, getStatusColor: getter })
            }} />
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

    const renderActivity = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Stay updated with everything happening in your restaurant.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white">Real-Time Feed</h3>
                    <button
                        onClick={fetchRecentActivity}
                        className="text-xs font-bold text-yum-primary hover:underline uppercase tracking-widest"
                    >
                        Refresh Feed
                    </button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, idx) => (
                            <div key={idx} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6 text-yum-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    New {activity.order_type} Order Received
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Order <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">#{activity.id.slice(0, 8)}</span> for {activity.total_amount}€
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(activity.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                                                {activity.status}
                                            </span>
                                            {activity.payment_method && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                                    {activity.payment_method}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center">
                            <p className="text-gray-400 italic">No activity recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsSavingProfile(true)
        try {
            await updateUser(profileForm)
            alert('Profile updated successfully!')
        } catch (err) {
            console.error(err)
            alert('Failed to update profile: ' + err.message)
        } finally {
            setIsSavingProfile(false)
        }
    }

    const renderSettings = () => (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Account Settings</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Manage your personal information and restaurant details.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5 space-y-4">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-yum-primary rounded-full"></span>
                            Personal Information
                        </h3>
                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yum-primary/20 transition-all"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-100 dark:bg-gray-700/50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-500 cursor-not-allowed"
                                    value={user?.email}
                                    disabled
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5 ml-1 italic">* Email cannot be changed for security reasons</p>
                            </div>
                        </div>
                    </div>

                    {/* Restaurant Info */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5 space-y-4">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-orange-400 rounded-full"></span>
                            Restaurant Details
                        </h3>
                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Restaurant Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yum-primary/20 transition-all"
                                    value={profileForm.restaurantName}
                                    onChange={(e) => setProfileForm({ ...profileForm, restaurantName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yum-primary/20 transition-all"
                                    value={profileForm.phoneNumber}
                                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address (Full Width) */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Physical Address</label>
                    <textarea
                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yum-primary/20 transition-all min-h-[100px]"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSavingProfile}
                        className={`flex items-center gap-3 bg-yum-primary text-white px-10 py-4 rounded-[2rem] font-black shadow-lg shadow-red-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100`}
                    >
                        {isSavingProfile ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving Changes...
                            </>
                        ) : (
                            'Save Profile Settings'
                        )}
                    </button>
                </div>
            </form>

            {/* Subscription Management Section */}
            <div className="pt-12 border-t border-gray-100 dark:border-white/5 space-y-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Active Plan & Subscription</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium italic">
                        * Highlighting our engagement rules: Upgrading preserves your current engagement date. Downgrading resets it to 12 months from today.
                    </p>
                </div>

                <SubscriptionPlans onSubscribe={handleSubscribe} currentPlan={user?.subscription_plan} />

                <div className="bg-gray-900 dark:bg-black/40 p-10 rounded-[3rem] text-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black text-yum-primary uppercase tracking-[0.2em] mb-2">Membership Status</p>
                            <h3 className="text-3xl font-black">{user?.subscription_plan || 'Pro'} Member</h3>
                            <div className="flex flex-col gap-1 mt-2">
                                <p className="text-gray-400 text-sm">Next billing date: {new Date().toLocaleDateString()}</p>
                                {user?.subscription_end_date && new Date(user.subscription_end_date) > new Date() && (
                                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-yum-primary/20 border border-yum-primary/30 rounded-2xl w-fit">
                                        <span className="text-xl">🔒</span>
                                        <div>
                                            <p className="text-yum-primary text-[10px] font-black uppercase tracking-widest leading-none mb-1">Active Engagement Period</p>
                                            <p className="text-white text-sm font-bold leading-none">
                                                Locked until: {new Date(user.subscription_end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to cancel? This action cannot be undone if you are under engagement.")) {
                                    handleUnsubscribe();
                                }
                            }}
                            className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                        >
                            Cancel Subscription
                        </button>
                    </div>
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
            case 'activity':
                return renderActivity()
            case 'settings':
                return renderSettings()
            default:
                return renderDashboardOverview()
        }
    }

    const isAnyModalOpen = showOnboarding || showAddMemberModal || showPromoModal || isEditorOpen || !!selectedOrder

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

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={(id, status) => {
                    if (modalHandlers.onStatusUpdate) {
                        modalHandlers.onStatusUpdate(id, status).then(updatedOrder => {
                            if (updatedOrder) {
                                setSelectedOrder(updatedOrder)
                            }
                        })
                    }
                }}
                getStatusColor={modalHandlers.getStatusColor}
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
