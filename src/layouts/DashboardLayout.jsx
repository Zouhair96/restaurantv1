import React from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'

const DashboardLayout = ({ children, rightPanel, activeModule, onModuleChange, isBlurred }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-gray-800 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">
            {/* Sidebar */}
            <DashboardSidebar
                activeModule={activeModule}
                onModuleChange={onModuleChange}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content Wrapper */}
            <div className={`flex h-screen overflow-hidden transition-all duration-300 md:pl-28 ${isBlurred ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
                {/* Center Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#f3f4f6] relative">
                    {/* Background Glow Effect - Subtle mesh gradient */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-200/30 rounded-full blur-[100px]"></div>
                        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-pink-200/30 rounded-full blur-[100px]"></div>
                    </div>

                    <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0 scrollbar-hide">
                        {children}
                    </main>
                </div>

                {/* Right Panel (Widgets) */}
                {rightPanel && (
                    <aside className="w-80 bg-white/50 backdrop-blur-xl border-l border-white/20 overflow-y-auto hidden xl:block p-6 shadow-sm">
                        {rightPanel}
                    </aside>
                )}
            </div>
        </div>
    )
}

export default DashboardLayout
