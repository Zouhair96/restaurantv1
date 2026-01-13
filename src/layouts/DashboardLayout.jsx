import React from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'

const DashboardLayout = ({ children, rightPanel, activeModule, onModuleChange, isBlurred }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-yum-primary selection:text-white overflow-hidden relative">
            {/* Sidebar */}
            <DashboardSidebar
                activeModule={activeModule}
                onModuleChange={onModuleChange}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content Wrapper */}
            <div className={`flex h-screen overflow-hidden transition-all duration-300 md:pl-64 ${isBlurred ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
                {/* Center Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-gray-900 relative">
                    {/* Background Glow Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yum-primary/5 to-purple-900/10 pointer-events-none"></div>

                    <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6 relative z-0">
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
