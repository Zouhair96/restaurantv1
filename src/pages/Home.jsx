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

const Home = () => {
    return (
        <div className="min-h-screen bg-yum-light text-yum-dark font-sans selection:bg-yum-primary selection:text-white">
            <Header />
            <main>
                <Hero />
                <HowItWorks />
                <ForRestaurants />
                <CustomerExperience />
                <Pricing />
                <Features />
                <Testimonials />
                <FAQ />
                <Contact />
            </main>
            <Footer />
        </div>
    )
}

export default Home
