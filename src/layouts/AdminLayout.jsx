import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = ({ children, activeSection, onSectionChange }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FE] dark:bg-[#0f1115] transition-colors duration-300">
            {/* Background Mesh Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#6359E9]/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-pink-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-[20%] w-[50%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Mobile Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={closeMobileMenu}
                />
            )}

            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                isMobileMenuOpen={isMobileMenuOpen}
                closeMobileMenu={closeMobileMenu}
            />

            <div className="flex flex-col min-h-screen pl-0 md:pl-24 transition-all duration-300">
                <AdminHeader
                    activeSection={activeSection}
                    onSectionChange={onSectionChange}
                    toggleMobileMenu={toggleMobileMenu}
                />

                <main className="flex-1 p-4 sm:p-6 md:p-8 relative z-10 max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
