import React from 'react'

const UserProfileInfo = ({ user }) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
            <div className="bg-gradient-to-r from-yum-primary to-orange-500 px-6 py-8 text-white">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-white p-1 shadow-lg">
                        <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{user?.name}</h1>
                        <p className="opacity-90">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-black/20 rounded-full text-xs font-bold uppercase tracking-widest">
                            Free Account
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to Margio Solutions!</h2>
                <p className="text-gray-600">
                    You are currently on the free tier. To access the advanced Restaurant Dashboard, specific AI analytics, and automated tools, please select a subscription plan below.
                </p>
            </div>
        </div>
    )
}

export default UserProfileInfo
