import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

const SubscriptionPlans = ({ onSubscribe, currentPlan }) => {
    const { t } = useLanguage()

    const plans = [
        {
            id: 'Starter',
            key: 'starter',
            type: 'standard',
            color: 'border-gray-200 dark:border-gray-800',
            btnColor: 'bg-transparent border border-gray-800 dark:border-white text-gray-800 dark:text-white hover:bg-gray-800 dark:hover:bg-white dark:hover:text-yum-dark',
            features: ['f1', 'f2', 'f3', 'f4']
        },
        {
            id: 'Pro',
            key: 'pro',
            type: 'popular',
            color: 'border-yum-primary shadow-2xl scale-105 z-10',
            btnColor: 'bg-yum-primary hover:bg-red-500 text-white shadow-lg',
            features: ['f1', 'f2', 'f3', 'f4', 'f5']
        },
        {
            id: 'Enterprise',
            key: 'enterprise',
            type: 'premium',
            color: 'border-gray-900 bg-gray-900 text-white',
            btnColor: 'bg-white text-gray-900 hover:bg-yum-primary hover:text-white',
            features: ['f1', 'f2', 'f3', 'f4']
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto py-8">
            {plans.map((plan) => {
                const isCurrent = currentPlan?.toLowerCase() === plan.id.toLowerCase()

                return (
                    <div
                        key={plan.id}
                        className={`rounded-2xl p-8 border-2 ${plan.color} relative flex flex-col transition-all duration-300 ${plan.type === 'popular' ? 'bg-white text-yum-dark mb-4 md:mb-0' : 'bg-white dark:bg-gray-800'}`}
                    >
                        {plan.type === 'popular' && (
                            <div className="absolute top-0 right-0 bg-yum-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                                {t('pricing.mostPopular') || "Most Popular"}
                            </div>
                        )}

                        <h3 className={`text-2xl font-black ${plan.key === 'enterprise' && plan.type === 'premium' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {t(`pricing.${plan.key}.title`)}
                        </h3>

                        <p className={`text-sm mt-1 mb-6 ${plan.key === 'enterprise' && plan.type === 'premium' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {t(`pricing.${plan.key}.desc`)}
                        </p>

                        <div className="mb-6">
                            <span className={`text-4xl font-black ${plan.key === 'enterprise' && plan.type === 'premium' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {t(`pricing.${plan.key}.price`)}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">/{t(`pricing.${plan.key}.period`) || 'month'}</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((featureKey) => (
                                <li key={featureKey} className="flex items-center gap-3 text-sm font-medium">
                                    <svg className={`w-5 h-5 shrink-0 ${plan.type === 'popular' ? 'text-yum-primary' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className={plan.key === 'enterprise' && plan.type === 'premium' ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}>
                                        {t(`pricing.${plan.key}.${featureKey}`)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => !isCurrent && onSubscribe(plan.id)}
                            disabled={isCurrent}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${isCurrent ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border-none' : plan.btnColor}`}
                        >
                            {isCurrent ? 'Current Plan' : `Switch to ${plan.id}`}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default SubscriptionPlans
