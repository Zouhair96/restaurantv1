import React from 'react'
import LoyaltySettings from '../../components/dashboard/LoyaltySettings'

const Promotions = () => {
    return (
        <div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loyalty & Recovery System</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Convert one-time visitors into loyal customers automatically.</p>
            </div>
            {/* End of Loyalty Header */}

            <LoyaltySettings />
        </div >
    )
}

export default Promotions
