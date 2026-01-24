import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Hero from '../components/Hero'
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

    return (
        <div className="min-h-screen text-yum-dark font-sans selection:bg-yum-primary selection:text-white">
            <Header />
            <main>
                <ParallaxBackground>
                    <Hero />
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
