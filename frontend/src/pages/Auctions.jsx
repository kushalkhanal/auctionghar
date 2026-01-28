import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

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

const Auctions = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTags, setSelectedTags] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch products with filters
    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedTags, debouncedSearchTerm, page]);

    // Fetch popular tags and category stats on mount
    useEffect(() => {
        fetchPopularTags();
        fetchCategoryStats();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 8
            };

            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            if (selectedTags.length > 0) {
                params.tags = selectedTags.join(',');
            }

            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }

            const { data } = await api.get('/bidding-rooms', { params });
            setProducts(data.products || []);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
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
        setPage(1);
    };

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedTags([]);
        setSearchTerm('');
        setPage(1);
    };

    const getCategoryCount = (category) => {
        const stat = categoryStats.find(s => s._id === category);
        return stat ? stat.count : 0;
    };

    const hasActiveFilters = selectedCategory !== 'all' || selectedTags.length > 0 || debouncedSearchTerm;

    return (
        <div className="bg-neutral-lightest min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-neutral-darkest mb-2">Live Auctions</h1>
                    <p className="text-neutral-dark">Discover amazing items and place your bids</p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-8">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search by name, description, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <aside className={`${showFilters ? 'w-64' : 'w-0'} hidden lg:block flex-shrink-0 transition-all duration-300 overflow-hidden`}>
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

                        {/* Products Grid */}
                        {loading ? (
                            <div className="text-center py-10 text-lg font-semibold">Searching...</div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {products.map(product => (
                                        <ProductCard key={product._id} room={product} />
                                    ))}
                                </div>
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <h2 className="text-2xl font-semibold text-neutral-darkest">No Auctions Found</h2>
                                <p className="mt-2 text-neutral-dark">
                                    {hasActiveFilters
                                        ? 'Try adjusting your filters or search query'
                                        : 'Check back later for new auctions!'}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
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

export default Auctions;