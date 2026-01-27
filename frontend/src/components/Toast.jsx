import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const Toast = ({ type = 'info', message, onClose, autoClose = true, duration = 5000 }) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const configs = {
        success: {
            icon: CheckCircleIcon,
            bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
            iconColor: 'text-white',
            borderColor: 'border-green-600'
        },
        error: {
            icon: XCircleIcon,
            bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
            iconColor: 'text-white',
            borderColor: 'border-red-600'
        },
        warning: {
            icon: ExclamationTriangleIcon,
            bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
            iconColor: 'text-white',
            borderColor: 'border-orange-600'
        },
        info: {
            icon: InformationCircleIcon,
            bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
            iconColor: 'text-white',
            borderColor: 'border-blue-600'
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <div
            className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`${config.bgColor} text-white rounded-xl shadow-2xl p-4 pr-12 max-w-md border-2 ${config.borderColor}`}>
                <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                    <p className="text-sm font-medium leading-relaxed">{message}</p>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onClose?.(), 300);
                    }}
                    className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Progress Bar */}
                {autoClose && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl overflow-hidden">
                        <div
                            className="h-full bg-white animate-shrink"
                            style={{ animationDuration: `${duration}ms` }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => removeToast(toast.id)}
                    autoClose={toast.autoClose}
                    duration={toast.duration}
                />
            ))}
        </div>
    );
};

// Custom Hook for Toast Management
export const useToast = () => {
    const [toasts, setToasts] = React.useState([]);

    const addToast = (message, type = 'info', options = {}) => {
        const id = Date.now();
        const newToast = {
            id,
            message,
            type,
            autoClose: options.autoClose !== false,
            duration: options.duration || 5000
        };

        setToasts((prev) => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return {
        toasts,
        addToast,
        removeToast,
        success: (message, options) => addToast(message, 'success', options),
        error: (message, options) => addToast(message, 'error', options),
        warning: (message, options) => addToast(message, 'warning', options),
        info: (message, options) => addToast(message, 'info', options)
    };
};

export default Toast;
