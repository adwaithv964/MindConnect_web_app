import React from 'react';
import Icon from './AppIcon';

const AuthLayout = ({ children, title, subtitle, features, quote }) => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Info & Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-[#4A90E2] to-[#50E3C2] p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3 mb-12">
                    <Icon name="Brain" size={32} className="text-white" />
                    <span className="font-heading font-bold text-2xl tracking-tight">MindConnect</span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="font-heading font-bold text-4xl lg:text-5xl mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-white/90 mb-12 leading-relaxed">
                        {subtitle}
                    </p>

                    {/* Features Grid */}
                    {features && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Icon name={feature.icon} size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                                        <p className="text-sm text-white/80 leading-snug">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quote/Footer */}
                <div className="relative z-10 mt-auto">
                    {quote && (
                        <blockquote className="text-lg italic text-white/90 border-l-4 border-white/30 pl-4">
                            "{quote}"
                        </blockquote>
                    )}
                    <p className="text-sm text-white/60 mt-8">
                        © {new Date().getFullYear()} MindConnect. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex items-center justify-center overflow-y-auto">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
