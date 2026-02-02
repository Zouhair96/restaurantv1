import React from 'react'
import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = () => {
    const { user } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f1115] text-gray-800 dark:text-gray-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative transition-colors duration-300">
            {/* Sidebar */}
            <DashboardSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content Wrapper */}
            <div className="flex h-screen overflow-hidden transition-all duration-300 md:pl-28">
                {/* Center Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#f3f4f6] dark:bg-[#0f1115] relative transition-colors duration-300">
                    {/* Background Glow Effect - Subtle mesh gradient */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[100px] transition-colors duration-500"></div>
                        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-pink-200/30 dark:bg-pink-900/20 rounded-full blur-[100px] transition-colors duration-500"></div>
                    </div>

                    <DashboardHeader
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onMenuClick={() => setIsMobileMenuOpen(true)}
                    />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
                        <Outlet context={{ searchTerm }} />
                    </main>
                </div>

            </div>
        </div>
    )
}

export default DashboardLayout
