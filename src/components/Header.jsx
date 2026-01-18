import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { t, language, toggleLanguage } = useLanguage()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const isLoginPage = location.pathname === '/login'

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const socialLinks = [
        { icon: <FaFacebookF />, url: '#', color: 'bg-[#1877F2]' },
        { icon: <FaInstagram />, url: '#', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
        { icon: <FaTiktok />, url: '#', color: 'bg-black' },
        { icon: <FaYoutube />, url: '#', color: 'bg-[#FF0000]' }
    ]

    const scrollToSection = (id) => {
        setIsMenuOpen(false)
        const element = document.getElementById(id)
        if (element) {
            const headerOffset = 80
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            })
        }
    }

    return (
        <header className={`fixed w-full z-[9999] transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
                    <div className="bg-yum-primary text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-yum-dark leading-none tracking-tight group-hover:text-yum-primary transition-colors">
                            YumYum
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">
                            Solutions
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                {!isLoginPage && (
                    <nav className="hidden md:flex items-center space-x-8">
                        {['howItWorks', 'forRestaurants', 'pricing', 'faq'].map((item) => (
                            <button key={item} onClick={() => scrollToSection(item === 'howItWorks' ? 'how-it-works' : item === 'forRestaurants' ? 'restaurants' : item)} className="text-yum-dark font-medium hover:text-yum-primary transition-colors">
                                {t(`header.${item}`)}
                            </button>
                        ))}
                    </nav>
                )}

                {/* Header Actions */}
                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Social Buttons (Desktop Only) */}
                    <div className="hidden lg:flex items-center gap-3 mr-4 border-r border-gray-100 pr-4">
                        {socialLinks.map((social, index) => (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-white shadow-sm transition-all hover:scale-110 ${social.color}`}
                            >
                                <span className="text-[12px]">{social.icon}</span>
                            </a>
                        ))}
                    </div>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gray-200 text-yum-dark font-bold text-[10px] lg:text-sm hover:border-yum-primary hover:text-yum-primary transition-all uppercase"
                        aria-label="Switch Language"
                    >
                        {language}
                    </button>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-yum-dark" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-4 flex flex-col space-y-4">
                    {!isLoginPage && ['howItWorks', 'forRestaurants', 'pricing', 'faq'].map((item) => (
                        <button key={item} onClick={() => scrollToSection(item === 'howItWorks' ? 'how-it-works' : item === 'forRestaurants' ? 'restaurants' : item)} className="text-yum-dark font-medium w-full text-left py-2 border-b border-gray-100">
                            {t(`header.${item}`)}
                        </button>
                    ))}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-bold text-yum-dark">{t('header.language') || 'Language'}</span>
                        <button onClick={toggleLanguage} className="bg-gray-100 px-4 py-2 rounded-lg text-yum-dark font-bold hover:bg-yum-primary hover:text-white uppercase transition-colors text-sm">
                            {language === 'fr' ? 'English' : 'Français'}
                        </button>
                    </div>
                    {!isLoginPage && (
                        user ? (
                            <>
                                <Link to={user.role === 'admin' ? "/admin" : "/profile"} className="text-yum-primary font-bold w-full text-left py-2 block">
                                    {user.role === 'admin' ? (t('header.adminDashboard') || 'Admin Dashboard') : (t('header.profile') || 'Profile')} ({user.name})
                                </Link>
                                <button
                                    onClick={() => {
                                        logout()
                                        navigate('/')
                                        setIsMenuOpen(false)
                                    }}
                                    className="text-gray-500 font-medium w-full text-left py-2 border-t border-gray-50"
                                >
                                    {t('header.logout') || 'Logout'}
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-yum-dark font-medium w-full text-left py-2" onClick={() => setIsMenuOpen(false)}>
                                {t('header.login')}
                            </Link>
                        )
                    )}

                </div>
            )
            }

        </header >
    )
}

export default Header
