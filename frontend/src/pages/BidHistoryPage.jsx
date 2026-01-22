
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // We can reuse the same card

const BidHistoryPage = () => {
    const [history, setHistory] = useState({ winning: [], activeOrOutbid: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // This is a protected route, so the user must be logged in.
                // The AuthContext and axios headers handle the token automatically.
                const { data } = await axios.get('/api/users/my-bids');
                setHistory(data);
            } catch (err) {
                console.error("Failed to fetch bid history:", err);
                setError("Could not load your bid history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="text-center py-20">Loading Your Bid History...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="bg-neutral-lightest min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-neutral-darkest mb-12">My Bid History</h1>

                {/* --- Winning Bids Section --- */}
                <section>
                    <h2 className="text-2xl font-semibold text-green-600 mb-6 border-b-2 border-green-200 pb-2">Winning Bids</h2>
                    {history.winning.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {history.winning.map(room => (
                                <ProductCard key={room._id} room={room} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-dark">You haven't won any auctions yet. Keep bidding!</p>
                    )}
                </section>

                <section className="mt-16">
                    <h2 className="text-2xl font-semibold text-yellow-600 mb-6 border-b-2 border-yellow-200 pb-2">Active & Outbid</h2>
                    {history.activeOrOutbid.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {history.activeOrOutbid.map(room => (
                                <ProductCard key={room._id} room={room} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-dark">No active or outbid items found.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default BidHistoryPage;