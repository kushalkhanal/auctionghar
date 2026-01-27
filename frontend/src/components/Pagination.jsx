import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Pagination = ({ page, totalPages, onPageChange }) => {
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

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate range around current page
            let start = Math.max(2, page - 1);
            let end = Math.min(totalPages - 1, page + 1);

            // Add ellipsis after first page if needed
            if (start > 2) {
                pages.push('...');
            }

            // Add pages around current page
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis before last page if needed
            if (end < totalPages - 1) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous Button */}
            <button
                onClick={handlePrevious}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:bg-white transition-all"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((pageNum, index) => {
                    if (pageNum === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-semibold transition-all ${page === pageNum
                                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-105'
                                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5'
                                }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:hover:bg-white transition-all"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="w-4 h-4" />
            </button>

            {/* Page Info */}
            <div className="hidden md:flex items-center ml-4 px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                    Page <span className="font-bold text-primary">{page}</span> of{' '}
                    <span className="font-bold text-primary">{totalPages}</span>
                </span>
            </div>
        </div>
    );
};

export default Pagination;