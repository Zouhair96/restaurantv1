import React, { useState } from 'react'

const AddMemberModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('')
    const [role, setRole] = useState('Server')
    const [pin, setPin] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        if (pin.length !== 4) {
            alert('PIN must be exactly 4 digits')
            return
        }
        onAdd({ name, role, pin })
        // Reset form
        setName('')
        setRole('Server')
        setPin('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Add New Team Member</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary"
                            placeholder="e.g. Sarah Johnson"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary"
                        >
                            <option value="Manager">Manager</option>
                            <option value="Chef">Chef</option>
                            <option value="Sous Chef">Sous Chef</option>
                            <option value="Server">Server</option>
                            <option value="Bartender">Bartender</option>
                            <option value="Host">Host</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Access PIN (4 Digits)</label>
                        <input
                            type="text"
                            required
                            maxLength={4}
                            pattern="\d{4}"
                            value={pin}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 4) setPin(val);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary"
                            placeholder="e.g. 1234"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-bold italic">
                            Used by staff to login with this restaurant's ID
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 bg-yum-primary text-white rounded-lg font-bold hover:bg-red-500 transition-colors shadow-lg"
                        >
                            Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddMemberModal
