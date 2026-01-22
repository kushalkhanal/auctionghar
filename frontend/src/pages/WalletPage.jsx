import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEsewaPayment } from '../hooks/useEsewaPayment'; // <-- Import the custom hook we just made

const WalletPage = () => {
    const { user } = useAuth(); // Get the current logged-in user's data

    // State to manage the amount the user enters in the form
    const [amount, setAmount] = useState(100); 

    const { initiatePayment, loading, error } = useEsewaPayment();

    
    const handleAddFunds = (e) => {
        e.preventDefault(); 
     
        initiatePayment(amount); 
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-neutral-darkest mb-4">My Wallet</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                <p className="text-lg text-neutral-dark">Current Balance</p>
                {/* Defensively check for user and user.wallet before displaying it */}
                <p className="text-5xl font-bold text-primary-dark">${user?.wallet?.toLocaleString() || '0'}</p>
                
                <form onSubmit={handleAddFunds} className="mt-8">
                    <h2 className="text-xl font-semibold text-neutral-darkest mb-3">Add Funds via eSewa</h2>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (NPR)</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        min="10" // eSewa has a minimum amount
                        required
                    />

                    {/* If the hook has an error, display it */}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={loading} // Disable the button while the hook is processing
                        className="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                        {/* Show a different text when loading */}
                        {loading ? 'Processing...' : `Add NPR ${amount}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WalletPage;