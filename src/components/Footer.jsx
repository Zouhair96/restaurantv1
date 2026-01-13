import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-yum-dark text-white py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                        <img src="/assets/yumyum_logo.png" alt="YumYum Logo" className="h-8 w-auto brightness-200 grayscale" />
                        <span>YumYum</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} YumYum. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
