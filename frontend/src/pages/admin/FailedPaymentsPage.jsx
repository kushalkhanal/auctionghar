import React, { useState, useEffect } from 'react';
import { ShieldExclamationIcon, EyeIcon } from '@heroicons/react/24/outline';
import api from '../../api/axiosConfig';

const FailedPaymentsPage = () => {
    const [failedPayments, setFailedPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFailedPayments();
    }, []);

    const fetchFailedPayments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/payment/failed');
            if (response.data.success) {
                setFailedPayments(response.data.data);
            } else {
                setError('Failed to fetch failed payments');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching failed payments');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            failed: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            success: 'bg-green-100 text-green-800'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <ShieldExclamationIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Failed Payments</h1>
                <p className="text-gray-600 mt-2">
                    Recent failed payment attempts and their details for debugging
                </p>
            </div>

            {failedPayments.length === 0 ? (
                <div className="text-center py-8">
                    <ShieldExclamationIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No failed payments found</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">
                                Failed Payment Details ({failedPayments.length})
                            </h2>
                            <button
                                onClick={fetchFailedPayments}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Failure Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {failedPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {payment.userId?.username || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {payment.userId?.email || 'No email'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                NPR {payment.amount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-mono">
                                                {payment.transaction_uuid}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {payment.failureReason || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(payment.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.failureDetails && (
                                                <button
                                                    onClick={() => {
                                                        alert(JSON.stringify(payment.failureDetails, null, 2));
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FailedPaymentsPage; 