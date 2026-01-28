import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import VerificationBadge from '../VerificationBadge';

const VerificationTab = ({ user, onUpdate }) => {
    const [status, setStatus] = useState(user.kycStatus || 'unverified'); // unverified, pending, verified, rejected
    const [rejectionReason, setRejectionReason] = useState(user.kycRejectionReason || '');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch latest status on mount to ensure accuracy
        const fetchStatus = async () => {
            try {
                const { data } = await api.get('/kyc/status');
                if (data.success) {
                    setStatus(data.kycStatus);
                    setRejectionReason(data.rejectionReason);
                }
            } catch (error) {
                console.error("Error fetching KYC status:", error);
            }
        };
        fetchStatus();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validation
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(selectedFile.type)) {
                setMessage('Error: Only JPG and PNG files are allowed.');
                return;
            }
            if (selectedFile.size > 2 * 1024 * 1024) { // 2MB
                setMessage('Error: File size must be less than 2MB.');
                return;
            }

            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a document to upload.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('kycDocument', file);

        try {
            const { data } = await api.post('/kyc/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                setStatus('pending');
                setMessage('Document submitted successfully!');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error("KYC Submit Error:", error);
            setMessage(error.response?.data?.message || 'Failed to upload document.');
        } finally {
            setLoading(false);
        }
    };

    // Render based on status
    const renderContent = () => {
        switch (status) {
            case 'verified':
                return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <VerificationBadge size="xl" />
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">You are Verified!</h3>
                        <p className="text-green-700">
                            Your identity has been verified. You now have the blue tick badge on your profile and listings.
                        </p>
                    </div>
                );

            case 'pending':
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-yellow-800 mb-2">Verification Pending</h3>
                        <p className="text-yellow-700">
                            Your document is currently under review by our team. This usually takes 24-48 hours.
                        </p>
                    </div>
                );

            case 'rejected':
                return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                            Verification Rejected
                        </h3>
                        <p className="text-red-700 mb-4">Reason: {rejectionReason || 'Document did not meet requirements.'}</p>
                        <p className="text-sm text-red-600 mb-4">Please upload a valid document again.</p>
                        {renderUploadForm()}
                    </div>
                );

            case 'unverified':
            default:
                return renderUploadForm();
        }
    };

    const renderUploadForm = () => (
        <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-darkest mb-4">Get Verified</h3>
            <p className="text-sm text-neutral-dark mb-6">
                Upload a clear photo of your Citizenship Card, Driving License, or Passport to get verified.
                Verified users get a blue tick and increased trust from buyers.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Document</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer relative"
                        onClick={() => document.getElementById('kyc-upload').click()}
                    >
                        <div className="space-y-1 text-center">
                            {preview ? (
                                <img src={preview} alt="Document preview" className="mx-auto h-48 object-contain" />
                            ) : (
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                            <div className="flex text-sm text-gray-600 justify-center">
                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark">
                                    {preview ? 'Change file' : 'Upload a file'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB</p>
                        </div>
                    </div>
                    <input
                        id="kyc-upload"
                        name="kycDocument"
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        'Submit for Verification'
                    )}
                </button>
                {message && (
                    <p className={`mt-4 text-sm text-center font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-darkest">Identity Verification</h2>
            {renderContent()}
        </div>
    );
};

export default VerificationTab;
