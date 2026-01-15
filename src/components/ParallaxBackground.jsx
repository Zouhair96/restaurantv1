import React, { useEffect, useState } from 'react'

const ParallaxBackground = ({ children }) => {
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.pageYOffset)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* White Section */}
                <div className="absolute inset-0 bg-white"></div>

                {/* Red Wave Section */}
                <div
                    className="absolute inset-x-0 top-0 h-[150vh] bg-primary-red transition-transform duration-100 ease-out"
                    style={{
                        transform: `translateY(${50 + offset * 0.2}vh) rotate(${-5 + offset * 0.01}deg) scale(1.5)`,
                        clipPath: 'ellipse(100% 50% at 50% 0%)',
                        opacity: 0.95
                    }}
                ></div>

                {/* Secondary Wave for depth */}
                <div
                    className="absolute inset-x-0 top-0 h-[150vh] bg-red-600 transition-transform duration-150 ease-out"
                    style={{
                        transform: `translateY(${60 + offset * 0.15}vh) rotate(${2 + offset * 0.005}deg) scale(1.6)`,
                        clipPath: 'ellipse(100% 50% at 50% 0%)',
                        opacity: 0.4
                    }}
                ></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

export default ParallaxBackground
