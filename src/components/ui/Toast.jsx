import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const styles = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200'
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <AlertCircle className="w-5 h-5 text-blue-500" />
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-lg transition-all duration-300 transform translate-y-0 ${styles[type]}`}>
            <div className="flex-shrink-0 mr-3">
                {icons[type]}
            </div>
            <div className="text-sm font-medium">{message}</div>
            <button
                onClick={() => { setIsVisible(false); onClose(); }}
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-offset-2 p-1.5 hover:bg-black/5 inline-flex items-center justify-center h-8 w-8"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
