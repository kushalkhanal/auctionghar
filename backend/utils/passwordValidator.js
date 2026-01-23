/**
 * Password Validation Utility
 * Enforces password complexity requirements for secure user authentication
 */

/**
 * Validates password against security requirements
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with success status and details
 */
const validatePassword = (password) => {
    const result = {
        isValid: true,
        errors: [],
        requirements: {
            minLength: false,
            hasUppercase: false,
            hasLowercase: false,
            hasDigit: false,
            hasSpecialChar: false
        }
    };

    // Minimum length check (8 characters)
    if (password.length >= 8) {
        result.requirements.minLength = true;
    } else {
        result.isValid = false;
        result.errors.push('Password must be at least 8 characters long');
    }

    // Uppercase letter check
    if (/[A-Z]/.test(password)) {
        result.requirements.hasUppercase = true;
    } else {
        result.isValid = false;
        result.errors.push('Password must contain at least one uppercase letter (A-Z)');
    }

    // Lowercase letter check
    if (/[a-z]/.test(password)) {
        result.requirements.hasLowercase = true;
    } else {
        result.isValid = false;
        result.errors.push('Password must contain at least one lowercase letter (a-z)');
    }

    // Digit check
    if (/[0-9]/.test(password)) {
        result.requirements.hasDigit = true;
    } else {
        result.isValid = false;
        result.errors.push('Password must contain at least one digit (0-9)');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
        result.requirements.hasSpecialChar = true;
    } else {
        result.isValid = false;
        result.errors.push('Password must contain at least one special symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }

    return result;
};

/**
 * Gets a user-friendly error message from validation results
 * @param {Object} validationResult - Result from validatePassword
 * @returns {string} - Formatted error message
 */
const getPasswordErrorMessage = (validationResult) => {
    if (validationResult.isValid) {
        return '';
    }
    return validationResult.errors.join('. ') + '.';
};

module.exports = {
    validatePassword,
    getPasswordErrorMessage
};
