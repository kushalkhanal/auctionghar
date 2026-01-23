// File: frontend/src/pages/ResetPasswordPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get URL query params

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get the email from the URL query parameter when the page loads
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const emailFromUrl = searchParams.get('email');
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validate password complexity on client side
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special symbol.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/reset-password', { otp, email, newPassword });
            setMessage(response.data.message + " Redirecting to login...");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-lightest flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-neutral-darkest">Set New Password</h2>
                    <p className="text-neutral-dark mt-2">Enter the OTP sent to <span className="font-semibold">{email}</span> and your new password.</p>
                </div>

                {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md"><p>{message}</p></div>}
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"><p>{error}</p></div>}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">One-Time Password (OTP)</label>
                        <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1 w-full px-4 py-3 bg-neutral-light border rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            minLength="8"
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Password (min. 8 characters)"
                            className="mt-1 w-full px-4 py-3 bg-neutral-light border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <PasswordStrengthIndicator password={newPassword} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-gray-400">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;