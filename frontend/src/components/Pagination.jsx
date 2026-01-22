
import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
    // We don't want to show pagination if there's only one page
    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (page > 1) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            onPageChange(page + 1);
        }
    };

    return (
        <div className="flex justify-center items-center space-x-4 mt-12">
            <button
                onClick={handlePrevious}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-sm text-gray-700">
                Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
            </span>
            <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;