import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const IntegrationSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('pos');
    const [settings, setSettings] = useState({
        pos_provider: 'custom',
        pos_enabled: false,
        pos_webhook_url: '',
        pos_api_key: '',
        stock_provider: 'custom',
        stock_enabled: false,
        stock_sync_url: '',
        stock_api_key: ''
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

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/update-integration-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Integration Settings</h2>

            <div className="flex space-x-4 mb-8 border-b dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('pos')}
                    className={`pb-4 px-4 font-semibold transition-colors ${activeTab === 'pos' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    POS Integration
                </button>
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`pb-4 px-4 font-semibold transition-colors ${activeTab === 'stock' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Stock Management
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {activeTab === 'pos' ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Enable POS Integration</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sync orders with your external POS system</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.pos_enabled}
                                    onChange={(e) => setSettings({ ...settings, pos_enabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">POS Provider</label>
                                <select
                                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    value={settings.pos_provider}
                                    onChange={(e) => setSettings({ ...settings, pos_provider: e.target.value })}
                                >
                                    <option value="custom">Custom Webhook</option>
                                    <option value="clover">Clover (Coming Soon)</option>
                                    <option value="toast">Toast (Coming Soon)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook URL</label>
                                <input
                                    type="url"
                                    placeholder="https://your-pos.com/api/webhook"
                                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    value={settings.pos_webhook_url || ''}
                                    onChange={(e) => setSettings({ ...settings, pos_webhook_url: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key / Token</label>
                                <input
                                    type="password"
                                    placeholder="Enter your POS API Key"
                                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    value={settings.pos_api_key || ''}
                                    onChange={(e) => setSettings({ ...settings, pos_api_key: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Enable Stock Management</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Keep inventory in sync with external tools</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.stock_enabled}
                                    onChange={(e) => setSettings({ ...settings, stock_enabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Provider</label>
                                <select
                                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    value={settings.stock_provider}
                                    onChange={(e) => setSettings({ ...settings, stock_provider: e.target.value })}
                                >
                                    <option value="custom">Custom Integration</option>
                                    <option value="marketman">MarketMan (Coming Soon)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sync Endpoint (Fetch)</label>
                                <input
                                    type="url"
                                    placeholder="https://your-inventory.com/api/stock"
                                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    value={settings.stock_sync_url || ''}
                                    onChange={(e) => setSettings({ ...settings, stock_sync_url: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock API Key</label>
                                <input
                                    type="password"
                                    placeholder="Enter your Stock API Key"
                                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                    value={settings.stock_api_key || ''}
                                    onChange={(e) => setSettings({ ...settings, stock_api_key: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Integration Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IntegrationSettings;
