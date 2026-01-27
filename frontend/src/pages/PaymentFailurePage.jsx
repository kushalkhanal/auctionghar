import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/solid';

const PaymentFailurePage = () => {
    const [searchParams] = useSearchParams();
    const [errorDetails, setErrorDetails] = useState({
        type: '',
        message: '',
        suggestion: ''
    });

    useEffect(() => {
        const error = searchParams.get('error');

        let errorType = '';
        let errorMessage = '';
        let suggestion = '';

        switch (error) {
            case 'nodata':
                errorType = 'No Data Received';
                errorMessage = 'No payment data was received from eSewa.';
                suggestion = 'Please try the payment again.';
                break;
            case 'status_INITIATED':
                errorType = 'Payment Not Completed';
                errorMessage = 'The payment was initiated but not completed.';
                suggestion = 'Please complete the payment process or try again.';
                break;
            case 'status_FAILED':
                errorType = 'Payment Failed';
                errorMessage = 'The payment was processed but failed.';
                suggestion = 'Please check your payment method and try again.';
                break;
            case 'status_CANCELLED':
                errorType = 'Payment Cancelled';
                errorMessage = 'The payment was cancelled by you or the system.';
                suggestion = 'You can try the payment again when ready.';
                break;
            case 'verification_failed':
                errorType = 'Verification Failed';
                errorMessage = 'The payment could not be verified with eSewa.';
                suggestion = 'Please contact support if the amount was deducted from your account.';
                break;
            case 'server_error':
                errorType = 'Server Error';
                errorMessage = 'An error occurred while processing your payment.';
                suggestion = 'Please try again or contact support if the problem persists.';
                break;
            default:
                errorType = 'Payment Failed';
                errorMessage = 'Unfortunately, your payment could not be processed.';
                suggestion = 'No funds have been deducted. Please try again.';
        }

        setErrorDetails({ type: errorType, message: errorMessage, suggestion });
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full">
                {/* Error Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-100 rounded-full -mr-20 -mt-20 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-100 rounded-full -ml-16 -mb-16 opacity-50"></div>

                    <div className="relative z-10 p-8">
                        {/* Error Icon */}
                        <div className="text-center mb-6">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-gradient-to-br from-red-500 to-red-600 rounded-full p-4 shadow-lg">
                                    <XCircleIcon className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                            {errorDetails.type}
                        </h1>
                        <p className="text-center text-gray-600 mb-6">
                            Don't worry, no charges were made to your account
                        </p>

                        {/* Error Message Box */}
                        <div className="mb-4 p-5 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg">
                            <div className="flex items-start">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-red-900 mb-1">What happened?</h3>
                                    <p className="text-red-700 text-sm">
                                        {errorDetails.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion Box */}
                        <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg">
                            <div className="flex items-start">
                                <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">What to do next?</h3>
                                    <p className="text-blue-700 text-sm">
                                        {errorDetails.suggestion}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Common Issues */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Common Issues:</h3>
                            <ul className="space-y-2 text-xs text-gray-600">
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    <span>Insufficient balance in eSewa wallet</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    <span>Network connectivity issues</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    <span>Payment cancelled before completion</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    <span>Session timeout during payment</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                to="/profile/wallet"
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Try Again
                            </Link>

                            <Link
                                to="/"
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <HomeIcon className="w-5 h-5" />
                                Go to Homepage
                            </Link>
                        </div>

                        {/* Support Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600 mb-3">
                                Still having issues?
                            </p>
                            <button className="text-primary hover:text-primary-dark font-semibold text-sm transition-colors">
                                Contact Support Team →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Additional Help */}
                <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-600">
                        <span className="font-semibold">Tip:</span> Make sure your eSewa account has sufficient balance before initiating payment
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailurePage;