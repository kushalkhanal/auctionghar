import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PasswordExpiryWarning({ daysRemaining, onDismiss }) {
    const navigate = useNavigate();
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed || !daysRemaining) {
        return null;
    }

    const handleDismiss = () => {
        setIsDismissed(true);
        if (onDismiss) {
            onDismiss();
        }
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    // Determine urgency level based on days remaining
    const isUrgent = daysRemaining <= 3;
    const bgColor = isUrgent ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500';
    const textColor = isUrgent ? 'text-red-800' : 'text-yellow-800';
    const iconColor = isUrgent ? 'text-red-600' : 'text-yellow-600';
    const buttonColor = isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700';

    return (
        <div className={`${bgColor} border-l-4 p-4 mb-4 rounded-md shadow-md`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <svg className={`h-6 w-6 ${iconColor} mr-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                        <p className={`font-medium ${textColor}`}>
                            Password Expiration Warning
                        </p>
                        <p className={`text-sm ${textColor} mt-1`}>
                            Your password expires in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>.
                            Please change it soon to maintain account security.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                    <button
                        onClick={handleChangePassword}
                        className={`${buttonColor} text-white px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200`}
                    >
                        Change Password
                    </button>
                    <button
                        onClick={handleDismiss}
                        className={`${textColor} hover:bg-white/30 p-2 rounded-md transition-colors duration-200`}
                        aria-label="Dismiss warning"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
