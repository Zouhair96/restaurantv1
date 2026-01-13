import React from 'react'
import { useNavigate } from 'react-router-dom'

const SubscriptionPlans = ({ onSubscribe }) => {
    const navigate = useNavigate()

    // Wrapper to handle navigation if onSubscribe is not provided or wrapper logic needed
    // But actually, simpler to just let parent handle it.
    // I will stick to the previous thought: Update Profile.jsx logic.
    // Changing my mind to strictly follow "Update SubscriptionPlans" might be confusing if I don't need to.

    // I will actually NOT edit SubscriptionPlans.jsx as it is a pure UI component. 
    // I will edit Profile.jsx to pass the navigation logic.
    // I will CREATE OnboardingOverlay.jsx first.


    const SubscriptionPlans = ({ onSubscribe }) => {
        const plans = [
            {
                name: 'Starter',
                price: '$29',
                features: ['Basic Dashboard', 'Order Management', '5 Staff Accounts'],
                color: 'border-gray-200',
                btnColor: 'bg-gray-800 hover:bg-gray-700'
            },
            {
                name: 'Pro',
                price: '$79',
                popular: true,
                features: ['Advanced Analytics', 'AI Menu Suggestions', 'Unlimited Staff', 'Priority Support'],
                color: 'border-yum-primary',
                btnColor: 'bg-yum-primary hover:bg-red-500'
            },
            {
                name: 'Enterprise',
                price: '$199',
                features: ['Custom AI Models', 'Multi-Location Support', 'Dedicated Account Manager', 'API Access'],
                color: 'border-gray-200',
                btnColor: 'bg-gray-800 hover:bg-gray-700'
            }
        ]

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <div key={plan.name} className={`bg-white rounded-2xl shadow-lg border-2 ${plan.color} p-8 relative flex flex-col hover:-translate-y-2 transition-transform duration-300`}>
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-yum-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg uppercase tracking-widest">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                        <div className="mt-4 mb-6">
                            <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-gray-600">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => onSubscribe(plan.name)}
                            className={`w-full py-3 rounded-xl text-white font-bold transition-colors ${plan.btnColor}`}
                        >
                            Subscribe to {plan.name}
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    export default SubscriptionPlans
