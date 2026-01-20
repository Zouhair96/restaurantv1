import React, { useState } from 'react'
import PromotionCard from '../../components/dashboard/PromotionCard'
import CreatePromoModal from '../../components/dashboard/CreatePromoModal'

const Promotions = () => {
    // Mock Promotions Data
    const [promotions, setPromotions] = useState([
        { id: 1, name: 'Weekend Happy Hour', type: 'SMS', status: 'Active', sent: 1250, openRate: 98, roi: 4.5, date: 'Ends Sunday' },
        { id: 2, name: 'New Menu Launch', type: 'Email', status: 'Scheduled', sent: 0, openRate: 0, roi: 0, date: 'Starts Nov 15' },
        { id: 3, name: 'Halloween Special', type: 'Push', status: 'Ended', sent: 5000, openRate: 45, roi: 3.2, date: 'Oct 31' },
    ])
    const [showPromoModal, setShowPromoModal] = useState(false)

    // Promo Handlers
    const handleCreatePromo = (newPromo) => {
        const promoWithId = {
            ...newPromo,
            id: Date.now(),
            status: 'Scheduled',
            sent: 0,
            openRate: 0,
            roi: 0,
            date: 'Just Created'
        }
        setPromotions([promoWithId, ...promotions])
        setShowPromoModal(false)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automated Promotions</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Create marketing campaigns to boost traffic.</p>
                </div>
                <button
                    onClick={() => setShowPromoModal(true)}
                    className="flex items-center gap-2 bg-yum-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500 transition-colors border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map(promo => (
                    <PromotionCard key={promo.id} promo={promo} />
                ))}
            </div>

            <CreatePromoModal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} onCreate={handleCreatePromo} />
        </div>
    )
}

export default Promotions
