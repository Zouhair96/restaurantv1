import woodBg from '../assets/wood_table_bg.png'

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
        <section id="restaurants" className="py-20 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img src={woodBg} alt="Wood Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 shadow-sm">{t('forRestaurants.title')}</h2>
                    <p className="text-gray-200 text-lg max-w-2xl mx-auto shadow-sm">
                        {/* Subtitle placeholder */}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <div key={index} className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100/50">
                            <div className="text-4xl mb-4 text-shadow-sm">{card.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
                            <p className="text-gray-600 font-medium">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ForRestaurants
