import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const Features = () => {
    const { t } = useLanguage()

    const features = [
        { key: 'f1', isNew: false },
        { key: 'f2', isNew: false },
        { key: 'f3', isNew: false },
        { key: 'f4', isNew: false },
        { key: 'f5', isNew: false },
        { key: 'f6', isNew: false },
        { key: 'f7', isNew: true },
        { key: 'f8', isNew: true },
        { key: 'f9', isNew: true },
        { key: 'f10', isNew: true },
        { key: 'f11', isNew: true },
        { key: 'f12', isNew: true }
    ]

    return (
        <section className="py-20 relative overflow-hidden" id="features">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase leading-none">
                        Our <span className="text-yum-primary">Features</span>
                    </h2>
                    <div className="h-1.5 w-20 bg-yum-primary/20 mx-auto rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-yum-primary animate-move-horizontal"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`
                                flex items-center p-6 bg-white rounded-2xl shadow-sm border transition-all duration-300 relative group
                                ${feature.isNew
                                    ? 'border-dashed border-gray-200 opacity-80 hover:opacity-100'
                                    : 'border-gray-100 hover:border-yum-primary hover:shadow-md'
                                }
                            `}
                        >
                            {feature.isNew && (
                                <div className="absolute -top-3 right-4 bg-yum-light text-yum-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-yum-primary/20 shadow-sm">
                                    {t('features.comingSoon')}
                                </div>
                            )}

                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0
                                ${feature.isNew ? 'bg-gray-100 text-gray-400' : 'bg-yum-primary/10 text-yum-primary'}
                            `}>
                                {feature.isNew ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className={`font-medium text-sm lg:text-base ${feature.isNew ? 'text-gray-500' : 'text-yum-dark'}`}>
                                {t(`features.${feature.key}`)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
