
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const PaymentFailurePage = () => {
    const [searchParams] = useSearchParams();
    const [errorDetails, setErrorDetails] = useState({
        type: '',
        message: '',
        suggestion: ''
    });

    useEffect(() => {
        const error = searchParams.get('error');
        const data = searchParams.get('data');
        
        // Parse error details based on eSewa error types
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-900 mt-4">
                        {errorDetails.type}
                    </h1>
                    
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">
                            {errorDetails.message}
                        </p>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-blue-700 text-sm">
                                {errorDetails.suggestion}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <Link 
                            to="/profile/wallet" 
                            className="w-full inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return to Wallet
                        </Link>
                        
                        <Link 
                            to="/" 
                            className="w-full inline-block bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Need help? Contact our support team for assistance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailurePage;