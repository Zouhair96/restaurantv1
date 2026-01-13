import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const Hero = () => {
    const { t } = useLanguage()

    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
            {/* Real Background Image */}
            <div className="absolute inset-0 z-0">
                <img src="/assets/hero.jpg" alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
                    {/* Text Content */}
                    <div className="lg:w-1/2">
                        <div className="inline-block bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm text-yum-primary font-bold text-sm mb-6 animate-fade-in-up border border-yum-primary/20">
                            🚀 {t('hero.badgeText')}
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-in-up drop-shadow-sm">
                            {t('hero.title')}
                        </h1>
                        <p className="text-xl text-gray-800 font-medium mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-100 drop-shadow-sm">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/demo" className="bg-yum-primary text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center">
                                {t('hero.ctaPrimary')}
                            </Link>
                            <Link to="/demo" className="bg-white/90 backdrop-blur text-yum-dark border-2 border-gray-200/50 px-8 py-3 rounded-full font-bold text-lg hover:border-yum-primary hover:text-yum-primary transition-all text-center shadow-sm">
                                {t('hero.ctaSecondary')}
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-4 text-sm text-gray-800 font-medium justify-center lg:justify-start">
                            <span className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Installation 24h
                            </span>
                            <span className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Sans engagement
                            </span>
                        </div>
                    </div>

                    {/* Image/Visual Content */}
                    <div className="lg:w-1/2 relative animate-fade-in-right">
                        <div className="relative z-10 bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-all duration-500 border border-white/50">
                            <img
                                src="/assets/yumyum_hero.png"
                                alt="Restaurant connecté YumYum"
                                className="w-full h-auto object-cover rounded-2xl shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
    )
}

export default Hero
