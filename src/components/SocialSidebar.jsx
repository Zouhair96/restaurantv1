import React, { useState, useEffect } from 'react'
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const socialLinks = [
    { icon: <FaFacebookF />, url: '#', color: 'bg-[#1877F2]', shadow: 'shadow-[#1877F2]/30', glow: 'shadow-[0_0_30px_rgba(24,119,242,0.7)]' },
    { icon: <FaInstagram />, url: '#', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]', shadow: 'shadow-[#DD2A7B]/30', glow: 'shadow-[0_0_30px_rgba(221,42,123,0.7)]' },
    { icon: <FaTiktok />, url: '#', color: 'bg-[#000000]', shadow: 'shadow-black/30', glow: 'shadow-[0_0_30px_rgba(37,244,238,0.5),0_0_30px_rgba(254,44,85,0.5)]' },
    { icon: <FaYoutube />, url: '#', color: 'bg-[#FF0000]', shadow: 'shadow-[#FF0000]/30', glow: 'shadow-[0_0_30px_rgba(255,0,0,0.7)]' }
]

const SocialSidebar = () => {
    const [isVisible, setIsVisible] = useState(true)
    const [activeIndex, setActiveIndex] = useState(-1)
    const { user } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = window.innerHeight * 0.1
            setIsVisible(window.scrollY < scrollThreshold)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Sequential Pulse Animation Effect
    useEffect(() => {
        const triggerPulseSequence = () => {
            socialLinks.forEach((_, index) => {
                setTimeout(() => {
                    setActiveIndex(index)
                    setTimeout(() => setActiveIndex(-1), 800)
                }, index * 400)
            })
        }

        const interval = setInterval(triggerPulseSequence, 5000)
        const initialTimeout = setTimeout(triggerPulseSequence, 1500)

        return () => {
            clearInterval(interval)
            clearTimeout(initialTimeout)
        }
    }, [])

    return (
        <div className={`
            fixed left-4 lg:left-6 top-1/2 -translate-y-1/2 z-[999] 
            hidden lg:flex flex-col gap-3 lg:gap-4 transition-all duration-500
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none'}
        `}>
            {socialLinks.map((social, index) => (
                <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
                    }}
                    className={`
                        w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full 
                        text-white border-2 border-white/50
                        shadow-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
                        transform 
                        ${activeIndex === index
                            ? `scale-150 rotate-12 z-50 border-white ring-4 ring-white/30 ${social.glow}`
                            : 'hover:scale-125 hover:rotate-[360deg] hover:border-white hover:z-20'
                        }
                        ${social.color} ${social.shadow} 
                        ${activeIndex === -1 ? `hover:${social.glow}` : ''}
                    `}
                >
                    <span className={`text-lg lg:text-xl relative z-10 transition-transform duration-300 ${activeIndex === index ? 'scale-125' : ''}`}>
                        {social.icon}
                    </span>
                </a>
            ))}
        </div>
    )
}

export default SocialSidebar
