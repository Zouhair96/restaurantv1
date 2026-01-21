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
        stock_api_key: '',
        stripe_onboarding_complete: false,
        owed_commission_balance: 0
    });
    const [apiKeys, setApiKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [lastGeneratedKey, setLastGeneratedKey] = useState(null);
    const [testingPos, setTestingPos] = useState(false);
    const [testResult, setTestResult] = useState(null);

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


    const handleTestConnection = async () => {
        if (!settings.pos_webhook_url) return alert('Please enter a Webhook URL first');
        setTestingPos(true);
        setTestResult(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/test-pos-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pos_webhook_url: settings.pos_webhook_url,
                    pos_api_key: settings.pos_api_key,
                    pos_provider: settings.pos_provider
                })
            });
            const data = await response.json();
            if (response.ok) {
                setTestResult({ success: true, message: data.message });
            } else {
                setTestResult({ success: false, message: data.error || data.details || 'Test failed' });
            }
        } catch (error) {
            setTestResult({ success: false, message: 'Connection error' });
        } finally {
            setTestingPos(false);
            setTimeout(() => setTestResult(null), 5000);
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
                    onClick={() => setActiveTab('payments')}
                    className={`pb-4 px-4 font-semibold transition-colors ${activeTab === 'payments' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    Payments & Commission
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

                        <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700 mt-4">
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={testingPos || !settings.pos_webhook_url}
                                className={`flex-1 py-3 px-6 rounded-xl font-black text-[11px] uppercase tracking-[0.1em] shadow-lg transition-all border-2 ${testResult?.success ? 'bg-green-500 border-green-500 text-white shadow-green-500/20' :
                                    testResult?.success === false ? 'bg-red-500 border-red-500 text-white shadow-red-500/20' :
                                        'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:text-yum-primary hover:border-yum-primary'
                                    } disabled:opacity-50`}
                            >
                                {testingPos ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-3 w-3 text-current" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Testing...
                                    </span>
                                ) : testResult ? (
                                    <span>{testResult.message}</span>
                                ) : (
                                    'Test Connection'
                                )}
                            </button>
                            <div className="text-[10px] text-gray-400 font-medium max-w-[180px] leading-tight italic">
                                Heads up: We'll send a dummy order to verify your URL is reachable.
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'payments' ? (
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
                                            onClick={async () => {
                                                const token = localStorage.getItem('token');
                                                const res = await fetch('/.netlify/functions/stripe-onboarding', {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                const data = await res.json();
                                                if (data.url) window.location.href = data.url;
                                            }}
                                            className="text-white/70 hover:text-white underline text-sm font-medium"
                                        >
                                            Manage Account
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const token = localStorage.getItem('token');
                                            const res = await fetch('/.netlify/functions/stripe-onboarding', {
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            const data = await res.json();
                                            if (data.url) window.location.href = data.url;
                                        }}
                                        className="px-8 py-4 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95"
                                    >
                                        Connect existing Stripe account
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
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full text-white">2% Rate</span>
                                </div>
                                <div className="text-3xl font-black text-gray-900 dark:text-white">Applied Automatically</div>
                                <p className="text-sm text-gray-500 mt-2">Taken by Stripe from every online payment.</p>
                            </div>

                            <div className="bg-white dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-yellow-500 uppercase text-xs tracking-widest">Cash Order Debt</h4>
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="text-3xl font-black text-gray-900 dark:text-white">${settings.owed_commission_balance?.toFixed(2)}</div>
                                <p className="text-sm text-gray-500 mt-2">Commission due for orders paid in cash.</p>
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

                {
                    activeTab !== 'api' && (
                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Integration Settings'}
                            </button>
                        </div>
                    )
                }
            </form >

            {/* API Key Reveal Modal */}
            {
                showKeyModal && (
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
                )
            }

        </div >
    );
};

export default IntegrationSettings;
