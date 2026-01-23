import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import PasswordInput from '../components/PasswordInput';

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        // Validate new password is different from current
        if (currentPassword === newPassword) {
            setError('New password must be different from current password.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.put('/users/change-password', {
                currentPassword,
                newPassword
            });

            setSuccess(response.data.message || 'Password changed successfully!');

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                navigate('/profile');
            }, 2000);

        } catch (err) {
            const message = err.response?.data?.message || 'Failed to change password. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <div className="min-h-screen bg-neutral-lightest py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center border-b pb-6">
                        <h1 className="text-3xl font-bold text-neutral-darkest">Change Password</h1>
                        <p className="text-neutral-dark mt-2">
                            Update your password to keep your account secure
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <PasswordInput
                                label="Current Password"
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                showCapsLockWarning={true}
                                showStrengthMeter={false}
                                id="currentPassword"
                                required={true}
                                disabled={loading || !!success}
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <PasswordInput
                                label="New Password"
                                value={newPassword}
                                onChange={setNewPassword}
                                showCapsLockWarning={true}
                                showStrengthMeter={true}
                                id="newPassword"
                                required={true}
                                disabled={loading || !!success}
                            />
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <PasswordInput
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                showCapsLockWarning={true}
                                showStrengthMeter={false}
                                id="confirmPassword"
                                required={true}
                                disabled={loading || !!success}
                            />
                            {confirmPassword && newPassword && confirmPassword !== newPassword && (
                                <p className="text-red-600 text-sm mt-2">Passwords do not match</p>
                            )}
                            {confirmPassword && newPassword && confirmPassword === newPassword && (
                                <p className="text-green-600 text-sm mt-2 flex items-center">
                                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Passwords match
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 py-3 font-semibold text-neutral-darkest bg-neutral-light rounded-lg hover:bg-neutral-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-dark transition-all duration-300"
                                disabled={loading || !!success}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={loading || !!success}
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </div>
                    </form>

                    {/* Security Tips */}
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold text-neutral-darkest mb-3">Password Security Tips:</h3>
                        <ul className="text-sm text-neutral-dark space-y-2">
                            <li className="flex items-start">
                                <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols
                            </li>
                            <li className="flex items-start">
                                <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Avoid using recently used passwords
                            </li>
                            <li className="flex items-start">
                                <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Don't share your password with anyone
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
