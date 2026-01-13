import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const CustomerExperience = () => {
    const { t } = useLanguage()

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Visual Side */}
                    <div className="lg:w-1/2 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-yum-secondary/20 to-yum-primary/20 rounded-full blur-3xl transform scale-75"></div>
                        <img
                            src="/assets/yumyum_experience.png"
                            alt="Expérience client YumYum"
                            className="relative rounded-3xl shadow-2xl w-full object-cover transform -rotate-2 hover:rotate-0 transition-all duration-500"
                        />
                    </div>

                    {/* Content Side */}
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl lg:text-4xl font-bold text-yum-dark mb-6">
                            {t('experience.title')}
                        </h2>
                        <div className="space-y-6 text-lg text-gray-500">
                            <p>
                                {t('experience.p1')}
                            </p>
                            <p>
                                {t('experience.p2')}
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            {[t('experience.list1'), t('experience.list2'), t('experience.list3')].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="font-medium text-yum-dark">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomerExperience
