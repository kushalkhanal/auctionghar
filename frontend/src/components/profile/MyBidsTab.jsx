
import React from 'react';
import ProductCard from '../ProductCard'; // It only needs to import other components

const MyBidsTab = ({ bidHistory }) => {
  // A safety check in case the data is still loading
  if (!bidHistory) {
    return <p>Loading bid history...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-neutral-darkest border-b pb-2">My Bidding Activity</h2>
      
      {/* Winning Bids Section */}
      <section>
        <h3 className="text-lg font-semibold text-green-600 mb-4">Winning Bids</h3>
        {bidHistory.winning && bidHistory.winning.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bidHistory.winning.map(room => <ProductCard key={room._id} room={room} />)}
          </div>
        ) : (
          <p className="text-neutral-dark">You haven't won any auctions yet. Keep bidding!</p>
        )}
      </section>

      {/* Active & Outbid Section */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold text-yellow-600 mb-4">Active & Outbid Items</h3>
        {bidHistory.activeOrOutbid && bidHistory.activeOrOutbid.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bidHistory.activeOrOutbid.map(room => <ProductCard key={room._id} room={room} />)}
          </div>
        ) : (
          <p className="text-neutral-dark">You have no bids on currently active auctions.</p>
        )}
      </section>
    </div>
  );
};

export default MyBidsTab;