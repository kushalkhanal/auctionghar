import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEsewaPayment } from '../hooks/useEsewaPayment';
import { ShieldCheckIcon, LockClosedIcon, CreditCardIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const WalletPage = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState(100);
    const { initiatePayment, loading, error } = useEsewaPayment();

    const handleAddFunds = (e) => {
        e.preventDefault();
        initiatePayment(amount);
    };

    const quickAmounts = [100, 500, 1000, 5000];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-neutral-darkest mb-2">My Wallet</h1>
                    <p className="text-neutral-dark">Manage your funds securely with eSewa integration</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <CreditCardIcon className="w-8 h-8" />
                                        <span className="text-lg font-medium opacity-90">Available Balance</span>
                                    </div>
                                    <ShieldCheckIcon className="w-6 h-6 opacity-75" />
                                </div>

                                <div className="mb-4">
                                    <p className="text-6xl font-bold tracking-tight">
                                        NPR {user?.wallet?.toLocaleString() || '0'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm opacity-75">
                                    <LockClosedIcon className="w-4 h-4" />
                                    <span>Secured by AES-256 encryption</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Funds Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg mt-6">
                            <form onSubmit={handleAddFunds}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-neutral-darkest">Add Funds</h2>
                                        <p className="text-sm text-neutral-dark">Powered by eSewa</p>
                                    </div>
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Quick Select</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {quickAmounts.map((quickAmount) => (
                                            <button
                                                key={quickAmount}
                                                type="button"
                                                onClick={() => setAmount(quickAmount)}
                                                className={`py-3 px-4 rounded-lg font-semibold transition-all ${amount === quickAmount
                                                        ? 'bg-primary text-white shadow-md scale-105'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                NPR {quickAmount}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Amount Input */}
                                <div className="mb-6">
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Amount (NPR)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">NPR</span>
                                        <input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-semibold"
                                            min="10"
                                            max="100000"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Minimum: NPR 10 | Maximum: NPR 100,000</p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                        <InformationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Add NPR ${amount.toLocaleString()} to Wallet`
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Security Info Sidebar */}
                    <div className="space-y-6">
                        {/* Security Features */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-bold text-neutral-darkest mb-4 flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5 text-primary" />
                                Security Features
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-semibold text-sm text-neutral-darkest">256-bit Encryption</p>
                                        <p className="text-xs text-neutral-dark">All transactions encrypted</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-semibold text-sm text-neutral-darkest">Fraud Detection</p>
                                        <p className="text-xs text-neutral-dark">Real-time monitoring</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-semibold text-sm text-neutral-darkest">Secure Gateway</p>
                                        <p className="text-xs text-neutral-dark">eSewa verified partner</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-semibold text-sm text-neutral-darkest">Audit Logging</p>
                                        <p className="text-xs text-neutral-dark">Complete transaction history</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Transaction Limits */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-100">
                            <h3 className="text-lg font-bold text-neutral-darkest mb-4">Transaction Limits</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-dark">Minimum</span>
                                    <span className="font-bold text-neutral-darkest">NPR 10</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-dark">Maximum</span>
                                    <span className="font-bold text-neutral-darkest">NPR 100,000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-dark">Hourly Limit</span>
                                    <span className="font-bold text-neutral-darkest">3 transactions</span>
                                </div>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
                            <h3 className="text-lg font-bold text-neutral-darkest mb-2">Need Help?</h3>
                            <p className="text-sm text-neutral-dark mb-4">
                                Contact our support team for any payment-related queries.
                            </p>
                            <button className="w-full bg-white text-primary font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors border border-primary/20">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;