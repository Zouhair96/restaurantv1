import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'

const Footer = () => {
    const { t } = useLanguage()

    return (
        <footer className="bg-yum-dark text-white py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                        <img src="/assets/yumyum_logo.png" alt="YumYum Logo" className="h-8 w-auto brightness-200 grayscale opacity-50" />
                        <span className="opacity-80">YumYum</span>
                    </div>
                    <div className="text-gray-400 text-sm italic">
                        © {new Date().getFullYear()} YumYum. {t('footer.rights')}
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2]/20 hover:bg-[#1877F2] text-white transition-all transform hover:scale-110 shadow-sm"><FaFacebookF className="text-sm" /></a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#DD2A7B]/20 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-white transition-all transform hover:scale-110 shadow-sm"><FaInstagram className="text-sm" /></a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black text-white transition-all transform hover:scale-110 shadow-sm"><FaTiktok className="text-sm" /></a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF0000]/20 hover:bg-[#FF0000] text-white transition-all transform hover:scale-110 shadow-sm"><FaYoutube className="text-sm" /></a>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</a>
                        <a href="#contact" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact')}</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}


export default Footer
