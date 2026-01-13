import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const ForRestaurants = () => {
    const { t } = useLanguage()

    const cards = [
        {
            title: t('forRestaurants.card1Title'),
            desc: t('forRestaurants.card1Desc'),
            icon: "📈"
        },
        {
            title: t('forRestaurants.card2Title'),
            desc: t('forRestaurants.card2Desc'),
            icon: "⚡"
        },
        {
            title: t('forRestaurants.card3Title'),
            desc: t('forRestaurants.card3Desc'),
            icon: "🤝"
        }
    ]

    return (
        <section id="restaurants" className="py-20 bg-yum-light">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-yum-dark mb-4">{t('forRestaurants.title')}</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        {/* Subtitle placeholder */}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <div key={index} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                            <div className="text-4xl mb-4">{card.icon}</div>
                            <h3 className="text-xl font-bold text-yum-dark mb-4">{card.title}</h3>
                            <p className="text-gray-500">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ForRestaurants
