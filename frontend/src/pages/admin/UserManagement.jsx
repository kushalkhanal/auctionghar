import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; 
import { TrashIcon } from '@heroicons/react/24/outline';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUsers, setDeletingUsers] = useState(new Set());

  // Function to fetch all users from the backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // Run fetchUsers() when the component first mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to handle the delete button click
  const handleDeleteUser = async (userId) => {
    // A simple confirmation dialog to prevent accidental deletion
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        setDeletingUsers(prev => new Set(prev).add(userId));
        await api.delete(`/admin/users/${userId}`);
        // After successful deletion, refresh the list of users
        fetchUsers();
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Failed to delete user', error);
        const errorMessage = error.response?.data?.message || 'Could not delete user. They might be protected or a server error occurred.';
        alert(`Error: ${errorMessage}`);
      } finally {
        setDeletingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-neutral-darkest mb-8">User Management</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        {loading ? ( <p>Loading users...</p> ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-light">
              <thead className="bg-neutral-lightest">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-dark uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-light">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-darkest">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-neutral-dark">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary-dark' : 'bg-neutral-light text-neutral-dark'}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-dark">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteUser(user._id)} 
                        disabled={deletingUsers.has(user._id)}
                        className={`p-2 rounded-full transition-colors ${
                          deletingUsers.has(user._id) 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                        }`} 
                        title={deletingUsers.has(user._id) ? "Deleting..." : "Delete User"}
                      >
                        {deletingUsers.has(user._id) ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;