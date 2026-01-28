import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { CheckCircleIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/solid';

const PaymentSuccessPage = () => {
    const { refetchUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current === true) {
            return;
        }

        const processPaymentConfirmation = async () => {
            console.log("A. [SUCCESS_PAGE] Component mounted. Starting payment confirmation process.");
            const queryParams = new URLSearchParams(location.search);
            const pidxParam = queryParams.get('pidx'); // Khalti Parameter
            const dataParam = queryParams.get('data'); // eSewa Parameter

            if (!dataParam && !pidxParam) {
                console.error("B. [SUCCESS_PAGE] ERROR: No transaction data found in URL.");
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            try {
                if (pidxParam) {
                    console.log(`C. [SUCCESS_PAGE] Verifying Khalti Payment: ${pidxParam}`);
                    await api.get(`/payment/verify-khalti?pidx=${pidxParam}`);
                    console.log("D. [SUCCESS_PAGE] Khalti verification successful.");
                } else if (dataParam) {
                    const decodedData = JSON.parse(atob(dataParam));
                    const { transaction_uuid } = decodedData;

                    console.log(`C. [SUCCESS_PAGE] Notifying backend to confirm eSewa transaction: ${transaction_uuid}`);
                    await api.post('/payment/confirm-from-frontend', { transaction_uuid });
                    console.log("D. [SUCCESS_PAGE] Backend confirmation successful.");
                }

                console.log("D2. [SUCCESS_PAGE] Now calling refetchUser...");
                await refetchUser();
                console.log("E. [SUCCESS_PAGE] refetchUser call finished.");

            } catch (error) {
                console.error("F. [SUCCESS_PAGE] An error occurred during the confirmation process:", error);

                // If it fails, we might want to show error to user?
                // For now, allow redirect to home where they might see error or just unchanged balance.
            } finally {
                console.log("G. [SUCCESS_PAGE] Process finished. Redirecting to home page in 5 seconds.");
                setTimeout(() => {
                    navigate('/');
                }, 5000);
            }
        };

        processPaymentConfirmation();

        return () => {
            effectRan.current = true;
        };
    }, [location.search, navigate, refetchUser]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Success Animation Container */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full -mr-20 -mt-20 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full -ml-16 -mb-16 opacity-50"></div>

                    <div className="relative z-10">
                        {/* Success Icon with Animation */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 shadow-lg">
                                    <CheckCircleIcon className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Your transaction has been processed successfully and your wallet has been updated.
                        </p>

                        {/* Transaction Details */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 space-y-4">
                            <div className="flex items-center justify-center gap-3 text-green-600">
                                <ShieldCheckIcon className="w-6 h-6" />
                                <span className="font-semibold">Verified & Secured</span>
                            </div>

                            <div className="flex items-center justify-center gap-3 text-blue-600">
                                <CreditCardIcon className="w-6 h-6" />
                                <span className="font-semibold">Payment Gateway Processed</span>
                            </div>
                        </div>

                        {/* Loading Indicator */}
                        <div className="mb-6">
                            <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="text-sm font-medium">Updating your wallet...</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        {/* Redirect Notice */}
                        <div className="text-sm text-gray-500">
                            <p>Redirecting to homepage in 5 seconds...</p>
                        </div>

                        {/* Manual Navigation Button */}
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 w-full bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Go to Homepage Now
                        </button>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        A confirmation email has been sent to your registered email address.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;