// File: frontend/src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            // After success, we might want to navigate them to the reset page
            // Or just let them know to check their email.
            // For a better UX, we'll pass the email to the next step.
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-lightest flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-neutral-darkest">Reset Password</h2>
                    <p className="text-neutral-dark mt-2">Enter your email address and we'll send you an OTP to reset your password.</p>
                </div>

                {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md"><p>{message}</p></div>}
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"><p>{error}</p></div>}
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-4 py-3 bg-neutral-light border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all disabled:bg-gray-400"
                    >
                        {loading ? 'Sending...' : 'Send Reset OTP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;