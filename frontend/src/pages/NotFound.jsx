import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon, MapIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100 rounded-full -ml-24 -mb-24 opacity-50"></div>

          <div className="relative z-10 p-12 text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="relative inline-block">
                {/* Animated Background Circle */}
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>

                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-primary/20 to-purple-100 rounded-full p-8 mb-6">
                  <MapIcon className="w-24 h-24 text-primary mx-auto" />
                </div>
              </div>

              {/* 404 Text */}
              <h1 className="text-9xl font-black bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-neutral-darkest mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-lg text-neutral-dark leading-relaxed max-w-md mx-auto">
                The page you're looking for seems to have wandered off. Don't worry, even the best explorers get lost sometimes!
              </p>
            </div>

            {/* Search Suggestion */}
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-center gap-3 mb-3">
                <MagnifyingGlassIcon className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-neutral-darkest">What you can do:</h3>
              </div>
              <ul className="text-sm text-neutral-dark space-y-2 text-left max-w-sm mx-auto">
                <li className="flex items-start">
                  <span className="text-primary mr-2 font-bold">•</span>
                  <span>Check the URL for any typos or mistakes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 font-bold">•</span>
                  <span>Use the navigation menu to find what you need</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 font-bold">•</span>
                  <span>Go back to the homepage and start fresh</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2 font-bold">•</span>
                  <span>Contact support if you believe this is an error</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <HomeIcon className="w-5 h-5" />
                Go to Homepage
              </Link>

              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Popular Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/auctions" className="bg-white/80 backdrop-blur-sm p-4 rounded-xl hover:bg-white transition-all text-center group">
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="font-semibold text-neutral-darkest group-hover:text-primary transition-colors">Browse Auctions</h4>
          </Link>
          <Link to="/profile/wallet" className="bg-white/80 backdrop-blur-sm p-4 rounded-xl hover:bg-white transition-all text-center group">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-semibold text-neutral-darkest group-hover:text-primary transition-colors">My Wallet</h4>
          </Link>
          <Link to="/profile" className="bg-white/80 backdrop-blur-sm p-4 rounded-xl hover:bg-white transition-all text-center group">
            <div className="text-2xl mb-2">👤</div>
            <h4 className="font-semibold text-neutral-darkest group-hover:text-primary transition-colors">My Profile</h4>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;