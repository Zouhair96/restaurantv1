import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCog6Tooth } from 'react-icons/hi2';
import OrderNumberSettings from '../components/dashboard/OrderNumberSettings';

const RestaurantSettings = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in pb-20">
            {/* Header */}
            <header className="mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-4 font-black transition-all uppercase text-[10px] tracking-widest group"
                >
                    <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-3xl border border-indigo-500/20 shadow-inner">
                        <HiCog6Tooth className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">
                            Restaurant Settings
                        </h1>
                        <p className="text-gray-400 text-sm font-bold mt-1">
                            Configure your restaurant preferences
                        </p>
                    </div>
                </div>
            </header>

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Order Numbering Settings */}
                <OrderNumberSettings />

                {/* Future Settings Sections */}
                {/* Add more settings components here as needed */}
                {/* Example: <BusinessHoursSettings /> */}
                {/* Example: <NotificationSettings /> */}
            </div>
        </div>
    );
};

export default RestaurantSettings;
