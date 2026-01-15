import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

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
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left: Premium Typography */}
                    <div className="lg:w-3/5 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yum-primary/10 border border-yum-primary/20 mb-8 animate-fade-in">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yum-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-yum-primary"></span>
                            </span>
                            <span className="text-yum-primary font-black text-xs uppercase tracking-widest">{t('hero.badgeText')}</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8 animate-fade-in-up tracking-tighter">
                            {t('hero.title').split(' ').map((word, i) => (
                                <span key={i} className={`${i % 2 === 0 ? 'block' : 'inline-block mr-4'}`}>{word}</span>
                            ))}
                        </h1>

                        <p className="text-lg md:text-xl text-gray-700 font-medium mb-12 max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-100 leading-relaxed">
                            {t('hero.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                            <Link to="/demo" className="group relative px-10 py-5 bg-yum-primary text-white font-black text-xl rounded-2xl overflow-hidden shadow-2xl shadow-yum-primary/40 transition-all hover:scale-105 active:scale-95 text-center">
                                <span className="relative z-10">{t('hero.ctaPrimary')}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yum-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                            <Link to="/demo" className="px-10 py-5 bg-white text-gray-900 font-black text-xl rounded-2xl border-4 border-gray-900 transition-all hover:bg-gray-900 hover:text-white text-center shadow-xl">
                                {t('hero.ctaSecondary')}
                            </Link>
                        </div>
                    </div>

                    {/* Right: Floating 3D Food Elements */}
                    <div className="lg:w-2/5 relative h-[500px] w-full animate-fade-in">
                        {/* Main Taco Bowl */}
                        <div
                            className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 md:w-[450px] transition-transform duration-200 ease-out"
                            style={{ transform: `translate(calc(-50% + ${mousePos.x}px), calc(-50% + ${mousePos.y}px))` }}
                        >
                            <img
                                src="/assets/tacos_bowl.png"
                                alt="Tacos"
                                className="w-full h-auto floating drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                            />
                        </div>

                        {/* Salad Bowl (Behind Tacos) */}
                        <div
                            className="absolute z-20 top-1/4 left-0 w-48 md:w-64 transition-transform duration-300 ease-out grayscale group-hover:grayscale-0"
                            style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
                        >
                            <img
                                src="/assets/salad_bowl.png"
                                alt="Salad"
                                className="w-full h-auto floating-delayed drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] opacity-80"
                            />
                        </div>

                        {/* Meat Bowl (Bottom Right) */}
                        <div
                            className="absolute z-40 bottom-0 right-0 w-48 md:w-64 transition-transform duration-150 ease-out"
                            style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
                        >
                            <img
                                src="/assets/meat_bowl.png"
                                alt="Steak"
                                className="w-full h-auto floating drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]"
                            />
                        </div>

                        {/* Decorative Strokes (like in the image) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[20px] border-yum-primary/5 rounded-full z-10 animate-spin-slow"></div>
                    </div>
                </div>
            </div>

            {/* Side Label (like "Sub floors" in image) */}
            <div className="absolute top-1/2 right-10 -translate-y-1/2 vertical-text hidden xl:block opacity-10">
                <span className="text-9xl font-black text-white-stroke uppercase tracking-[2rem]">DIGIMENU</span>
            </div>
        </section>
    )
}

export default Hero
