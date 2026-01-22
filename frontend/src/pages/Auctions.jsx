import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../api/axiosConfig'; // Use our centralized axios instance

const Auctions = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');


    // This is the "debouncing" effect. It creates a small delay after the user
    // stops typing before we actually consider the search term final.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Crucially, reset to page 1 every time the search term changes
        }, 500); // 500ms delay

        // Cleanup function to reset the timer if the user types again
        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);


    // This effect handles all data fetching.
    // It runs whenever the page number OR the debounced search term changes.
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // We use 'api.get' and pass the parameters in a 'params' object.
                // Axios will automatically format this into the URL: /api/bidding-rooms?page=1&search=watch
                const { data } = await api.get('/bidding-rooms', {
                    params: {
                        page: page,
                        search: debouncedSearchTerm
                    }
                });

                // Update state with the new data from the API
                setProducts(data.products);
                setPage(data.page);
                setTotalPages(data.totalPages);

            } catch (err) {
                console.error("Error fetching products:", err);
                setError('Could not load auctions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, debouncedSearchTerm]); // The dependency array


    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="bg-neutral-lightest min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-neutral-darkest">Live Auctions</h1>
                </div>


                <div className="max-w-xl mx-auto mb-12">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="search"
                            name="search"
                            id="search"
                            className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                            placeholder="Search for an item by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>


                {loading ? (
                    <div className="text-center py-10 text-lg font-semibold">Searching...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500 font-semibold">{error}</div>
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
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold text-neutral-darkest">No Auctions Found</h2>
                        <p className="mt-2 text-neutral-dark">Try adjusting your search or check back later!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auctions;