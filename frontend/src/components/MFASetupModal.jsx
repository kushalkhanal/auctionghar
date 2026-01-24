import React, { useState, useEffect } from 'react';
import { X, Copy, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { enableMFA, verifyMFASetup } from '../api/mfaService';

export default function MFASetupModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1: QR Code, 2: Backup Codes
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

    useEffect(() => {
        if (isOpen) {
            initializeMFASetup();
        }
    }, [isOpen]);

    const initializeMFASetup = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await enableMFA();
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize MFA setup');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySetup = async (e) => {
        e.preventDefault();
        if (verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await verifyMFASetup(verificationCode);
            setBackupCodes(data.backupCodes);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
    };

    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setCopiedBackupCodes(true);
        setTimeout(() => setCopiedBackupCodes(false), 2000);
    };

    const downloadBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mfa-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClose = () => {
        if (step === 2) {
            onSuccess?.();
        }
        setStep(1);
        setQrCode('');
        setSecret('');
        setVerificationCode('');
        setBackupCodes([]);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-neutral-dark hover:text-neutral-darkest"
                >
                    <X size={24} />
                </button>

                {step === 1 ? (
                    <>
                        <h2 className="text-2xl font-bold text-neutral-darkest mb-4">
                            Enable Two-Factor Authentication
                        </h2>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 flex items-start">
                                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-neutral-dark">Setting up MFA...</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h3 className="font-semibold text-neutral-darkest mb-2">Step 1: Scan QR Code</h3>
                                    <p className="text-sm text-neutral-dark mb-4">
                                        Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code:
                                    </p>
                                    {qrCode && (
                                        <div className="flex justify-center bg-neutral-light p-4 rounded-lg">
                                            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-semibold text-neutral-darkest mb-2">Or enter manually:</h3>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={secret}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-neutral-light border border-neutral-light rounded-lg text-sm font-mono"
                                        />
                                        <button
                                            onClick={copySecret}
                                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                            title="Copy secret"
                                        >
                                            {copiedSecret ? <CheckCircle size={20} /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleVerifySetup}>
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-neutral-darkest mb-2">Step 2: Enter Verification Code</h3>
                                        <p className="text-sm text-neutral-dark mb-3">
                                            Enter the 6-digit code from your authenticator app:
                                        </p>
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-full px-4 py-3 border border-neutral-light rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                                            maxLength={6}
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || verificationCode.length !== 6}
                                        className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Enable MFA'}
                                    </button>
                                </form>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-darkest mb-2">
                                MFA Enabled Successfully!
                            </h2>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <p className="text-sm text-yellow-800 font-semibold mb-2">
                                ⚠️ Save Your Backup Codes
                            </p>
                            <p className="text-sm text-yellow-700">
                                These codes can be used to access your account if you lose your authenticator device.
                                Each code can only be used once. Store them in a secure location.
                            </p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-neutral-darkest mb-3">Backup Codes:</h3>
                            <div className="bg-neutral-light p-4 rounded-lg mb-3 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, index) => (
                                        <div
                                            key={index}
                                            className="font-mono text-sm bg-white px-3 py-2 rounded border border-neutral-light"
                                        >
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={copyBackupCodes}
                                    className="flex-1 py-2 px-4 bg-neutral-dark text-white rounded-lg hover:bg-neutral-darkest transition-colors flex items-center justify-center gap-2"
                                >
                                    {copiedBackupCodes ? <CheckCircle size={18} /> : <Copy size={18} />}
                                    {copiedBackupCodes ? 'Copied!' : 'Copy All'}
                                </button>
                                <button
                                    onClick={downloadBackupCodes}
                                    className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Download
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300"
                        >
                            Done
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
