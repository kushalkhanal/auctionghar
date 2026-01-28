import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';

const KYCManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null); // For modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const { showToast } = useToast();

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/kyc/admin/pending');
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error("Error fetching KYC requests:", error);
            showToast('Failed to load validation requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (userId) => {
        if (!window.confirm("Are you sure you want to verify this user?")) return;

        try {
            const { data } = await api.put(`/kyc/admin/review/${userId}`, { action: 'approve' });
            if (data.success) {
                showToast('User verified successfully', 'success');
                setRequests(requests.filter(req => req._id !== userId));
            }
        } catch (error) {
            console.error("Approval Error:", error);
            showToast('Failed to approve user', 'error');
        }
    };

    const openRejectModal = (userId) => {
        setSelectedUserId(userId);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showToast('Please provide a reason for rejection', 'error');
            return;
        }

        try {
            const { data } = await api.put(`/kyc/admin/review/${selectedUserId}`, {
                action: 'reject',
                rejectionReason
            });

            if (data.success) {
                showToast('User rejected', 'info');
                setRequests(requests.filter(req => req._id !== selectedUserId));
                setRejectModalOpen(false);
                setSelectedUserId(null);
            }
        } catch (error) {
            console.error("Rejection Error:", error);
            showToast('Failed to reject user', 'error');
        }
    };

    const getDocUrl = (docPath) => {
        // Doc path is stored as /uploads/kyc-documents/filename.jpg
        // API endpoint is /api/kyc/document/filename.jpg
        const filename = docPath.split('/').pop();
        return `${api.defaults.baseURL}/kyc/document/${filename}`;
    };

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-darkest mb-6">KYC Verification Requests</h1>

            {requests.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-neutral-dark">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>No pending verification requests.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{req.firstName} {req.lastName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{req.email}</div>
                                        <div className="text-sm text-gray-500">{req.number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => setSelectedDoc(getDocUrl(req.kycDocument))}
                                            className="text-primary hover:text-primary-dark flex items-center text-sm"
                                        >
                                            <EyeIcon className="w-4 h-4 mr-1" /> View ID
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleApprove(req._id)}
                                            className="text-green-600 hover:text-green-900 mr-4"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => openRejectModal(req._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Document Preview Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setSelectedDoc(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] p-2">
                        <img src={selectedDoc} alt="KYC Document" className="max-w-full max-h-[85vh] rounded shadow-lg" />
                        <button
                            className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800"
                            onClick={() => setSelectedDoc(null)}
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Reject Verification</h3>
                        <p className="text-sm text-gray-500 mb-4">Please specify why you are rejecting this document. The user will see this message.</p>

                        <textarea
                            className="w-full border rounded-md p-2 h-32 mb-4 focus:ring-primary focus:border-primary"
                            placeholder="e.g., Document is blurry, Name does not match profile..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />

                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                onClick={() => setRejectModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={handleReject}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KYCManagement;
