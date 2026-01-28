import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuth();
    const { success, error } = useToast();

    // Fetch watchlist when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchlist();
        } else {
            setWatchlist([]);
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/watchlist');
            setWatchlist(data.watchlist || []);
        } catch (err) {
            console.error('Error fetching watchlist:', err);
            setWatchlist([]);
        } finally {
            setLoading(false);
        }
    };

    const addToWatchlist = async (auctionId) => {
        if (!isAuthenticated) {
            error('Please login to add items to watchlist');
            return false;
        }

        try {
            const { data } = await api.post('/watchlist', { auctionId });
            await fetchWatchlist(); // Refresh the entire watchlist
            success('Added to watchlist ❤️');
            return true;
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add to watchlist';
            error(message);
            return false;
        }
    };

    const removeFromWatchlist = async (auctionId) => {
        try {
            await api.delete(`/watchlist/${auctionId}`);
            // Optimistically update UI
            setWatchlist(prev => prev.filter(item => item.auction._id !== auctionId));
            success('Removed from watchlist');
            return true;
        } catch (err) {
            error('Failed to remove from watchlist');
            return false;
        }
    };

    const toggleWatchlist = async (auctionId) => {
        const isWatched = isInWatchlist(auctionId);
        if (isWatched) {
            return await removeFromWatchlist(auctionId);
        } else {
            return await addToWatchlist(auctionId);
        }
    };

    const isInWatchlist = (auctionId) => {
        return watchlist.some(item => item.auction?._id === auctionId);
    };

    const clearEndedAuctions = async () => {
        try {
            const { data } = await api.delete('/watchlist/clear/ended');
            await fetchWatchlist();
            success(data.message || 'Cleared ended auctions');
            return true;
        } catch (err) {
            error('Failed to clear ended auctions');
            return false;
        }
    };

    const updateNotificationSettings = async (auctionId, settings) => {
        try {
            await api.patch(`/watchlist/${auctionId}/notifications`, settings);
            // Update local state
            setWatchlist(prev => prev.map(item => {
                if (item.auction._id === auctionId) {
                    return {
                        ...item,
                        notifyOnOutbid: settings.notifyOnOutbid ?? item.notifyOnOutbid,
                        notifyOnEnding: settings.notifyOnEnding ?? item.notifyOnEnding
                    };
                }
                return item;
            }));
            success('Notification settings updated');
            return true;
        } catch (err) {
            error('Failed to update notification settings');
            return false;
        }
    };

    const value = {
        watchlist,
        loading,
        watchlistCount: watchlist.length,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        clearEndedAuctions,
        updateNotificationSettings,
        refreshWatchlist: fetchWatchlist
    };

    return (
        <WatchlistContext.Provider value={value}>
            {children}
        </WatchlistContext.Provider>
    );
};

export const useWatchlist = () => {
    const context = useContext(WatchlistContext);
    if (!context) {
        throw new Error('useWatchlist must be used within a WatchlistProvider');
    }
    return context;
};

export default WatchlistContext;
