import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Collectibles',
    'Art',
    'Jewelry',
    'Vehicles',
    'Books & Media',
    'Toys & Games',
    'Other'
];

const AuctionsPage = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTags, setSelectedTags] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch auctions with filters
    useEffect(() => {
        fetchAuctions();
    }, [selectedCategory, selectedTags, searchQuery, page]);

    // Fetch popular tags and category stats on mount
    useEffect(() => {
        fetchPopularTags();
        fetchCategoryStats();
    }, []);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12'
            });

            if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }

            if (selectedTags.length > 0) {
                params.append('tags', selectedTags.join(','));
            }

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const { data } = await api.get(`/bidding-rooms?${params.toString()}`);
            setAuctions(data.products || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching auctions:', error);
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPopularTags = async () => {
        try {
            const { data } = await api.get('/bidding-rooms/tags/popular?limit=15');
            setPopularTags(data);
        } catch (error) {
            console.error('Error fetching popular tags:', error);
        }
    };

    const fetchCategoryStats = async () => {
        try {
            const { data } = await api.get('/bidding-rooms/categories/stats');
            setCategoryStats(data);
        } catch (error) {
            console.error('Error fetching category stats:', error);
        }
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
        setPage(1); // Reset to first page
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedTags([]);
        setSearchQuery('');
        setPage(1);
    };

    const getCategoryCount = (category) => {
        const stat = categoryStats.find(s => s._id === category);
        return stat ? stat.count : 0;
    };

    const hasActiveFilters = selectedCategory !== 'all' || selectedTags.length > 0 || searchQuery;

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-lightest to-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-neutral-darkest mb-4">Browse Auctions</h1>
                    <p className="text-neutral-dark">Discover amazing items and place your bids</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-2xl">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search auctions by name, description, or tags..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <aside className={`${showFilters ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center">
                                    <FunnelIcon className="h-5 w-5 mr-2" />
                                    Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-primary hover:text-primary-dark"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 text-sm text-gray-700">Category</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setPage(1);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all'
                                                ? 'bg-primary text-white'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setPage(1);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedCategory === cat
                                                    ? 'bg-primary text-white'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <span>{cat}</span>
                                            {getCategoryCount(cat) > 0 && (
                                                <span className={`text-xs ${selectedCategory === cat ? 'text-white/80' : 'text-gray-500'
                                                    }`}>
                                                    {getCategoryCount(cat)}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Popular Tags */}
                            {popularTags.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm text-gray-700">Popular Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {popularTags.map(tag => (
                                            <button
                                                key={tag._id}
                                                onClick={() => toggleTag(tag._id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTags.includes(tag._id)
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                #{tag._id} ({tag.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Filter Toggle for Mobile */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden mb-4 flex items-center px-4 py-2 bg-white rounded-lg shadow"
                        >
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>

                        {/* Active Filters */}
                        {hasActiveFilters && (
                            <div className="mb-6 flex flex-wrap gap-2 items-center">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {selectedCategory !== 'all' && (
                                    <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                        {selectedCategory}
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className="ml-2 hover:text-primary-dark"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </span>
                                )}
                                {selectedTags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        #{tag}
                                        <button
                                            onClick={() => toggleTag(tag)}
                                            className="ml-2 hover:text-gray-900"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Auction Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                                        <div className="h-48 bg-gray-300 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : auctions.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {auctions.map((auction) => (
                                        <ProductCard key={auction._id} room={auction} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 bg-white border rounded-lg">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FunnelIcon className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Auctions Found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your filters or search query
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AuctionsPage;
