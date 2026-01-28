import { useState } from 'react';
import api from '../api/axiosConfig';

export const useKhaltiPayment = () => {
    const [khaltiLoading, setKhaltiLoading] = useState(false);
    const [khaltiError, setKhaltiError] = useState(null);

    const initiateKhalti = async (amount) => {
        setKhaltiLoading(true);
        setKhaltiError(null);

        try {
            console.log('[KHALTI] Initiating payment for amount:', amount);

            const { data } = await api.post('/payment/initiate-khalti', { amount });
            console.log('[KHALTI] Initiation response:', data);

            if (data.success && data.payment_url) {
                console.log('[KHALTI] Redirecting to:', data.payment_url);
                window.location.href = data.payment_url;
            } else {
                throw new Error(data.message || "Invalid response from Khalti server.");
            }
        } catch (err) {
            console.error('[KHALTI] Initiation error:', err);

            let errorMessage = 'Could not start Khalti payment.';

            if (err.response) {
                errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage = err.message || errorMessage;
            }

            setKhaltiError(errorMessage);
            setKhaltiLoading(false);
        }
    };

    return { initiateKhalti, khaltiLoading, khaltiError };
};
