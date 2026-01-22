import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-neutral-lightest flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon/Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <HomeIcon className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-darkest mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-neutral-dark leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-neutral-dark text-neutral-dark font-semibold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors duration-200 ml-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-darkest mb-3">
            Need Help?
          </h3>
          <div className="space-y-2 text-sm text-neutral-dark">
            <p>• Check the URL for typos</p>
            <p>• Use the navigation menu above</p>
            <p>• Contact support if the problem persists</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 