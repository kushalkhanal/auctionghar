// File: frontend/src/hooks/useUserProfile.js

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig'; // 1. Import the correct instance

export const useUserProfile = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 2. This request will now be automatically authenticated by the interceptor
            const response = await api.get('/profile');
            setData(response.data);
        } catch (err) {
            console.error("Failed to fetch profile data", err);
            setError("Could not load your profile. Please log in again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { 
        profile: data?.profile,
        listedItems: data?.listedItems,
        bidHistory: data?.bidHistory,
        loading, 
        error, 
        refresh: fetchData
    };
};