import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Header from '../components/Header'
import { FloatingFoodHero } from '../components/ui/hero-section-7'
import HowItWorks from '../components/HowItWorks'
import ForRestaurants from '../components/ForRestaurants'
import CustomerExperience from '../components/CustomerExperience'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import SocialSidebar from '../components/SocialSidebar'

import ParallaxBackground from '../components/ParallaxBackground'

const Home = () => {
    const { user, loading } = useAuth()
    const { t } = useLanguage()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                navigate('/admin')
            } else {
                navigate('/dashboard')
            }
        }
    }, [user, loading, navigate])

    const heroImages = [
        {
            src: 'https://b.zmtcdn.com/data/o2_assets/110a09a9d81f0e5305041c1b507d0f391743058910.png',
            alt: 'A delicious cheeseburger',
            className: 'w-40 sm:w-56 md:w-64 lg:w-72 top-10 left-4 sm:left-10 md:top-20 md:left-20 animate-float',
        },
        {
            src: '/menu_phone_mockup.png',
            alt: 'Smartphone displaying restaurant menu',
            className: 'w-32 sm:w-40 md:w-52 lg:w-60 top-1/4 right-8 sm:right-12 md:right-20 animate-float',
        },
        {
            src: 'https://b.zmtcdn.com/data/o2_assets/b4f62434088b0ddfa9b370991f58ca601743060218.png',
            alt: 'A bamboo steamer with dumplings',
            className: 'w-28 sm:w-36 md:w-48 top-10 right-4 sm:right-10 md:top-16 md:right-16 animate-float',
        },
        {
            src: '/qr_code_floating.png',
            alt: 'QR code for restaurant menu',
            className: 'w-24 sm:w-32 md:w-40 bottom-1/4 left-8 sm:left-16 md:left-24 animate-float',
        },
        {
            src: 'https://b.zmtcdn.com/data/o2_assets/316495f4ba2a9c9d9aa97fed9fe61cf71743059024.png',
            alt: 'A slice of pizza',
            className: 'w-32 sm:w-40 md:w-56 bottom-8 right-5 sm:right-10 md:bottom-16 md:right-20 animate-float',
        },
        {
            src: '/hand_phone_menu.png',
            alt: 'Hand holding phone with menu',
            className: 'w-36 sm:w-44 md:w-56 lg:w-64 bottom-12 left-12 sm:left-20 md:bottom-20 md:left-28 animate-float',
        },
        {
            src: 'https://b.zmtcdn.com/data/o2_assets/70b50e1a48a82437bfa2bed925b862701742892555.png',
            alt: 'A basil leaf',
            className: 'w-8 sm:w-12 top-1/3 left-1/3 animate-float',
        },
        {
            src: 'https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png',
            alt: 'A slice of tomato',
            className: 'w-8 sm:w-10 top-1/2 right-1/4 animate-float',
        },
        {
            src: 'https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png',
            alt: 'A slice of tomato',
            className: 'w-8 sm:w-10 top-2/3 left-1/4 animate-float',
        },
    ];

    return (
        <div className="min-h-screen text-yum-dark font-sans selection:bg-yum-primary selection:text-white">
            <Header />
            <main>
                <ParallaxBackground>
                    <FloatingFoodHero
                        title={t('floatingHero.title')}
                        description={t('floatingHero.description')}
                        images={heroImages}
                    />
                    <HowItWorks />
                    <ForRestaurants />
                    <CustomerExperience />
                    <Pricing />
                    <Features />
                    <Testimonials />
                    <FAQ />
                    <Contact />
                    <Footer />
                </ParallaxBackground>
            </main>
            <BackToTop />
            <SocialSidebar />
        </div>
    )
}

export default Home
