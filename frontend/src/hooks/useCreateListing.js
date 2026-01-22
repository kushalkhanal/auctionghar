// File: frontend/src/hooks/useCreateListing.js
import { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

export const useCreateListing = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createListing = async (formData, productImages) => {
        setLoading(true);
        setError(null);

        if (!productImages || productImages.length === 0) {
            setError('Please upload at least one image for your item.');
            setLoading(false);
            return;
        }

        const submissionData = new FormData();
        submissionData.append('name', formData.name);
        submissionData.append('description', formData.description);
        submissionData.append('startingPrice', formData.startingPrice);
        submissionData.append('endTime', formData.endTime);

        for (let i = 0; i < productImages.length; i++) {
            submissionData.append('productImages', productImages[i]);
        }

        try {
            await api.post('/bidding-rooms', submissionData);
            navigate('/profile');
        } catch (err) {
            // This line correctly grabs the specific error message from the backend
            const errorMessage = err.response?.data?.message || 'Failed to create your listing.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { createListing, loading, error };
};