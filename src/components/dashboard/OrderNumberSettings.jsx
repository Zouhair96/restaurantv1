import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const OrderNumberSettings = () => {
    const { user } = useAuth();
    const [config, setConfig] = useState({
        starting_number: 1,
        reset_period: 'never',
        weekly_start_day: 1
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/get-order-number-config', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.config) {
                setConfig({
                    starting_number: data.config.starting_number || 1,
                    reset_period: data.config.reset_period || 'never',
                    weekly_start_day: data.config.weekly_start_day || 1
                });
            }
        } catch (error) {
            console.error('Error fetching order number config:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/.netlify/functions/update-order-number-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Order numbering settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.error || 'Failed to save settings');
            }
        } catch (error) {
            setMessage('Error saving settings');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📋 Order Numbering
            </h3>

            <div className="space-y-4">
                {/* Starting Number */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Starting Order Number
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={config.starting_number}
                        onChange={(e) => setConfig({ ...config, starting_number: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 1 or 100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Orders will start from this number (and reset to this number based on your reset period)
                    </p>
                </div>

                {/* Reset Period */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Reset Period
                    </label>
                    <select
                        value={config.reset_period}
                        onChange={(e) => setConfig({ ...config, reset_period: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="never">Never (Continuous)</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {config.reset_period === 'never' && 'Order numbers will continue incrementing forever'}
                        {config.reset_period === 'daily' && 'Order numbers reset to starting number each day'}
                        {config.reset_period === 'weekly' && 'Order numbers reset to starting number each week'}
                        {config.reset_period === 'monthly' && 'Order numbers reset to starting number each month'}
                    </p>
                </div>

                {/* Weekly Start Day (only show if weekly reset) */}
                {config.reset_period === 'weekly' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Week Starts On
                        </label>
                        <select
                            value={config.weekly_start_day}
                            onChange={(e) => setConfig({ ...config, weekly_start_day: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="0">Sunday</option>
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3">Wednesday</option>
                            <option value="4">Thursday</option>
                            <option value="5">Friday</option>
                            <option value="6">Saturday</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Order numbers will reset on this day each week
                        </p>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Save Order Settings'}
                </button>

                {/* Success/Error Message */}
                {message && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('success')
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderNumberSettings;
