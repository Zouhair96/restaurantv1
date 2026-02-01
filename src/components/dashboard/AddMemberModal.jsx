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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-[#1a1c23] border border-white dark:border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Add Team Member</h2>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Configure access and role</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-yum-primary outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
                            placeholder="e.g. Sarah Johnson"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Role Assignment</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#24262d] text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-yum-primary outline-none transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="Manager">Manager</option>
                            <option value="Chef">Chef</option>
                            <option value="Sous Chef">Sous Chef</option>
                            <option value="Server">Server</option>
                            <option value="Bartender">Bartender</option>
                            <option value="Host">Host</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Terminal Access PIN</label>
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
                            className="w-full px-6 py-5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-3xl font-black text-center tracking-[1em] focus:border-yum-primary focus:ring-0 outline-none transition-all placeholder:text-gray-200 dark:placeholder:text-gray-700"
                            placeholder="••••"
                        />
                        <div className="flex items-center gap-2 mt-4 ml-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-yum-primary animate-pulse"></div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                Staff members use this PIN to log in
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 px-6 bg-yum-primary hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-yum-primary/20 transform active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddMemberModal
