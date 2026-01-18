import React from 'react'
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

import ParallaxBackground from '../components/ParallaxBackground'

const Home = () => {
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
        </div>
    )
}

export default Home
