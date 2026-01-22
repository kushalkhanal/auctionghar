import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

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
            const dataParam = queryParams.get('data');

            if (!dataParam) {
                console.error("B. [SUCCESS_PAGE] ERROR: No transaction data found in URL.");
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            try {
                const decodedData = JSON.parse(atob(dataParam));
                const { transaction_uuid } = decodedData;

                console.log(`C. [SUCCESS_PAGE] Notifying backend to confirm transaction: ${transaction_uuid}`);
                await api.post('/payment/confirm-from-frontend', { transaction_uuid });
                console.log("D. [SUCCESS_PAGE] Backend confirmation successful. Now calling refetchUser...");
                
                // This is the critical call to update the global state
                await refetchUser();
                
                console.log("E. [SUCCESS_PAGE] refetchUser call finished.");

            } catch (error) {
                console.error("F. [SUCCESS_PAGE] An error occurred during the confirmation process:", error);
            } finally {
                console.log("G. [SUCCESS_PAGE] Process finished. Redirecting to home page in 3 seconds.");
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        };

        processPaymentConfirmation();

        return () => {
            effectRan.current = true;
        };
    }, [location.search, navigate, refetchUser]);

    return (
        <div className="container mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Confirmed!</h1>
            <p className="text-gray-600 mb-6">
                Your wallet has been updated. Redirecting...
            </p>
        </div>
    );
};

export default PaymentSuccessPage;