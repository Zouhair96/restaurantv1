import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'

const Footer = () => {
    const { t } = useLanguage()

    return (
        <footer className="bg-yum-dark text-white py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                        <span className="opacity-80">YumYum</span>
                    </div>
                    <div className="text-gray-400 text-sm italic">
                        © {new Date().getFullYear()} YumYum. {t('footer.rights')}
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:scale-110 transition-transform"><FaFacebookF className="text-sm" /></a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:scale-110 transition-transform"><FaInstagram className="text-sm" /></a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:scale-110 transition-transform"><FaTiktok className="text-sm" /></a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF0000] text-white hover:scale-110 transition-transform"><FaYoutube className="text-sm" /></a>
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
