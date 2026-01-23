import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
    // Check password requirements
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasDigit: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    };

    // Calculate strength level
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let strength = 'weak';
    let strengthColor = 'bg-red-500';
    let strengthText = 'Weak';

    if (metRequirements >= 5) {
        strength = 'strong';
        strengthColor = 'bg-green-500';
        strengthText = 'Strong';
    } else if (metRequirements >= 3) {
        strength = 'medium';
        strengthColor = 'bg-yellow-500';
        strengthText = 'Medium';
    }

    // Only show indicator if password has content
    if (!password) return null;

    return (
        <div className="mt-3 p-4 bg-neutral-light rounded-lg space-y-3">
            {/* Strength Meter */}
            <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-neutral-darkest">Password Strength:</span>
                    <span className={`font-semibold ${strength === 'strong' ? 'text-green-600' :
                            strength === 'medium' ? 'text-yellow-600' :
                                'text-red-600'
                        }`}>
                        {strengthText}
                    </span>
                </div>
                <div className="w-full h-2 bg-neutral-light rounded-full overflow-hidden">
                    <div
                        className={`h-full ${strengthColor} transition-all duration-300 ease-in-out`}
                        style={{ width: `${(metRequirements / 5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-1.5">
                <p className="text-xs font-medium text-neutral-dark">Requirements:</p>
                <div className="space-y-1">
                    <RequirementItem met={requirements.minLength} text="At least 8 characters" />
                    <RequirementItem met={requirements.hasUppercase} text="One uppercase letter (A-Z)" />
                    <RequirementItem met={requirements.hasLowercase} text="One lowercase letter (a-z)" />
                    <RequirementItem met={requirements.hasDigit} text="One digit (0-9)" />
                    <RequirementItem met={requirements.hasSpecialChar} text="One special symbol (!@#$%^&*...)" />
                </div>
            </div>
        </div>
    );
};

// Helper component for requirement items
const RequirementItem = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${met ? 'bg-green-500' : 'bg-neutral-light border-2 border-neutral-dark'
            }`}>
            {met && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className={`transition-colors duration-200 ${met ? 'text-green-700 font-medium' : 'text-neutral-dark'}`}>
            {text}
        </span>
    </div>
);

export default PasswordStrengthIndicator;
