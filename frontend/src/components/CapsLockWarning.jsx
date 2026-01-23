import React, { useState } from 'react';

/**
 * Caps Lock Warning Component
 * Displays a warning when Caps Lock is detected as active
 */
const CapsLockWarning = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="mt-2 flex items-center gap-2 text-yellow-700 bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded-md text-sm" role="alert">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Caps Lock is ON</span>
        </div>
    );
};

export default CapsLockWarning;
