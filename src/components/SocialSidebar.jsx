import React, { useState, useEffect } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa'

const SocialSidebar = () => {
    const [isVisible, setIsVisible] = useState(true)

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
        { icon: <FaFacebookF />, url: '#', color: 'hover:bg-[#1877F2]', glow: 'hover:shadow-[0_0_20px_rgba(24,119,242,0.5)]' },
        { icon: <FaInstagram />, url: '#', color: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF]', glow: 'hover:shadow-[0_0_20px_rgba(221,42,123,0.5)]' },
        { icon: <FaLinkedinIn />, url: '#', color: 'hover:bg-[#0A66C2]', glow: 'hover:shadow-[0_0_20px_rgba(10,102,194,0.5)]' },
        { icon: <FaYoutube />, url: '#', color: 'hover:bg-[#FF0000]', glow: 'hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]' }
    ]

    return (
        <div className="fixed left-4 lg:left-6 top-1/2 -translate-y-1/2 z-[999] flex flex-col gap-3 lg:gap-4">
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
                        text-yum-dark lg:text-white backdrop-blur-xl border border-white/20 
                        shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                        transform hover:scale-125 hover:rotate-[360deg] hover:text-white
                        ${isVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-20 pointer-events-none'
                        } 
                        ${social.color} ${social.glow} 
                        bg-white/10 hover:border-transparent
                    `}
                >
                    <span className="text-lg lg:text-xl relative z-10">{social.icon}</span>
                </a>
            ))}
        </div>
    )
}

export default SocialSidebar
