import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

// Import assets for robust Vite bundling
import tacosImg from '../assets/tacos_bowl.png'
import saladImg from '../assets/salad_bowl.png'
import meatImg from '../assets/meat_bowl.png'

const Hero = () => {
    const { t } = useLanguage()
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <section className="relative min-h-[85vh] flex items-center pt-24 pb-20 overflow-visible">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                    {/* Left: Premium Typography */}
                    <div className="lg:w-1/2 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yum-primary/10 border border-yum-primary/20 mb-6 animate-fade-in shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yum-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yum-primary"></span>
                            </span>
                            <span className="text-yum-primary font-bold text-[9px] uppercase tracking-[0.2em]">{t('hero.badgeText')}</span>
                        </div>

                        <h1 className="text-gray-900 animate-fade-in-up tracking-tighter mb-8">
                            <span className="block text-4xl md:text-6xl font-black leading-none mb-1">
                                Le menu <span className="text-yum-primary">digital</span>
                            </span>
                            <span className="block text-xl md:text-3xl font-medium italic text-gray-400 mb-4 lowercase tracking-normal">
                                qui augmente
                            </span>
                            <span className="block text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter">
                                votre chiffre <br className="hidden md:block" /> d'affaires
                            </span>
                        </h1>

                        <p className="text-base md:text-[17px] text-gray-700 font-medium mb-10 max-w-lg animate-fade-in-up delay-100 leading-relaxed opacity-90">
                            {t('hero.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-start">
                            <Link to="/demo" className="group relative px-8 py-4 bg-yum-primary text-white font-black text-lg rounded-xl overflow-hidden shadow-xl transition-all hover:scale-105 active:scale-95 text-center">
                                <span className="relative z-10">{t('hero.ctaPrimary')}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yum-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                            <Link to="/demo" className="px-8 py-4 bg-white/50 backdrop-blur-sm text-gray-900 font-black text-lg rounded-xl border-2 border-gray-900 transition-all hover:bg-gray-900 hover:text-white text-center shadow-lg">
                                {t('hero.ctaSecondary')}
                            </Link>
                        </div>
                    </div>

                    {/* Right: Floating 3D Food Elements */}
                    <div className="lg:w-1/2 relative h-[400px] md:h-[600px] w-full animate-fade-in">
                        {/* Main Taco Bowl */}
                        <div
                            className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-[500px] transition-transform duration-200 ease-out"
                            style={{ transform: `translate(calc(-50% + ${mousePos.x}px), calc(-50% + ${mousePos.y}px))` }}
                        >
                            <img
                                src={tacosImg}
                                alt="Tacos"
                                className="w-full h-auto floating drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)]"
                                loading="eager"
                            />
                        </div>

                        {/* Salad Bowl (Top Left) */}
                        <div
                            className="absolute z-20 top-0 left-0 w-40 md:w-60 transition-transform duration-300 ease-out"
                            style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
                        >
                            <img
                                src={saladImg}
                                alt="Salad"
                                className="w-full h-auto floating-delayed drop-shadow-[0_20px_20px_rgba(0,0,0,0.25)] opacity-90"
                                loading="eager"
                            />
                        </div>

                        {/* Meat Bowl (Bottom Right) */}
                        <div
                            className="absolute z-40 bottom-0 right-0 w-40 md:w-60 transition-transform duration-150 ease-out"
                            style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
                        >
                            <img
                                src={meatImg}
                                alt="Steak"
                                className="w-full h-auto floating drop-shadow-[0_25px_25px_rgba(0,0,0,0.35)]"
                                loading="eager"
                            />
                        </div>

                        {/* Decorative Strokes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-[2px] border-yum-primary/10 rounded-full z-10 animate-spin-slow"></div>
                    </div>
                </div>
            </div>

            {/* Side Label */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 vertical-text hidden xl:block opacity-5 select-none pointer-events-none">
                <span className="text-8xl font-black text-white-stroke uppercase tracking-[2rem]">DIGIMENU</span>
            </div>
        </section>
    )
}

export default Hero
