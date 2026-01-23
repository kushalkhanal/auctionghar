import React from 'react';

/**
 * Password Match Indicator
 * Shows visual feedback when password and confirmation match/don't match
 */
const PasswordMatchIndicator = ({ password, confirmPassword }) => {
    // Don't show anything if confirm password is empty
    if (!confirmPassword) return null;

    const doPasswordsMatch = password === confirmPassword;

    return (
        <div className="mt-2">
            {doPasswordsMatch ? (
                <div className="flex items-center gap-2 text-green-700 text-sm">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Passwords match</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-red-700 text-sm">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Passwords do not match</span>
                </div>
            )}
        </div>
    );
};

export default PasswordMatchIndicator;
