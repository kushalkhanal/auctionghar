import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import ProductCard from '../components/ProductCard';
import { HeartIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const WatchlistPage = () => {
    const { watchlist, loading, watchlistCount, clearEndedAuctions } = useWatchlist();
    const [filter, setFilter] = useState('all'); // all, active, ending-soon
    const [sortBy, setSortBy] = useState('recent'); // recent, price-low, price-high, ending-soon

    // Filter watchlist
    const getFilteredWatchlist = () => {
        let filtered = [...watchlist];

        // Apply filters
        if (filter === 'active') {
            filtered = filtered.filter(item => new Date(item.auction.endTime) > new Date());
        } else if (filter === 'ending-soon') {
            const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            filtered = filtered.filter(item => {
                const endTime = new Date(item.auction.endTime);
                return endTime > new Date() && endTime < twentyFourHoursFromNow;
            });
        }

        // Apply sorting
        if (sortBy === 'recent') {
            filtered.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        } else if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.auction.currentPrice - b.auction.currentPrice);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.auction.currentPrice - a.auction.currentPrice);
        } else if (sortBy === 'ending-soon') {
            filtered.sort((a, b) => new Date(a.auction.endTime) - new Date(b.auction.endTime));
        }

        return filtered;
    };

    const filteredWatchlist = getFilteredWatchlist();
    const endedCount = watchlist.filter(item => new Date(item.auction.endTime) <= new Date()).length;

    const handleClearEnded = async () => {
        if (window.confirm('Remove all ended auctions from your watchlist?')) {
            await clearEndedAuctions();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-lightest flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-neutral-dark">Loading your watchlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-lightest">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-neutral-darkest mb-2 flex items-center">
                                <HeartIcon className="h-10 w-10 text-red-500 mr-3 fill-current" />
                                My Watchlist
                            </h1>
                            <p className="text-neutral-dark">
                                {watchlistCount === 0
                                    ? 'No watched auctions yet'
                                    : `${watchlistCount} auction${watchlistCount !== 1 ? 's' : ''} you're watching`
                                }
                            </p>
                        </div>
                        {endedCount > 0 && (
                            <button
                                onClick={handleClearEnded}
                                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <TrashIcon className="h-5 w-5 mr-2" />
                                Clear {endedCount} Ended
                            </button>
                        )}
                    </div>

                    {/* Filters and Sorting */}
                    {watchlistCount > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4 items-center">
                            <div className="flex items-center">
                                <FunnelIcon className="h-5 w-5 text-gray-600 mr-2" />
                                <span className="text-sm font-semibold text-gray-700 mr-3">Filter:</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === 'all'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilter('active')}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === 'active'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setFilter('ending-soon')}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === 'ending-soon'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Ending Soon
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center ml-auto">
                                <span className="text-sm font-semibold text-gray-700 mr-3">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="recent">Recently Added</option>
                                    <option value="ending-soon">Ending Soon</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Watchlist Grid */}
                {filteredWatchlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWatchlist.map(item => (
                            <ProductCard key={item.auction._id} room={item.auction} />
                        ))}
                    </div>
                ) : watchlistCount > 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <FunnelIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            No auctions match your filters
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your filter settings
                        </p>
                        <button
                            onClick={() => {
                                setFilter('all');
                                setSortBy('recent');
                            }}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <HeartIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            No Watched Auctions Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Start watching auctions to keep track of items you're interested in.<br />
                            Click the heart icon on any auction card to add it to your watchlist.
                        </p>
                        <Link
                            to="/auctions"
                            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                        >
                            Browse Auctions
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;
