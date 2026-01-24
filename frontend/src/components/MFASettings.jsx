import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldOff, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { getMFAStatus, disableMFA, regenerateBackupCodes } from '../api/mfaService';
import MFASetupModal from './MFASetupModal';

export default function MFASettings() {
    const [mfaStatus, setMfaStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [newBackupCodes, setNewBackupCodes] = useState([]);

    useEffect(() => {
        fetchMFAStatus();
    }, []);

    const fetchMFAStatus = async () => {
        setLoading(true);
        try {
            const data = await getMFAStatus();
            setMfaStatus(data);
        } catch (err) {
            console.error('Error fetching MFA status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnableMFA = () => {
        setShowSetupModal(true);
        setError('');
        setSuccess('');
    };

    const handleMFASetupSuccess = () => {
        setShowSetupModal(false);
        setSuccess('Two-Factor Authentication has been enabled successfully!');
        fetchMFAStatus();
    };

    const handleDisableMFA = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');

        try {
            await disableMFA(password);
            setShowDisableDialog(false);
            setPassword('');
            setSuccess('Two-Factor Authentication has been disabled.');
            fetchMFAStatus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable MFA');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRegenerateBackupCodes = async () => {
        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await regenerateBackupCodes();
            setNewBackupCodes(data.backupCodes);
            setShowBackupCodes(true);
            setSuccess('Backup codes regenerated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to regenerate backup codes');
        } finally {
            setActionLoading(false);
        }
    };

    const copyBackupCodes = () => {
        const codesText = newBackupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
    };

    const downloadBackupCodes = () => {
        const codesText = newBackupCodes.join('\n');
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mfa-backup-codes-new.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-neutral-light rounded w-1/3"></div>
                    <div className="h-4 bg-neutral-light rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${mfaStatus?.mfaEnabled ? 'bg-green-100' : 'bg-neutral-light'}`}>
                            {mfaStatus?.mfaEnabled ? (
                                <ShieldCheck size={24} className="text-green-600" />
                            ) : (
                                <ShieldOff size={24} className="text-neutral-dark" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-darkest">
                                Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-neutral-dark">
                                {mfaStatus?.mfaEnabled
                                    ? 'Extra security for your account'
                                    : 'Add an extra layer of security to your account'
                                }
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${mfaStatus?.mfaEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-light text-neutral-dark'
                        }`}>
                        {mfaStatus?.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded flex items-start">
                        <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded flex items-start">
                        <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{success}</p>
                    </div>
                )}

                {mfaStatus?.mfaEnabled ? (
                    <div className="space-y-4">
                        <div className="bg-neutral-light p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-dark">Enabled on:</span>
                                <span className="font-medium text-neutral-darkest">
                                    {new Date(mfaStatus.mfaEnabledAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-dark">Backup codes remaining:</span>
                                <span className={`font-medium ${mfaStatus.backupCodesCount < 3
                                        ? 'text-red-600'
                                        : 'text-neutral-darkest'
                                    }`}>
                                    {mfaStatus.backupCodesCount} / 10
                                </span>
                            </div>
                        </div>

                        {mfaStatus.backupCodesCount < 3 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                <p className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> You're running low on backup codes.
                                    Consider regenerating them.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleRegenerateBackupCodes}
                                disabled={actionLoading}
                                className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Key size={18} />
                                Regenerate Backup Codes
                            </button>
                            <button
                                onClick={() => setShowDisableDialog(true)}
                                className="py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                Disable MFA
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <p className="text-sm text-blue-800 mb-2">
                                <strong>Recommended:</strong> Enable two-factor authentication to secure your account.
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                                <li>Adds an extra layer of security beyond your password</li>
                                <li>Compatible with Google Authenticator, Authy, and more</li>
                                <li>Backup codes provided for account recovery</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleEnableMFA}
                            className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <Shield size={20} />
                            Enable Two-Factor Authentication
                        </button>
                    </div>
                )}
            </div>

            {/* Disable MFA Confirmation Dialog */}
            {showDisableDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-neutral-darkest mb-4">
                            Disable Two-Factor Authentication?
                        </h3>
                        <p className="text-neutral-dark mb-4">
                            This will make your account less secure. Please enter your password to confirm.
                        </p>

                        <form onSubmit={handleDisableMFA} className="space-y-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDisableDialog(false);
                                        setPassword('');
                                        setError('');
                                    }}
                                    className="flex-1 py-2 px-4 bg-neutral-light text-neutral-darkest rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Disabling...' : 'Disable MFA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Backup Codes Display */}
            {showBackupCodes && newBackupCodes.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-neutral-darkest mb-4">
                            Your New Backup Codes
                        </h3>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Important:</strong> Your old backup codes are now invalid.
                                Save these new codes in a secure location.
                            </p>
                        </div>

                        <div className="bg-neutral-light p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {newBackupCodes.map((code, index) => (
                                    <div
                                        key={index}
                                        className="font-mono text-sm bg-white px-3 py-2 rounded border border-neutral-light"
                                    >
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={copyBackupCodes}
                                className="flex-1 py-2 px-4 bg-neutral-dark text-white rounded-lg hover:bg-neutral-darkest transition-colors"
                            >
                                Copy All
                            </button>
                            <button
                                onClick={downloadBackupCodes}
                                className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Download
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setShowBackupCodes(false);
                                setNewBackupCodes([]);
                            }}
                            className="w-full py-2 px-4 bg-neutral-light text-neutral-darkest rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* MFA Setup Modal */}
            <MFASetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                onSuccess={handleMFASetupSuccess}
            />
        </>
    );
}
