import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const Pricing = () => {
    const { t } = useLanguage()
    const navigate = useNavigate()

    return (
        <section id="pricing" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-gray-900 leading-none uppercase">
                        {t('pricing.title').split(' ')[0]} <span className="text-yum-primary">{t('pricing.title').split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto font-medium text-lg">
                        {t('pricing.subtitle') || "Choose the perfect plan for your business scale."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter */}
                    <Link to="/pricing/starter" className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-yum-primary transition-all flex flex-col text-white group cursor-pointer">
                        <h3 className="text-xl font-bold mb-2">{t('pricing.starter.title')}</h3>
                        <p className="text-gray-400 text-sm mb-6">{t('pricing.starter.desc')}</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">{t('pricing.starter.price')}</span>
                            <span className="text-gray-500">/{t('pricing.starter.period') || 'month'}</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {['f1', 'f2', 'f3', 'f4'].map((featureKey) => (
                                <li key={featureKey} className="flex items-center gap-3 text-sm">
                                    <svg className="w-5 h-5 text-yum-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {t(`pricing.starter.${featureKey}`)}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-transparent border border-white group-hover:bg-white group-hover:text-yum-dark text-white font-bold py-3 rounded-xl transition-all">
                            {t('pricing.starter.cta')}
                        </button>
                    </Link>

                    {/* Pro */}
                    <Link to="/pricing/pro" className="bg-white text-yum-dark rounded-2xl p-8 border-2 border-yum-primary relative transform scale-105 shadow-2xl flex flex-col z-10 hover:-translate-y-2 transition-all cursor-pointer group">
                        <div className="absolute top-0 right-0 bg-yum-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                            {t('pricing.mostPopular') || "LE PLUS POPULAIRE"}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('pricing.pro.title')}</h3>
                        <p className="text-gray-500 text-sm mb-6">{t('pricing.pro.desc')}</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">{t('pricing.pro.price')}</span>
                            <span className="text-gray-500">/{t('pricing.pro.period') || 'month'}</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {['f1', 'f2', 'f3', 'f4', 'f5'].map((featureKey) => (
                                <li key={featureKey} className="flex items-center gap-3 text-sm font-medium">
                                    <svg className="w-5 h-5 text-yum-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {t(`pricing.pro.${featureKey}`)}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-yum-primary text-white font-bold py-3 rounded-xl group-hover:bg-red-500 transition-all shadow-lg">
                            {t('pricing.pro.cta')}
                        </button>
                    </Link>

                    {/* Enterprise */}
                    <Link to="/pricing/enterprise" className="bg-gray-900 border-2 border-transparent hover:border-yum-primary rounded-3xl p-10 transition-all flex flex-col text-white shadow-2xl group cursor-pointer">
                        <h3 className="text-2xl font-black mb-2">{t('pricing.enterprise.title')}</h3>
                        <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest font-bold">{t('pricing.enterprise.desc')}</p>
                        <div className="mb-8">
                            <span className="text-4xl font-black">{t('pricing.enterprise.price')}</span>
                        </div>
                        <ul className="space-y-4 mb-10 flex-grow">
                            {['f1', 'f2', 'f3', 'f4'].map((featureKey) => (
                                <li key={featureKey} className="flex items-center gap-3 text-sm font-medium">
                                    <svg className="w-6 h-6 text-yum-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    {t(`pricing.enterprise.${featureKey}`)}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-white text-gray-900 font-black py-4 rounded-2xl group-hover:bg-yum-primary group-hover:text-white transition-all shadow-xl">
                            {t('pricing.enterprise.cta')}
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Pricing
