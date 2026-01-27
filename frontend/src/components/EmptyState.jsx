import React from 'react';
import { Link } from 'react-router-dom';
import {
    InboxIcon,
    MagnifyingGlassIcon,
    PlusCircleIcon,
    ShoppingBagIcon,
    ClockIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

const EmptyState = ({
    icon: Icon = InboxIcon,
    title = 'No items found',
    description = 'There are no items to display at the moment.',
    actionText,
    actionLink,
    actionOnClick,
    secondaryActionText,
    secondaryActionLink,
    secondaryActionOnClick
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            {/* Icon Container */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-primary/20 to-purple-100 rounded-full p-8">
                    <Icon className="w-20 h-20 text-primary" />
                </div>
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-bold text-neutral-darkest mb-2 text-center">
                {title}
            </h3>
            <p className="text-neutral-dark text-center max-w-md mb-8">
                {description}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {(actionText && (actionLink || actionOnClick)) && (
                    actionLink ? (
                        <Link
                            to={actionLink}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            {actionText}
                        </Link>
                    ) : (
                        <button
                            onClick={actionOnClick}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            {actionText}
                        </button>
                    )
                )}

                {(secondaryActionText && (secondaryActionLink || secondaryActionOnClick)) && (
                    secondaryActionLink ? (
                        <Link
                            to={secondaryActionLink}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all"
                        >
                            {secondaryActionText}
                        </Link>
                    ) : (
                        <button
                            onClick={secondaryActionOnClick}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all"
                        >
                            {secondaryActionText}
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

// Preset Empty States
export const NoAuctionsFound = () => (
    <EmptyState
        icon={ShoppingBagIcon}
        title="No Auctions Found"
        description="There are currently no active auctions. Check back later or create your own auction to get started!"
        actionText="Browse All Auctions"
        actionLink="/auctions"
        secondaryActionText="Create Auction"
        secondaryActionLink="/create-listing"
    />
);

export const NoSearchResults = ({ searchTerm }) => (
    <EmptyState
        icon={MagnifyingGlassIcon}
        title="No Results Found"
        description={`We couldn't find any auctions matching "${searchTerm}". Try adjusting your search terms or browse all auctions.`}
        actionText="Clear Search"
        actionOnClick={() => window.location.reload()}
        secondaryActionText="Browse All"
        secondaryActionLink="/auctions"
    />
);

export const NoBidsYet = () => (
    <EmptyState
        icon={ClockIcon}
        title="No Bids Yet"
        description="Be the first to place a bid on this auction! Don't miss out on this opportunity."
        actionText="Place First Bid"
        actionOnClick={() => document.getElementById('bid-input')?.focus()}
    />
);

export const NoFavorites = () => (
    <EmptyState
        icon={HeartIcon}
        title="No Favorites Yet"
        description="You haven't added any auctions to your favorites. Start exploring and save items you love!"
        actionText="Explore Auctions"
        actionLink="/auctions"
    />
);

export const NoTransactions = () => (
    <EmptyState
        icon={InboxIcon}
        title="No Transactions"
        description="You don't have any transaction history yet. Add funds to your wallet to get started with bidding!"
        actionText="Add Funds"
        actionLink="/profile/wallet"
    />
);

export default EmptyState;
