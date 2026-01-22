import { useState } from 'react';
import api from '../api/axiosConfig';

export const useEsewaPayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const postToEsewa = (formData, esewaUrl) => {
        console.log('Posting to eSewa with data:', formData);
        console.log('eSewa URL:', esewaUrl);
        
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', esewaUrl);
        
        // Add form fields
        for (const key in formData) {
            const hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', formData[key]);
            form.appendChild(hiddenField);
        }
        
        document.body.appendChild(form);
        form.submit();
    };

    const initiatePayment = async (amount) => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Initiating payment for amount:', amount);
            
            const { data } = await api.post('/payment/initiate', { amount });
            console.log('Payment initiation response:', data);

            if (data.success && data.data && data.esewaUrl) {
                // Validate required fields
                const requiredFields = ['amount', 'total_amount', 'transaction_uuid', 'product_code', 'signature'];
                const missingFields = requiredFields.filter(field => !data.data[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }
                
                postToEsewa(data.data, data.esewaUrl);
            } else {
                throw new Error(data.message || "Invalid response from server.");
            }
        } catch (err) {
            console.error('Payment initiation error:', err);
            
            let errorMessage = 'Could not start the payment process.';
            
            if (err.response) {
                // Server responded with error status
                errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
            } else if (err.request) {
                // Network error
                errorMessage = 'Network error. Please check your connection.';
            } else {
                // Other errors
                errorMessage = err.message || errorMessage;
            }
            
            setError(errorMessage);
            setLoading(false);
        }
    };

    return { initiatePayment, loading, error };
};