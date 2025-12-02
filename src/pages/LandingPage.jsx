import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#E0F2F1] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#4DB6AC]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
                <Icon name="Brain" size={32} className="text-[#008080]" />
                <span className="font-heading font-bold text-2xl text-gray-800">MindConnect</span>
            </div>

            {/* Hero Image / Illustration Placeholder */}
            <div className="mb-8 relative">
                <div className="w-64 h-64 bg-white/50 rounded-full flex items-center justify-center relative z-10 backdrop-blur-sm">
                    {/* Placeholder for the heart/brain illustration in the image */}
                    <Icon name="Heart" size={120} className="text-[#4DB6AC] opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon name="Brain" size={60} className="text-white drop-shadow-md" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="text-center max-w-md z-10">
                <h1 className="font-heading font-bold text-3xl text-gray-900 mb-4 leading-tight">
                    Your Safe Space for<br />Mental Wellness
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Join a supportive community combining peer interaction, professional guidance, and self-help tools
                </p>

                <div className="space-y-4 w-full">
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full py-4 bg-[#368484] text-white font-bold rounded-full shadow-lg hover:bg-[#2c6e6e] transition-transform transform active:scale-95"
                    >
                        Get Started
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-transparent border-2 border-[#368484] text-[#368484] font-bold rounded-full hover:bg-[#368484]/5 transition-colors"
                    >
                        I already have an account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
