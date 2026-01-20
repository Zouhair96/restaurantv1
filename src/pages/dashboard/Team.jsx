import React, { useState } from 'react'
import TeamMemberCard from '../../components/dashboard/TeamMemberCard'
import AddMemberModal from '../../components/dashboard/AddMemberModal'

const Team = () => {
    // Mock Team Data State
    const [teamMembers, setTeamMembers] = useState([
        { id: 1, name: 'Alex Rivera', role: 'Head Chef', status: 'On Shift', hours: 42, sales: 0 },
        { id: 2, name: 'Sarah Chen', role: 'Manager', status: 'On Shift', hours: 38, sales: 0 },
        { id: 3, name: 'Mike Johnson', role: 'Server', status: 'On Shift', hours: 25, sales: 1250 },
        { id: 4, name: 'Emily Davis', role: 'Bartender', status: 'Off Duty', hours: 30, sales: 850 },
    ])
    const [showAddMemberModal, setShowAddMemberModal] = useState(false)

    // Team Management Handlers
    const handleAddMember = (newMember) => {
        const memberWithId = {
            ...newMember,
            id: Date.now(), // Simple ID generation
            status: 'Off Duty',
            hours: 0,
            sales: 0
        }
        setTeamMembers([...teamMembers, memberWithId])
        setShowAddMemberModal(false)
    }

    const handleRemoveMember = (id) => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            setTeamMembers(teamMembers.filter(m => m.id !== id))
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your restaurant staff, roles, and shifts.</p>
                </div>
                <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 bg-yum-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500 transition-colors border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamMembers.map(member => (
                    <TeamMemberCard key={member.id} member={member} onRemove={handleRemoveMember} />
                ))}
            </div>

            <AddMemberModal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} onAdd={handleAddMember} />
        </div>
    )
}

export default Team
