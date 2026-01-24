import React from 'react';
import { Link } from 'react-router-dom';

const Templates = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">My Templates</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Manage your custom generated menu templates.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Pizza Time Widget */}
                <div className="group bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 relative">
                        <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-3xl shadow-sm">
                            🍕
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Pizza Time</h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                            </span>
                        </div>
                    </div>

                    {/* Preview (Mock) */}
                    <div className="h-32 bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-6 border border-gray-100 dark:border-gray-700 overflow-hidden flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1000&auto=format&fit=crop")' }}></div>
                        <span className="relative z-10 font-bold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">Template Preview</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                to="/menu_pizza1"
                                target="_blank"
                                className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors"
                            >
                                👁️ Show
                            </Link>
                            <Link
                                to="/manage_menu_pizza1"
                                className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold rounded-xl transition-colors"
                            >
                                ⚙️ Manage
                            </Link>
                        </div>
                        <button
                            onClick={() => alert('Delete feature coming soon')}
                            className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            🗑️ Delete Template
                        </button>
                    </div>
                </div>

                {/* Placeholder for Add New */}
                <button className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-4">
                        +
                    </div>
                    <span className="font-bold text-lg">Create New Template</span>
                </button>
            </div>
        </div>
    );
};

export default Templates;
