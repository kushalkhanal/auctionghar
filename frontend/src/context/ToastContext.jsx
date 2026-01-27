import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ToastContainer } from '../components/Toast';
import { useAuth } from './AuthContext';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const auth = useAuth();

    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            message,
            type,
            autoClose: options.autoClose !== false,
            duration: options.duration || 5000
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration if autoClose is enabled
        if (newToast.autoClose) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration + 300); // Add 300ms for exit animation
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'info', options = {}) => {
        addToast(message, type, options);
    }, [addToast]);

    const success = useCallback((message, options = {}) => {
        addToast(message, 'success', options);
    }, [addToast]);

    const error = useCallback((message, options = {}) => {
        addToast(message, 'error', options);
    }, [addToast]);

    const warning = useCallback((message, options = {}) => {
        addToast(message, 'warning', options);
    }, [addToast]);

    const info = useCallback((message, options = {}) => {
        addToast(message, 'info', options);
    }, [addToast]);

    const value = {
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        removeToast
    };

    // Connect toast context to AuthContext
    useEffect(() => {
        if (auth && auth.setToastContext) {
            auth.setToastContext({ success, error, warning, info });
        }
    }, [auth, success, error, warning, info]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastContext;
