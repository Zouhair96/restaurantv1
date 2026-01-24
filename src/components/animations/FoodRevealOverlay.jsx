import React, { useEffect, useState } from 'react';

const FoodRevealOverlay = ({ image, onComplete }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Start exit animation after 2.5 seconds
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 2200);

        // Complete after exit animation (approx 0.8s)
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-700
            ${isExiting ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}
        >
            <div className="relative">
                {/* Steam Effects */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 flex justify-center gap-4 opacity-50 pointer-events-none">
                    <span className="w-4 h-20 bg-gradient-to-t from-gray-200 to-transparent blur-md rounded-full animate-[steamRise_2s_infinite_ease-out]"></span>
                    <span className="w-4 h-24 bg-gradient-to-t from-gray-200 to-transparent blur-md rounded-full animate-[steamRise_2.5s_infinite_ease-out_0.5s]"></span>
                    <span className="w-4 h-16 bg-gradient-to-t from-gray-200 to-transparent blur-md rounded-full animate-[steamRise_3s_infinite_ease-out_0.2s]"></span>
                </div>

                {/* Food Image */}
                <div className="w-80 h-80 md:w-96 md:h-96 rounded-full shadow-2xl shadow-orange-500/20 animate-[foodAppear_1s_cubic-bezier(0.34,1.56,0.64,1)_forwards] relative z-10 bg-white">
                    <img
                        src={image}
                        alt="Delicious Food"
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default FoodRevealOverlay;
