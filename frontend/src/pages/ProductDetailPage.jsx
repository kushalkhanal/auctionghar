
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axiosConfig';
import { ClockIcon, UserIcon, EyeIcon, MagnifyingGlassIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState('');
    const [bidSuccess, setBidSuccess] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const VITE_BACKEND_URL = 'http://localhost:5050';
    const imageUrls = room?.imageUrls && room.imageUrls.length > 0 
        ? room.imageUrls.map(url => `${VITE_BACKEND_URL}${url}`)
        : [`${VITE_BACKEND_URL}/uploads/default-avatar.png`];

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/bidding-rooms/${id}`);
                setRoom(data);
                setBidAmount(Math.ceil(data.currentPrice + 1));
                setTimeLeft(calculateTimeLeft(data.endTime));
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetails();
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (room) {
                setTimeLeft(calculateTimeLeft(room.endTime));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [room]);

    useEffect(() => {
        if (!isConnected || !socket || !room) return;

        socket.emit('join_product_room', room._id);
        
        socket.on('bid_update', (updatedRoom) => {
            setRoom(updatedRoom);
            setBidAmount(Math.ceil(updatedRoom.currentPrice + 1));
            setBidSuccess('Bid placed successfully!');
            setTimeout(() => setBidSuccess(''), 3000);
        });

        return () => {
            socket.emit('leave_product_room', room._id);
            socket.off('bid_update');
        };
    }, [socket, isConnected, room]);

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        const bidAmountNum = parseFloat(bidAmount);
        if (isNaN(bidAmountNum) || bidAmountNum <= room.currentPrice) {
            setBidError(`Bid must be higher than current price: Npr ${room.currentPrice}`);
            return;
        }

        const isAuctionEnded = timeLeft === "Auction Ended";
        if (isAuctionEnded) {
            setBidError('This auction has ended.');
            return;
        }
        
        try {
            const { data } = await api.post(`/bidding-rooms/${id}/bids`, { amount: bidAmount });
            setBidSuccess(data.message);
            setRoom(data.room);
            setBidAmount(Math.ceil(data.room.currentPrice + 1));
        } catch (err) {
            setBidError(err.response?.data?.message || 'An error occurred while placing your bid.');
        }
    };

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % imageUrls.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    const goToImage = (index) => {
        setSelectedImageIndex(index);
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!room) return null;

    const isAuctionEnded = timeLeft === "Auction Ended";
    const isOwner = user?.id === room.seller?._id || user?.id === room.seller;

    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

                    {/* --- COLUMN 1: Enhanced Image Gallery --- */}
                    <div>
                        {/* Main Image Container */}
                        <div className="relative mb-4">
                            <div className="relative overflow-hidden rounded-lg shadow-lg">
                                <img
                                    src={imageUrls[selectedImageIndex]}
                                    alt={room.name}
                                    className={`w-full h-auto max-h-[500px] object-contain transition-all duration-300 ${
                                        isZoomed ? 'scale-110' : 'scale-100'
                                    }`}
                                    onDoubleClick={() => setIsZoomed(!isZoomed)}
                                />
                                
                                {/* Image Navigation Arrows */}
                                {imageUrls.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity hover:bg-black/70"
                                        >
                                            <ChevronLeftIcon className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity hover:bg-black/70"
                                        >
                                            <ChevronRightIcon className="h-6 w-6" />
                                        </button>
                                    </>
                                )}

                                {/* Image Controls */}
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => setIsZoomed(!isZoomed)}
                                        className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                        title="Zoom"
                                    >
                                        <MagnifyingGlassIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsFullscreen(true)}
                                        className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                        title="Fullscreen"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Image Counter */}
                                {imageUrls.length > 1 && (
                                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                        {selectedImageIndex + 1} / {imageUrls.length}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Thumbnails */}
                        {imageUrls.length > 1 && (
                            <div className="grid grid-cols-5 gap-3">
                                {imageUrls.map((imgUrl, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToImage(index)}
                                        className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                            selectedImageIndex === index 
                                                ? 'border-primary ring-2 ring-primary/20' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`${room.name} thumbnail ${index + 1}`}
                                            className="w-full h-20 object-cover"
                                        />
                                        {selectedImageIndex === index && (
                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- COLUMN 2: Details, Bidding, and History --- */}
                    <div>
                        {/* Item Title and Seller */}
                        <h1 className="text-4xl font-bold text-neutral-darkest tracking-tight">{room.name}</h1>
                        <div className="flex items-center mt-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                                <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-md text-neutral-dark">
                                Listed by: <span className="font-semibold">{room.seller ? `${room.seller.firstName} ${room.seller.lastName}` : 'Unknown'}</span>
                            </p>
                            {isOwner && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    You are the seller
                                </span>
                            )}
                        </div>

                        {/* Price and Timer Block */}
                        <div className="my-6 p-6 border rounded-lg bg-gradient-to-r from-neutral-lightest to-white">
                            <p className="text-sm text-neutral-dark">Current Bid</p>
                            <p className="text-5xl font-bold text-primary-dark">Npr {room.currentPrice.toLocaleString()}</p>
                            <div className="flex items-center text-lg text-red-600 mt-3 font-semibold">
                                <ClockIcon className="h-6 w-6 mr-2" />
                                <span>{timeLeft}</span>
                            </div>
                        </div>

                        {/* Item Description */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-neutral-darkest mb-3">Description</h3>
                            <p className="text-neutral-dark leading-relaxed">{room.description}</p>
                        </div>

                        {/* Bidding Form Block */}
                        <div className="p-6 bg-white rounded-lg shadow-inner border">
                            
                            {isAuctionEnded ? (
                                <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
                                    <div className="flex items-center justify-center">
                                        <ClockIcon className="h-5 w-5 mr-2" />
                                        This auction has ended.
                                    </div>
                                </div>
                            ) : isOwner ? (
                                <div className="p-4 bg-blue-100 text-blue-700 rounded-lg text-center font-semibold">
                                    <div className="flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 mr-2" />
                                        You cannot bid on your own item.
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handlePlaceBid} className="space-y-4">
                                    <div>
                                        <label htmlFor="bidAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Your Bid (NPR)
                                        </label>
                                        <input
                                            type="number"
                                            id="bidAmount"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            min={room.currentPrice + 1}
                                            step="1"
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Minimum bid: Npr {(room.currentPrice + 1).toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    {bidError && (
                                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                            {bidError}
                                        </div>
                                    )}
                                    
                                    {bidSuccess && (
                                        <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                                            {bidSuccess}
                                        </div>
                                    )}
                                    
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        Place Bid
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Bid History */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-neutral-darkest mb-4">Bid History</h3>
                            <div className="bg-neutral-lightest rounded-lg p-4 max-h-64 overflow-y-auto">
                                {room.bids && room.bids.length > 0 ? (
                                    <div className="space-y-3">
                                        {room.bids.map((bid, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                                        <UserIcon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-neutral-darkest">
                                                            {bid.bidder ? `${bid.bidder.firstName} ${bid.bidder.lastName}` : 'Anonymous'}
                                                        </p>
                                                        <p className="text-sm text-neutral-dark">
                                                            {new Date(bid.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary-dark">Npr {bid.amount.toLocaleString()}</p>
                                                    {index === 0 && (
                                                        <p className="text-xs text-green-600 font-medium">Current Winner</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-neutral-dark text-center py-4">No bids yet. Be the first to bid!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Image Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                    <div className="relative max-w-4xl max-h-full p-4">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        
                        <img
                            src={imageUrls[selectedImageIndex]}
                            alt={room.name}
                            className="max-w-full max-h-full object-contain"
                        />
                        
                        {imageUrls.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <ChevronLeftIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <ChevronRightIcon className="h-6 w-6" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                                    {selectedImageIndex + 1} / {imageUrls.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;