import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const Testimonials = () => {
    const { t } = useLanguage()

    const testimonials = [
        {
            quote: t('testimonials.t1'),
            author: t('testimonials.role1'),
            rating: 5
        },
        {
            quote: t('testimonials.t2'),
            author: t('testimonials.role2'),
            rating: 5
        },
        {
            quote: t('testimonials.t3'),
            author: t('testimonials.role3'),
            rating: 4
        }
    ]

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-center text-yum-dark mb-16">{t('testimonials.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-8 rounded-3xl relative">
                            <div className="text-yum-primary text-6xl absolute -top-4 left-6 font-serif">"</div>
                            <div className="flex gap-1 mb-4 text-yellow-400">
                                {[...Array(item.rating)].map((_, i) => <span key={i}>★</span>)}
                            </div>
                            <p className="text-gray-600 mb-6 italic relative z-10">{item.quote}</p>
                            <div className="font-bold text-yum-dark">{item.author}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
