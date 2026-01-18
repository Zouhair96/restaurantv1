import React, { useState, useEffect } from 'react'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const SocialSidebar = () => {
    const [isVisible, setIsVisible] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = window.innerHeight * 0.1 // Appear when in the top 10% of viewport
            if (window.scrollY < scrollThreshold) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const socialLinks = [
        { icon: <FaFacebookF />, url: '#', color: 'bg-[#1877F2]', shadow: 'shadow-[#1877F2]/30', glow: 'hover:shadow-[0_0_30px_rgba(24,119,242,0.7)]' },
        { icon: <FaInstagram />, url: '#', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]', shadow: 'shadow-[#DD2A7B]/30', glow: 'hover:shadow-[0_0_30px_rgba(221,42,123,0.7)]' },
        { icon: <FaTiktok />, url: '#', color: 'bg-[#000000]', shadow: 'shadow-black/30', glow: 'hover:shadow-[0_0_30px_rgba(37,244,238,0.5),0_0_30px_rgba(254,44,85,0.5)]' },
        { icon: <FaYoutube />, url: '#', color: 'bg-[#FF0000]', shadow: 'shadow-[#FF0000]/30', glow: 'hover:shadow-[0_0_30px_rgba(255,0,0,0.7)]' }
    ]

    return (
        <div className={`fixed right-4 lg:right-auto lg:left-6 top-1/2 -translate-y-1/2 z-[999] flex flex-col gap-3 lg:gap-4`}>
            {socialLinks.map((social, index) => (
                <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        transitionDelay: `${isVisible ? index * 100 : (socialLinks.length - 1 - index) * 80}ms`
                    }}
                    className={`
                        w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full 
                        text-white border-2 border-white/50
                        shadow-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                        transform hover:scale-125 hover:rotate-[360deg]
                        ${isVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-20 pointer-events-none'
                        } 
                        ${social.color} ${social.shadow} ${social.glow}
                        hover:border-white hover:z-20
                    `}
                >
                    <span className="text-lg lg:text-xl relative z-10">{social.icon}</span>
                </a>
            ))}
        </div>
    )
}

export default SocialSidebar
