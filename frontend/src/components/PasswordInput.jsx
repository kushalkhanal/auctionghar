import React, { useState } from 'react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import CapsLockWarning from './CapsLockWarning';

/**
 * Enhanced Password Input Component
 * Features: visibility toggle, caps lock detection, optional strength meter
 */
const PasswordInput = ({
    label,
    value,
    onChange,
    placeholder = "Enter password",
    required = true,
    showStrengthMeter = false,
    showCapsLockWarning = true,
    className = "",
    id,
    name,
    autoComplete
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    const handleKeyDown = (e) => {
        // Detect if Caps Lock is on
        if (e.getModifierState) {
            setCapsLockOn(e.getModifierState('CapsLock'));
        }
    };

    const handleKeyUp = (e) => {
        // Update Caps Lock state on key up as well
        if (e.getModifierState) {
            setCapsLockOn(e.getModifierState('CapsLock'));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-neutral-darkest mb-2"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id={id}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 bg-neutral-light border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-glow transition duration-300"
                    required={required}
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-dark hover:text-neutral-darkest transition-colors duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        // Eye slash icon (hide)
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        // Eye icon (show)
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Caps Lock Warning */}
            {showCapsLockWarning && <CapsLockWarning isActive={capsLockOn} />}

            {/* Password Strength Indicator */}
            {showStrengthMeter && <PasswordStrengthIndicator password={value} />}
        </div>
    );
};

export default PasswordInput;
