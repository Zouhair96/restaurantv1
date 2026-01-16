import React from 'react'

const TeamMemberCard = ({ member, onRemove }) => {
    const roleColors = {
        'Manager': 'bg-purple-100 text-purple-700 border-purple-200',
        'Chef': 'bg-red-100 text-red-700 border-red-200',
        'Server': 'bg-blue-100 text-blue-700 border-blue-200',
        'Host': 'bg-green-100 text-green-700 border-green-200',
        'Bartender': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }

    const statusColor = member.status === 'On Shift' ? 'bg-green-500' : 'bg-gray-300'

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-4 hover:shadow-md transition-all group relative">
            <button
                onClick={() => onRemove(member.id)}
                className="absolute top-2 right-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                title="Remove Member"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>

            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-400 dark:text-gray-500 overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm">
                    {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        member.name.charAt(0)
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColors[member.role] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>
                            {member.role}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                            {member.status}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-gray-50 dark:border-gray-700 pt-3 mt-1">
                <div className="text-gray-500 dark:text-gray-400">
                    <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Weekly Hours</span>
                    <span className="font-medium text-gray-900 dark:text-white">{member.hours || 0} hrs</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-right">
                    <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Sales</span>
                    <span className="font-medium text-gray-900 dark:text-white">${member.sales || 0}</span>
                </div>
            </div>
        </div>
    )
}

export default TeamMemberCard
