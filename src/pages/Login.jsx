import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

const Login = () => {
    const { t } = useLanguage()
    const { login, signup, staffLogin } = useAuth()
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    // Form States
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [restaurantName, setRestaurantName] = useState('')
    const [address, setAddress] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSuccess('')
        setError('')

        try {
            if (isLogin) {
                let user;
                if (loginMode === 'STAFF') {
                    const result = await loginStaff(restaurantId, pin);
                    user = result.user;
                } else {
                    const result = await login(email, password);
                    user = result.user;
                }

                setSuccess(t('auth.successLogin'))
                setTimeout(() => {
                    if (user?.role === 'ADMIN') {
                        navigate('/admin')
                    } else if (user?.role === 'STAFF') {
                        navigate('/orders')
                    } else {
                        navigate('/dashboard')
                    }
                }, 1500)
            } else {
                // Validation for Restaurant Name
                const restaurantNameRegex = /^[a-zA-Z0-9.\-\_\s]+$/
                if (!restaurantNameRegex.test(restaurantName)) {
                    throw new Error(t('auth.invalidRestaurantName') || "Restaurant name contains invalid characters.")
                }

                const { user } = await signup({ name, email, password, restaurantName, address, phoneNumber })
                setSuccess(t('auth.successSignup'))
                // Redirect after short delay
                setTimeout(() => {
                    // New signups are typically restaurants/clients, but we check role to be safe
                    if (user?.role === 'admin') {
                        navigate('/admin')
                    } else {
                        navigate('/dashboard')
                    }
                }, 1500)
            }
        } catch (err) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-yum-light font-sans">
            <Header />
            <div className="flex-grow flex flex-col justify-center items-center px-4 pt-32 pb-20">
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 relative z-10">
                    <div className="text-center mb-8">
                        {/* Logo removed from here since it's in the Header now */}
                        <h1 className="text-2xl font-bold text-yum-dark">
                            {isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}
                        </h1>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center mb-6 font-bold border border-red-100">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                            <p className="font-bold text-gray-800 text-lg mb-6">{success}</p>
                            <Link to="/" className="text-yum-primary font-bold hover:underline">
                                {t('demo.back')}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isLogin && (
                                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setLoginMode('OWNER')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${loginMode === 'OWNER' ? 'bg-white text-yum-primary shadow-lg ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Restaurant Owner
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLoginMode('STAFF')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${loginMode === 'STAFF' ? 'bg-white text-yum-primary shadow-lg ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Staff Member
                                    </button>
                                </div>
                            )}

                            {!isLogin && (
                                <>
                                    {/* Signup fields (Only for Owners) */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('auth.name')}</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400"
                                            required={!isLogin}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('auth.restaurantName')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400"
                                            placeholder="Letters, numbers, . - _"
                                            required={!isLogin}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('auth.phone')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400"
                                            required={!isLogin}
                                        />
                                    </div>
                                </>
                            )}

                            {isLogin && loginMode === 'STAFF' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Restaurant ID</label>
                                        <input
                                            type="text"
                                            value={restaurantId}
                                            onChange={(e) => setRestaurantId(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all font-mono"
                                            required
                                            placeholder="Enter ID provided by owner"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Access PIN</label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all text-center tracking-[1em] text-2xl font-bold"
                                            required
                                            placeholder="••••"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('auth.email')}</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('auth.password')}</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {isLogin && (
                                <div className="text-right">
                                    <a href="#" className="text-sm text-gray-500 hover:text-yum-primary transition-colors">
                                        {t('auth.forgotPassword')}
                                    </a>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yum-primary text-white font-bold py-3 rounded-xl hover:bg-red-500 transition-all flex justify-center items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (isLogin ? t('auth.submitLogin') : t('auth.submitSignup'))}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500">
                            {isLogin ? t('auth.toggleToSignup') : t('auth.toggleToLogin')}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setSuccess('')
                                }}
                                className="ml-2 font-bold text-yum-primary hover:underline focus:outline-none"
                            >
                                {isLogin ? t('auth.linkSignup') : t('auth.linkLogin')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Login
