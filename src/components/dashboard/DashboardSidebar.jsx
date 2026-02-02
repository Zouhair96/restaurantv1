import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
// import { FiHome, FiGrid, FiBarChart2, FiUsers, FiCpu, FiSettings, FiLogOut } from 'react-icons/fi' 

const DashboardSidebar = ({ isOpen, onClose }) => {
    const location = useLocation()
    const { user } = useAuth()

    const allModules = [
        { id: 'dashboard', path: '/dashboard', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['OWNER', 'ADMIN'] },
        { id: 'orders', path: '/dashboard/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: ['STAFF', 'ADMIN'] },
        { id: 'menu', path: '/dashboard/menu', label: 'Menu', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', roles: ['OWNER', 'ADMIN'] },
        { id: 'team', path: '/dashboard/team', label: 'Team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['OWNER', 'ADMIN'] },
        { id: 'promos', path: '/dashboard/promos', label: 'Promos', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', roles: ['OWNER', 'ADMIN'] },
        { id: 'settings', path: '/dashboard/settings', label: 'Settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['OWNER', 'ADMIN'] },
    ]

    const modules = allModules.filter(m => m.roles.includes(user?.role))

    const isActive = (path) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Floating Sidebar (Pill Style) */}
            <div className={`fixed inset-y-0 left-0 z-50 w-24 m-4 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-[150%]'}`}>
                {/* Main Container */}
                <div className="flex-1 bg-[#6c5b7b] bg-gradient-to-b from-[#6c5ce7] to-[#8e44ad] rounded-[2.5rem] shadow-2xl flex flex-col items-center py-8">

                    {/* Logo / Brand */}
                    <Link to="/" className="mb-12 flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-md shadow-inner border border-white/30" onClick={onClose}>
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </Link>

                    {/* Nav Items */}
                    <nav className="flex-1 flex flex-col gap-6 w-full px-4">
                        {modules.map((module) => (
                            <Link
                                key={module.id}
                                to={module.path}
                                onClick={onClose}
                                className={`group relative w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300
                                    ${isActive(module.path)
                                        ? 'bg-white text-[#6c5ce7] shadow-lg scale-110 translate-x-1'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={module.icon} />
                                </svg>

                                {/* Hover Tooltip */}
                                <span className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                                    {module.label}
                                </span>

                                {module.id === 'promos' && (
                                    <span className="absolute top-2 right-2 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout/Back */}
                    <div className="mt-auto px-4 w-full">
                        <Link to="/" className="w-full aspect-square flex items-center justify-center rounded-2xl text-white/60 hover:bg-white/10 hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashboardSidebar
