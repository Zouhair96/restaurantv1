import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import SubscriptionPlans from '../../components/subscription/SubscriptionPlans'
import OrderNumberSettings from '../../components/dashboard/OrderNumberSettings'

const Settings = () => {
    const { user, updateUser, subscribe, unsubscribe } = useAuth()
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

    const handleSubscribe = async (planName) => {
        const PLAN_RANKS = { 'Starter': 1, 'Pro': 2, 'Enterprise': 3 };
        const currentPlanRank = PLAN_RANKS[user?.subscription_plan] || 0;
        const newPlanRank = PLAN_RANKS[planName] || 0;

        let confirmationMessage = '';
        if (newPlanRank > currentPlanRank) {
            confirmationMessage = `You are upgrading to ${planName}. This will PRESERVE your current engagement end date. Do you want to proceed?`;
        } else if (newPlanRank < currentPlanRank) {
            confirmationMessage = `You are downgrading to ${planName}. This will RESET your engagement period to 12 months starting from today. Do you want to proceed?`;
        } else {
            confirmationMessage = `Do you want to switch to the ${planName} plan?`;
        }

        if (!window.confirm(confirmationMessage)) return;

        try {
            await subscribe(planName)
            alert('Subscription updated successfully!')
        } catch (error) {
            console.error(error)
            alert('Failed to update subscription: ' + error.message)
        }
    }

    const handleUnsubscribe = async () => {
        try {
            await unsubscribe()
        } catch (error) {
            console.error(error)
            const message = error.message.includes('engagement')
                ? error.message
                : 'Failed to unsubscribe: ' + error.message;
            alert(message)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Account Settings</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Manage your personal information and restaurant details.</p>
            </div>

            {/* Order Numbering Settings */}
            <OrderNumberSettings />

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
}

export default Settings
