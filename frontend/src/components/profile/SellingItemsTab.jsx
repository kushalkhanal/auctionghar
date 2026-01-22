import React from 'react';
import ProductCard from '../ProductCard';

const SellingItemsTab = ({ items }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4 text-neutral-darkest">Items You Are Selling</h2>
    {items.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(room => <ProductCard key={room._id} room={room} />)}
      </div>
    ) : <p>You have not listed any items for auction.</p>}
  </div>
);
export default SellingItemsTab;