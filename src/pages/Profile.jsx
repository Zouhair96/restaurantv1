import React, { useState, useEffect } from 'react'
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
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Pro Analytics</h2>
                    <p className="text-gray-400 text-sm">Sales predictions powered by local data & AI.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-300 border border-gray-700">Last 24h</span>
                    <span className="px-3 py-1 bg-yum-primary/20 rounded-lg text-xs text-yum-primary border border-yum-primary/50 font-bold">Next 24h (Predicted)</span>
                </div>
            </div>

            {/* Smart Insights Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weather Widget */}
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/20 transition-colors"></div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Tonight's Forecast</p>
                        <h3 className="text-2xl font-bold text-white mt-1">Heavy Rain</h3>
                        <p className="text-blue-400 text-sm mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +15% Delivery Demand
                        </p>
                    </div>
                    <div className="relative z-10 text-5xl">
                        🌧️
                    </div>
                </div>

                {/* Event Widget */}
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-purple-900/20 transition-colors"></div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Local Event</p>
                        <h3 className="text-2xl font-bold text-white mt-1">Jazz Concert</h3>
                        <p className="text-purple-400 text-sm mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +30% Walk-ins (20:00)
                        </p>
                    </div>
                    <div className="relative z-10 text-5xl">
                        🎷
                    </div>
                </div>

                {/* Overall Prediction */}
                <div className="bg-gradient-to-br from-yum-primary to-orange-600 rounded-2xl p-5 text-white flex flex-col justify-center items-center text-center shadow-lg shadow-yum-primary/20">
                    <p className="text-xs uppercase tracking-widest font-bold text-white/80">Predicted Revenue</p>
                    <h3 className="text-4xl font-black mt-1">$3,250</h3>
                    <p className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full mt-2">+18% vs Last Friday</p>
                </div>
            </div>

            {/* Sales Graph */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Hourly Sales Prediction</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {[30, 45, 35, 60, 80, 100, 70, 50, 40, 60, 90, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20">
                                {12 + i}:00 - ${h * 30}
                            </div>
                            <div
                                className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${i > 7 ? 'bg-yum-primary border-t-2 border-white/50 pattern-diagonal-lines' : 'bg-gray-700'}`}
                                style={{ height: `${h}%` }}
                            ></div>
                            <span className="text-xs text-gray-500 font-medium">{12 + i}:00</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    // Dynamic Menu Templates State
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [isEditorOpen, setIsEditorOpen] = useState(false)

    const renderDynamicMenu = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-white mb-2">
                <div>
                    <h2 className="text-2xl font-bold">Digital Menu Templates</h2>
                    <p className="text-gray-400 text-sm">Select a creative video template for your restaurant displays.</p>
                </div>
                {selectedTemplate && (
                    <button
                        onClick={() => setSelectedTemplate(null)}
                        className="text-sm text-yum-primary hover:text-white transition-colors"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            {/* Saved Menus List */}
            {savedMenus.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Your Saved Menus</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedMenus.map(menu => (
                            <div key={menu.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-yum-primary transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-white text-lg">{menu.name}</h4>
                                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded capitalize">{menu.template_type}</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">Last updated: {new Date(menu.updated_at).toLocaleDateString()}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditMenu(menu)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteMenu(menu.id, e)}
                                        className="px-3 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tacos Template */}
                <div
                    onClick={() => {
                        setSelectedTemplate('tacos')
                        setEditingMenu(null)
                        setIsEditorOpen(true)
                    }}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${selectedTemplate === 'tacos' ? 'ring-4 ring-yum-primary scale-105' : 'hover:scale-105 hover:shadow-2xl'}`}
                >
                    <div className="aspect-[9/16] bg-black relative">
                        <img
                            src={tacosTemplate}
                            alt="Tacos Menu Template"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
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
                    onClick={() => {
                        setSelectedTemplate('pizza')
                        setEditingMenu(null)
                        setIsEditorOpen(true)
                    }}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${selectedTemplate === 'pizza' ? 'ring-4 ring-yum-primary scale-105' : 'hover:scale-105 hover:shadow-2xl'}`}
                >
                    <div className="aspect-[9/16] bg-black relative">
                        <img
                            src={pizzaTemplate}
                            alt="Pizza Menu Template"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="text-white font-bold text-lg">Pizza Party</h3>
                            <p className="text-gray-300 text-xs">Cozy • Warm • Cinematic</p>
                        </div>
                    </div>
                </div>

                {/* Salad Template */}
                <div
                    onClick={() => {
                        setSelectedTemplate('salad')
                        setEditingMenu(null)
                        setIsEditorOpen(true)
                    }}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${selectedTemplate === 'salad' ? 'ring-4 ring-yum-primary scale-105' : 'hover:scale-105 hover:shadow-2xl'}`}
                >
                    <div className="aspect-[9/16] bg-black relative">
                        <img
                            src={saladTemplate}
                            alt="Salad Menu Template"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="text-white font-bold text-lg">Fresh & Green</h3>
                            <p className="text-gray-300 text-xs">Clean • Modern • Bright</p>
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
                <div className="md:col-span-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yum-primary/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-yum-primary/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
                            <p className="text-gray-400 text-sm">“Restaurant Health” Widget: Overall rating (⭐️/5) based on sales, customer reviews, and preparation time.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">4.8</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Excellent</span>
                            </div>
                            <div className="h-16 w-16 relative">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#374151" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="96, 100" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-red-900/30 transition-colors group">
                    <div className="p-3 bg-red-500/20 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold">Emergency Mode</h3>
                    <p className="text-xs text-red-300 mt-1">Activate for Rush Hour 2x boost</p>
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
                    <h2 className="text-2xl font-bold text-white">Team Management</h2>
                    <p className="text-gray-400 text-sm">Manage your restaurant staff, roles, and shifts.</p>
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
                    <h2 className="text-2xl font-bold text-white">Automated Promotions</h2>
                    <p className="text-gray-400 text-sm">Create marketing campaigns to boost traffic.</p>
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Management</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-bold text-gray-800">Current Plan: <span className="text-yum-primary">{user.subscription_plan || 'Pro'}</span></p>
                        <p className="text-xs text-green-600 font-bold uppercase mt-1">Active</p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to the dashboard immediately.")) {
                                handleUnsubscribe();
                            }
                        }}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold transition-all"
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
