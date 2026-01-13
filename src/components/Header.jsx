import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { t, language, toggleLanguage } = useLanguage()
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

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Language Switcher - Professional Minimalist */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-yum-dark font-bold text-sm hover:border-yum-primary hover:text-yum-primary transition-all uppercase"
                        aria-label="Switch Language"
                    >
                        {language}
                    </button>

                    {!isLoginPage && (
                        <Link
                            to="/login"
                            className="text-yum-dark font-bold hover:text-yum-primary transition-colors hover:bg-yum-light px-4 py-2 rounded-full relative z-50"
                        >
                            {t('header.login')}
                        </Link>
                    )}
                    <Link to="/demo" className="bg-yum-primary text-white px-6 py-2 rounded-full font-bold hover:bg-red-500 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        {t('header.demo')}
                    </Link>
                </div>

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

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-4 flex flex-col space-y-4">
                    {!isLoginPage && ['howItWorks', 'forRestaurants', 'pricing', 'faq'].map((item) => (
                        <button key={item} onClick={() => scrollToSection(item === 'howItWorks' ? 'how-it-works' : item === 'forRestaurants' ? 'restaurants' : item)} className="text-yum-dark font-medium w-full text-left py-2 border-b border-gray-100">
                            {t(`header.${item}`)}
                        </button>
                    ))}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="font-bold text-yum-dark">Langue / Language</span>
                        <button onClick={toggleLanguage} className="bg-gray-100 px-4 py-2 rounded-lg text-yum-dark font-bold hover:bg-yum-primary hover:text-white uppercase transition-colors text-sm">
                            {language === 'fr' ? 'English' : 'Français'}
                        </button>
                    </div>
                    {!isLoginPage && (
                        <Link to="/login" className="text-yum-dark font-medium w-full text-left py-2" onClick={() => setIsMenuOpen(false)}>
                            {t('header.login')}
                        </Link>
                    )}
                    <Link to="/demo" className="bg-yum-primary text-white px-6 py-2 rounded-full font-bold w-full text-center block">
                        {t('header.demo')}
                    </Link>
                </div>
            )}
        </header>
    )
}

export default Header
