// File: frontend/src/components/ProductCard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, EyeIcon, HeartIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const calculateTimeLeft = (endTime) => {
    const difference = +new Date(endTime) - +new Date();
    if (difference <= 0) return "Auction Ended";
    const timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
    };
    
    if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h left`;
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m left`;
    if (timeLeft.minutes > 0) return `${timeLeft.minutes}m ${timeLeft.seconds}s left`;
    return `${timeLeft.seconds}s left`;
};

const ProductCard = ({ room }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(room.endTime));
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(room.endTime));
        }, 1000); // Update timer every second for more precise countdown
        return () => clearInterval(timer);
    }, [room.endTime]);

    const VITE_BACKEND_URL = 'http://localhost:5050';
    const imageUrls = room.imageUrls && room.imageUrls.length > 0 
        ? room.imageUrls.map(url => `${VITE_BACKEND_URL}${url}`)
        : [`${VITE_BACKEND_URL}/uploads/default-avatar.png`];

    const isAuctionEnded = timeLeft === "Auction Ended";
    const isUrgent = timeLeft.includes('m') && !timeLeft.includes('d') && !timeLeft.includes('h');

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    return (
        <div 
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 card-hover"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container with Carousel */}
            <div className="relative overflow-hidden">
                <img 
                    src={imageUrls[currentImageIndex]} 
                    alt={room.name} 
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Image Navigation Arrows (only show if multiple images) */}
                {imageUrls.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {imageUrls.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1} / {imageUrls.length}
                    </div>
                )}
                
                {/* Overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                    <div className="absolute bottom-4 left-4 right-4">
                        <Link 
                            to={`/bidding-rooms/${room._id}`}
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-white/90 backdrop-blur-sm text-primary font-semibold rounded-full hover:bg-white transition-all duration-300 transform hover:scale-105"
                        >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Auction
                        </Link>
                    </div>
                </div>

                {/* Timer Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 transition-all duration-300 ${
                    isAuctionEnded 
                        ? 'bg-red-500 text-white' 
                        : isUrgent 
                            ? 'bg-orange-500 text-white animate-pulse' 
                            : 'bg-white/90 backdrop-blur-sm text-primary-dark'
                }`}>
                    <ClockIcon className="h-4 w-4" />
                    <span>{timeLeft}</span>
                </div>

                {/* Like Button */}
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        setIsLiked(!isLiked);
                    }}
                    className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                        isLiked 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                >
                    <HeartIcon className={`h-4 w-4 transition-all duration-300 ${
                        isLiked ? 'fill-current' : ''
                    }`} />
                </button>

                {/* Bid Count Badge */}
                {room.bids && room.bids.length > 0 && (
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {room.bids.length} bid{room.bids.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Image Thumbnails (if multiple images) */}
            {imageUrls.length > 1 && (
                <div className="px-4 py-2 bg-gray-50">
                    <div className="flex space-x-2 overflow-x-auto">
                        {imageUrls.map((url, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentImageIndex 
                                        ? 'border-primary' 
                                        : 'border-transparent hover:border-gray-300'
                                }`}
                            >
                                <img
                                    src={url}
                                    alt={`${room.name} thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                <Link to={`/bidding-rooms/${room._id}`}>
                    <h3 className="text-lg font-bold text-neutral-darkest group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-2">
                        {room.name}
                    </h3>
                </Link>
                
                {/* Seller Info */}
                <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <UserIcon className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm text-neutral-dark">
                        {room.seller ? `${room.seller.firstName} ${room.seller.lastName}` : 'Unknown Seller'}
                    </p>
                </div>

                {/* Price Section */}
                <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-neutral-dark mb-1">Current Bid</p>
                    <div className="flex items-baseline justify-between">
                        <p className="text-2xl font-bold text-primary-dark">
                            Npr {room.currentPrice.toLocaleString()}
                        </p>
                        {room.bids && room.bids.length > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                                +{room.bids.length} bid{room.bids.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <Link 
                    to={`/bidding-rooms/${room._id}`}
                    className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 group-hover:shadow-primary/25"
                >
                    {isAuctionEnded ? 'View Results' : 'Place Bid'}
                </Link>
            </div>

            {/* Status Indicator */}
            {isAuctionEnded && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-xs font-semibold">
                    AUCTION ENDED
                </div>
            )}
        </div>
    );
};

export default ProductCard;