import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../context/PermissionContext';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUsers, setDeletingUsers] = useState(new Set());
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const { hasPermission, refreshPermissions } = usePermissions();

  // Available roles
  const roles = [
    { value: 'user', label: '👤 User', color: 'bg-neutral-light text-neutral-dark' },
    { value: 'moderator', label: '🛡️ Moderator', color: 'bg-blue-100 text-blue-700' },
    { value: 'admin', label: '👑 Admin', color: 'bg-primary/20 text-primary-dark' },
    { value: 'superadmin', label: '⚡ Super Admin', color: 'bg-purple-100 text-purple-700' }
  ];

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
    if (!hasPermission('users:delete')) {
      alert('You do not have permission to delete users');
      return;
    }

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

  // Function to start editing a user's role
  const startEditRole = (user) => {
    if (!hasPermission('users:update')) {
      alert('You do not have permission to update user roles');
      return;
    }
    setEditingUser(user._id);
    setSelectedRole(user.role);
  };

  // Function to cancel role editing
  const cancelEditRole = () => {
    setEditingUser(null);
    setSelectedRole('');
  };

  // Function to save the updated role
  const saveUserRole = async (userId) => {
    try {
      await api.put('/rbac/role', {
        userId,
        newRole: selectedRole
      });

      alert('User role updated successfully!');
      setEditingUser(null);
      setSelectedRole('');
      fetchUsers();

      // Refresh permissions if we updated our own role
      await refreshPermissions();
    } catch (error) {
      console.error('Failed to update user role', error);
      const errorMessage = error.response?.data?.message || 'Could not update user role.';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Get role display info
  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-neutral-darkest mb-8">User Management</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        {loading ? (<p>Loading users...</p>) : (
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
                {users.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  const isEditing = editingUser === user._id;

                  return (
                    <tr key={user._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-darkest">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-neutral-dark">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-1 border border-neutral-light rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {roles.map(role => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-dark">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              {/* Save Button */}
                              <button
                                onClick={() => saveUserRole(user._id)}
                                className="p-2 rounded-full hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors"
                                title="Save Changes"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              {/* Cancel Button */}
                              <button
                                onClick={cancelEditRole}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-700 transition-colors"
                                title="Cancel"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Edit Role Button */}
                              {hasPermission('users:update') && (
                                <button
                                  onClick={() => startEditRole(user)}
                                  className="p-2 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Edit Role"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                              )}
                              {/* Delete Button */}
                              {hasPermission('users:delete') && (
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  disabled={deletingUsers.has(user._id)}
                                  className={`p-2 rounded-full transition-colors ${deletingUsers.has(user._id)
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
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;