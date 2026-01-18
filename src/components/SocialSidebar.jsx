import React, { useState, useEffect } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa'

const SocialSidebar = () => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY < 50) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const socialLinks = [
        { icon: <FaFacebookF />, url: '#', color: 'bg-[#1877F2]' },
        { icon: <FaInstagram />, url: '#', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
        { icon: <FaLinkedinIn />, url: '#', color: 'bg-[#0A66C2]' },
        { icon: <FaYoutube />, url: '#', color: 'bg-[#FF0000]' }
    ]

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[999] hidden lg:flex flex-col gap-4">
            {socialLinks.map((social, index) => (
                <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        transitionDelay: `${isVisible ? index * 150 : (socialLinks.length - 1 - index) * 100}ms`
                    }}
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-500 ease-in-out transform hover:scale-110 hover:brightness-110 ${isVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-12 pointer-events-none'
                        } ${social.color}`}
                >
                    <span className="text-xl">{social.icon}</span>
                </a>
            ))}
        </div>
    )
}

export default SocialSidebar
