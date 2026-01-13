import React from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'

const DashboardLayout = ({ children, rightPanel, activeModule, onModuleChange }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-yum-primary selection:text-white overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar activeModule={activeModule} onModuleChange={onModuleChange} />

            {/* Main Content Wrapper */}
            <div className="pl-64 flex h-screen overflow-hidden">
                {/* Center Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-gray-900 relative">
                    {/* Background Glow Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yum-primary/5 to-purple-900/10 pointer-events-none"></div>

                    <DashboardHeader />

                    <main className="flex-1 overflow-y-auto p-6 relative z-0">
                        {children}
                    </main>
                </div>

                {/* Right Panel (Widgets) */}
                {rightPanel && (
                    <aside className="w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto hidden xl:block p-6">
                        {rightPanel}
                    </aside>
                )}
            </div>
        </div>
    )
}

export default DashboardLayout
