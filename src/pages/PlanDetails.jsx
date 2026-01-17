import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

const PlanDetails = () => {
    const { planId } = useParams()
    const { t, language } = useLanguage()
    const navigate = useNavigate()

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const planData = t(`pricing.${planId}`)

    if (!planData || typeof planData === 'string') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
                <Link to="/" className="text-yum-primary hover:underline">Back to Home</Link>
            </div>
        )
    }

    const colorClasses = {
        starter: 'from-gray-700 to-gray-900',
        pro: 'from-yum-primary to-yum-secondary',
        enterprise: 'from-blue-700 to-blue-900'
    }

    const bgGradient = colorClasses[planId] || 'from-gray-700 to-gray-900'

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Hero section for the plan */}
                <section className={`pt-32 pb-20 bg-gradient-to-br ${bgGradient} text-white`}>
                    <div className="container mx-auto px-4 text-center">
                        <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold mb-6 uppercase tracking-widest animate-fade-in">
                            {planId === 'pro' ? (t('pricing.mostPopular') || 'Most Popular') : (language === 'fr' ? 'Offre' : 'Plan')}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                            {planData.title}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-medium">
                            {planData.desc}
                        </p>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-black text-gray-900 mb-12 text-center uppercase tracking-tight">
                                {language === 'fr' ? 'Tout ce qui est inclus' : 'Everything that is included'}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {planData.detailedFeatures?.map((category, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center text-2xl shadow-lg`}>
                                                {idx === 0 ? '🎨' : idx === 1 ? '⚡' : idx === 2 ? '📈' : '🛠️'}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {category.features.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-3 text-gray-600 font-medium">
                                                    <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comparison teaser or common features */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-black text-gray-900 mb-16 uppercase">{language === 'fr' ? 'Prêt à décoller ?' : 'Ready to start?'}</h2>
                        <div className="max-w-3xl mx-auto p-12 bg-gray-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yum-primary/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

                            <div className="relative z-10">
                                <div className="mb-8">
                                    <span className="text-6xl font-black">{planData.price}</span>
                                    {planData.period && <span className="text-gray-400 text-xl">/{planData.period}</span>}
                                </div>
                                <p className="text-gray-400 mb-10 text-lg">
                                    {language === 'fr'
                                        ? "Installation en moins de 24h. Sans engagement."
                                        : "Setup in less than 24h. No commitment."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-10 py-4 bg-yum-primary hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-yum-primary/20 text-lg"
                                    >
                                        {planData.cta}
                                    </button>
                                    <Link
                                        to="/"
                                        className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/20 text-lg"
                                    >
                                        {language === 'fr' ? "Voir les autres plans" : "See other plans"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default PlanDetails
