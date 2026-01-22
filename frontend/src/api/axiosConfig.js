// File: frontend/src/api/axiosConfig.js

import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// This interceptor runs BEFORE every request.
api.interceptors.request.use(
    (config) => {
        // Get the token from localStorage on every request.
        const token = localStorage.getItem('token');
        if (token) {
            // If the token exists, add it to the headers.
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // If sending FormData (for file uploads), let the browser set the Content-Type.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;