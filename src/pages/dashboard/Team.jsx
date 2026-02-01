import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TeamMemberCard from '../../components/dashboard/TeamMemberCard'
import AddMemberModal from '../../components/dashboard/AddMemberModal'

const Team = () => {
    const { user } = useAuth()
    const { searchTerm } = useOutletContext() || { searchTerm: '' }
    const [teamMembers, setTeamMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddMemberModal, setShowAddMemberModal] = useState(false)

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/staff-mgmt', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setTeamMembers(data)
            }
        } catch (error) {
            console.error('Error fetching staff:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = async (newMember) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/staff-mgmt', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newMember)
            })
            if (response.ok) {
                fetchStaff()
                setShowAddMemberModal(false)
            } else {
                const err = await response.json()
                alert(err.error || 'Failed to add staff member')
            }
        } catch (error) {
            console.error('Error adding staff:', error)
        }
    }

    const handleRemoveMember = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY remove this staff member?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/staff-mgmt', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            })
            if (response.ok) {
                fetchStaff()
            }
        } catch (error) {
            console.error('Error removing staff:', error)
        }
    }

    const handleToggleStatus = async (id, is_active) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/.netlify/functions/staff-mgmt', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, is_active })
            })
            if (response.ok) {
                fetchStaff()
            }
        } catch (error) {
            console.error('Error toggling staff status:', error)
        }
    }

    const filteredStaff = teamMembers.filter(member => {
        const search = (searchTerm || '').toLowerCase()
        return !search ||
            member.name.toLowerCase().includes(search) ||
            member.role.toLowerCase().includes(search)
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your restaurant staff, roles, and shifts.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Restaurant ID</span>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm border border-gray-200 dark:border-gray-700 select-all group relative">
                        {user?.restaurant_id || user?.id}
                        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Staff login ID - Click to copy
                        </div>
                    </div>
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

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yum-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStaff.map(member => (
                        <TeamMemberCard
                            key={member.id}
                            member={member}
                            onRemove={handleRemoveMember}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            )}

            <AddMemberModal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} onAdd={handleAddMember} />
        </div>
    )
}

export default Team
