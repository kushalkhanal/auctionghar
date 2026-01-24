import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

export default function MFAVerificationModal({ isOpen, onVerify, loading, error }) {
    const [code, setCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code.trim()) {
            onVerify(code.trim().toUpperCase(), useBackupCode);
        }
    };

    const handleToggleBackupCode = () => {
        setUseBackupCode(!useBackupCode);
        setCode('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
                        <Shield size={32} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-darkest mb-2">
                        Two-Factor Authentication
                    </h2>
                    <p className="text-neutral-dark">
                        {useBackupCode
                            ? 'Enter one of your backup codes'
                            : 'Enter the 6-digit code from your authenticator app'
                        }
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 flex items-start">
                        <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase();
                                if (useBackupCode) {
                                    setCode(value.slice(0, 8));
                                } else {
                                    setCode(value.replace(/\D/g, '').slice(0, 6));
                                }
                            }}
                            placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                            className="w-full px-4 py-3 border border-neutral-light rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                            maxLength={useBackupCode ? 8 : 6}
                            autoFocus
                            required
                        />
                        {!useBackupCode && (
                            <p className="text-xs text-neutral-dark mt-2 text-center">
                                The code expires every 30 seconds
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.trim().length < (useBackupCode ? 8 : 6)}
                        className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleToggleBackupCode}
                            className="text-sm text-primary hover:text-primary-dark font-medium"
                        >
                            {useBackupCode ? '← Use authenticator code' : 'Use backup code instead'}
                        </button>
                    </div>

                    {useBackupCode && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                            <p className="text-xs text-yellow-800">
                                <strong>Note:</strong> Each backup code can only be used once.
                                Make sure to regenerate codes after using several of them.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
