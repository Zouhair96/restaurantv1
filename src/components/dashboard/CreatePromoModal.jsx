import React, { useState } from 'react'

const CreatePromoModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('')
    const [type, setType] = useState('SMS')
    const [content, setContent] = useState('')

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onCreate({ name, type, content })
        // Reset
        setName('')
        setType('SMS')
        setContent('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create Campaign</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary"
                            placeholder="e.g. Friday Happy Hour"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                        <div className="flex gap-2">
                            {['SMS', 'Email', 'Push'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-2 rounded-lg border font-bold text-sm transition-all ${type === t ? 'bg-yum-light border-yum-primary text-yum-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                        <textarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yum-primary focus:border-yum-primary resize-none"
                            placeholder={type === 'SMS' ? "Grab 20% off tonight only! Show this text." : "Subject: You're invited..."}
                        ></textarea>
                        <p className="text-xs text-gray-400 text-right mt-1">{content.length} characters</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl text-sm">
                        <p className="font-bold text-gray-700 mb-1">Estimated Reach</p>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Active Customers (Last 30 days)</span>
                            <span className="font-bold text-gray-900">1,245</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Draft
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 bg-yum-primary text-white rounded-lg font-bold hover:bg-red-500 transition-colors shadow-lg"
                        >
                            Launch Campaign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePromoModal
