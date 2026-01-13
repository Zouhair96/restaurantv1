import React from 'react'

const PromotionCard = ({ promo }) => {
    const typeColors = {
        'SMS': 'bg-blue-100 text-blue-700',
        'Email': 'bg-purple-100 text-purple-700',
        'Push': 'bg-pink-100 text-pink-700'
    }

    const statusColors = {
        'Active': 'text-green-500',
        'Scheduled': 'text-orange-500',
        'Ended': 'text-gray-400'
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${typeColors[promo.type]}`}>
                        {promo.type === 'SMS' ? '📱' : promo.type === 'Email' ? '📧' : '🔔'}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{promo.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{promo.date}</p>
                    </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${statusColors[promo.status]}`}>
                    {promo.status}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-50">
                <div className="text-center">
                    <span className="block text-lg font-bold text-gray-900">{promo.sent}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Sent</span>
                </div>
                <div className="text-center border-l border-gray-100">
                    <span className="block text-lg font-bold text-gray-900">{promo.openRate}%</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Open Rate</span>
                </div>
                <div className="text-center border-l border-gray-100">
                    <span className="block text-lg font-bold text-yum-primary">{promo.roi}x</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">ROI</span>
                </div>
            </div>

            <button className="text-sm font-bold text-gray-500 hover:text-yum-primary transition-colors text-center w-full">
                View Report
            </button>
        </div>
    )
}

export default PromotionCard
