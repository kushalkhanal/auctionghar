import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            {/* Spinner */}
            <div className="relative">
                {/* Outer Ring */}
                <div className={`${sizeClasses[size]} rounded-full border-4 border-primary/20`}></div>

                {/* Spinning Ring */}
                <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin`}></div>

                {/* Inner Pulse */}
                <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-primary/10 animate-pulse`}></div>
            </div>

            {/* Message */}
            {message && (
                <p className="mt-4 text-neutral-dark font-medium animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

export const FullPageLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="xl" message={message} />
            </div>
        </div>
    );
};

export const CardLoader = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
        </div>
    );
};

export const TableLoader = ({ rows = 5 }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="p-4 border-b border-gray-100">
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoadingSpinner;
