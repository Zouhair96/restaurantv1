import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const Features = () => {
    const { t } = useLanguage()

    const features = [
        t('features.f1'),
        t('features.f2'),
        t('features.f3'),
        t('features.f4'),
        t('features.f5'),
        t('features.f6')
    ]

    return (
        <section className="py-20 relative">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tighter uppercase">{t('features.title')}</h2>
                    <div className="h-2 w-24 bg-yum-primary mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-yum-primary cursor-default transition-colors">
                            <div className="w-10 h-10 rounded-full bg-yum-primary/10 flex items-center justify-center mr-4">
                                <svg className="w-5 h-5 text-yum-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="font-medium text-yum-dark">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
