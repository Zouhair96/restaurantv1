import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const PaymentSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        stripe_onboarding_complete: false,
        owed_commission_balance: 0
    });

    useEffect(() => {
        if (user?.id) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/.netlify/functions/get-integration-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Payment Settings</h2>

            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">💳</div>
                            <h3 className="text-2xl font-bold">Stripe Payments</h3>
                        </div>
                        <p className="text-blue-100 max-w-md mb-8">
                            Connect your existing Stripe account to receive 98% of online orders directly to your bank.
                        </p>

                        {settings.stripe_onboarding_complete ? (
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-green-400/20 border border-green-400/30 rounded-lg text-green-300 font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Connected
                                </div>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={async () => {
                                        try {
                                            setSaving(true);
                                            const token = localStorage.getItem('token');
                                            const res = await fetch('/.netlify/functions/stripe-onboarding', {
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            const data = await res.json();
                                            if (data.url) {
                                                window.location.href = data.url;
                                            } else {
                                                alert('Could not open Stripe management: ' + (data.error || 'Unknown error'));
                                            }
                                        } catch (err) {
                                            alert('Error connecting to server.');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    className="text-white/70 hover:text-white underline text-sm font-medium disabled:opacity-50"
                                >
                                    {saving ? 'Connecting...' : 'Manage Account'}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={async () => {
                                    try {
                                        setSaving(true);
                                        const token = localStorage.getItem('token');
                                        const res = await fetch('/.netlify/functions/stripe-onboarding', {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        const data = await res.json();

                                        if (data.url) {
                                            window.location.href = data.url;
                                        } else {
                                            console.error('Stripe error:', data);
                                            alert('Could not start onboarding: ' + (data.error || 'Unknown error'));
                                        }
                                    } catch (err) {
                                        console.error('Onboarding click error:', err);
                                        alert('Connection error. Please try again.');
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                className="px-8 py-4 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? 'Loading...' : 'Connect existing Stripe account'}
                            </button>
                        )}
                    </div>
                    <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest">Platform Commission</h4>
                            <span className="px-2 py-1 bg-yum-primary/10 text-yum-primary text-[10px] font-black rounded-full">2% Rate</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white">Applied Automatically</div>
                        <p className="text-sm text-gray-500 mt-2">Taken by Stripe from every online payment.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-yellow-500 uppercase text-xs tracking-widest">Cash Order Debt</h4>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{Number(settings.owed_commission_balance || 0).toFixed(2)}€</div>
                        <p className="text-sm text-gray-500 mt-2">Commission due for orders paid in cash.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSettings;
