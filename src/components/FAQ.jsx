import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const FAQ = () => {
    const { t } = useLanguage()
    const [activeIndex, setActiveIndex] = useState(null)

    const faqs = [
        {
            q: t('faq.q1'),
            a: t('faq.a1')
        },
        {
            q: t('faq.q2'),
            a: t('faq.a2')
        },
        {
            q: t('faq.q3'),
            a: t('faq.a3')
        }
    ]

    return (
        <section id="faq" className="py-20 bg-yum-light">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl lg:text-4xl font-bold text-center text-yum-dark mb-12">{t('faq.title')}</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex justify-between items-center p-6 text-left font-bold text-yum-dark hover:bg-gray-50 transition-colors"
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                            >
                                <span>{faq.q}</span>
                                <svg className={`w-6 h-6 transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-yum-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className={`px-6 text-gray-600 overflow-hidden transition-all duration-300 ${activeIndex === index ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FAQ
