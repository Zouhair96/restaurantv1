import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const Contact = () => {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)
        setError(false)

        const formData = new FormData(e.target)

        try {
            const response = await fetch("https://formsubmit.co/zouhair.benali96@gmail.com", {
                method: "POST",
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })

            if (response.ok) {
                setSuccess(true)
                e.target.reset()
            } else {
                setError(true)
            }
        } catch (err) {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section id="contact" className="py-20 bg-yum-primary/5">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/2 bg-yum-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-6">{t('contact.title')}</h2>
                            <p className="text-white/90 text-lg mb-8">
                                {t('contact.subtitle')}
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <span className="font-medium">+33 1 23 45 67 89</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className="font-medium">contact@yumyum.com</span>
                                </div>
                            </div>
                        </div>
                        {/* Blob */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="md:w-1/2 p-12">
                        {success ? (
                            <div className="h-full flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 text-2xl">
                                    ✓
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('contact.successTitle')}</h3>
                                <p className="text-gray-600">{t('contact.successDesc')}</p>
                                <button onClick={() => setSuccess(false)} className="mt-6 text-yum-primary font-bold hover:underline">
                                    {t('contact.successReset')}
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
                                <input type="hidden" name="_captcha" value="false" />
                                <input type="hidden" name="_template" value="table" />
                                <input type="hidden" name="_subject" value="Nouveau prospect YumYum !" />

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('contact.formTitle')}</label>
                                    <input type="text" name="name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400" placeholder={t('contact.placeholderName')} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('contact.formRestaurant')}</label>
                                    <input type="text" name="restaurant" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400" placeholder={t('contact.placeholderResto')} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('contact.formEmail')}</label>
                                    <input type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400" placeholder={t('contact.placeholderEmail')} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('contact.formMessage')}</label>
                                    <textarea name="message" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all placeholder-gray-400 h-32 resize-none" placeholder={t('contact.placeholderMsg')} required></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('contact.formAttachment')}</label>
                                    <input type="file" name="attachment" accept="image/*,video/*,.pdf" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yum-primary focus:ring-2 focus:ring-yum-primary/20 outline-none transition-all text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-yum-light file:text-yum-primary hover:file:bg-red-100" />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-yum-dark text-white font-bold py-4 rounded-xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : t('contact.cta')}
                                </button>
                                {error && (
                                    <p className="text-red-500 text-center text-sm mt-2">{t('contact.error')}</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Contact
