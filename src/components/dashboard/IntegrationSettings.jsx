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
    const [apiKeys, setApiKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [lastGeneratedKey, setLastGeneratedKey] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchSettings();
            fetchApiKeys();
        }
    }, [user]);

    const fetchApiKeys = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/.netlify/functions/api-keys`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApiKeys(data);
            }
        } catch (error) {
            console.error('Error fetching API keys:', error);
        }
    };

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
                <button
                    onClick={() => setActiveTab('api')}
                    className={`pb-4 px-4 font-semibold transition-colors ${activeTab === 'api' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    API Access
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
                ) : activeTab === 'stock' ? (
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
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-1">Developer API Access</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Use these keys to connect your custom POS or third-party tools to our API.</p>
                            </div>
                            <a
                                href="/dashboard/developer"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow transition-colors"
                            >
                                View Documentation &rarr;
                            </a>
                        </div>

                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Key Name (e.g. Kitchen Tablet)"
                                className="flex-1 p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary text-gray-900 dark:text-white"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!newKeyName) return alert('Please enter a key name');
                                    const token = localStorage.getItem('token');
                                    const response = await fetch('/.netlify/functions/api-keys', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ key_name: newKeyName })
                                    });
                                    if (response.ok) {
                                        const data = await response.json();
                                        setLastGeneratedKey(data.key);
                                        setShowKeyModal(true);
                                        setNewKeyName('');
                                        fetchApiKeys();
                                    }
                                }}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Generate Key
                            </button>
                        </div>

                        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Created</th>
                                        <th className="px-4 py-3">Last Used</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {apiKeys.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No API keys generated yet.</td>
                                        </tr>
                                    ) : (
                                        apiKeys.map(key => (
                                            <tr key={key.id} className="text-gray-900 dark:text-white">
                                                <td className="px-4 py-3 font-medium">{key.key_name}</td>
                                                <td className="px-4 py-3">{new Date(key.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">{key.last_used ? new Date(key.last_used).toLocaleTimeString() : 'Never'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to revoke this key? Any system using it will be disconnected.')) {
                                                                const token = localStorage.getItem('token');
                                                                await fetch('/.netlify/functions/api-keys', {
                                                                    method: 'DELETE',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'Authorization': `Bearer ${token}`
                                                                    },
                                                                    body: JSON.stringify({ id: key.id })
                                                                });
                                                                fetchApiKeys();
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700 font-medium"
                                                    >
                                                        Revoke
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab !== 'api' && (
                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Integration Settings'}
                        </button>
                    </div>
                )}
            </form>

            {/* API Key Reveal Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your New API Key</h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-6 text-yellow-800 dark:text-yellow-300 text-sm">
                            ⚠️ <strong>Important:</strong> Copy this key now! We will not show it to you again for security reasons.
                        </div>
                        <div className="relative mb-6">
                            <input
                                type="text"
                                readOnly
                                value={lastGeneratedKey}
                                className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm pr-12"
                                id="api-key-input"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(lastGeneratedKey);
                                    alert('Key copied to clipboard!');
                                }}
                                className="absolute right-2 top-2 p-2 text-gray-500 hover:text-primary transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowKeyModal(false)}
                            className="w-full py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                        >
                            I've stored it safely
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default IntegrationSettings;
