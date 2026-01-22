
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useCreateBiddingRoom = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // This is the main function the component will call.
    // It takes the form data and the file list as arguments.
    const createRoom = async (formData, productImages) => {
        setLoading(true);
        setError(null);

        // --- Validation ---
        if (!productImages || productImages.length === 0) {
            setError('Please upload at least one image for the item.');
            setLoading(false);
            return; // Stop the process
        }

        // --- Prepare FormData for submission ---
        // FormData is required for sending files.
        const submissionData = new FormData();
        submissionData.append('name', formData.name);
        submissionData.append('description', formData.description);
        submissionData.append('startingPrice', formData.startingPrice);
        submissionData.append('endTime', formData.endTime);

        // Loop through the FileList and append each file.
        // The key 'productImages' MUST match the backend multer middleware.
        for (let i = 0; i < productImages.length; i++) {
            submissionData.append('productImages', productImages[i]);
        }

        try {
            // --- Make the API call ---
            await axios.post('/api/admin/bidding-rooms', submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // This header is essential
                },
            });
            
            // If the API call is successful, navigate to the management page.
            navigate('/admin/bidding-rooms');

        } catch (err) {
            // If there's an error, set the error message.
            const errorMessage = err.response?.data?.message || 'Failed to create the bidding room.';
            setError(errorMessage);
            console.error(err);
        } finally {
            // In all cases, stop loading.
            setLoading(false);
        }
    };

    // The hook returns the tools our component needs.
    return { createRoom, loading, error };
};