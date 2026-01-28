import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { UsersIcon, CubeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 transition-transform hover:scale-105">
    <div className="bg-primary/10 p-4 rounded-full">{icon}</div>
    <div>
      <p className="text-sm font-medium text-neutral-dark uppercase tracking-wider">{title}</p>
      <p className="text-4xl font-bold text-neutral-darkest">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth(); // Get the logged-in user's info to display their name
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function runs when the component first loads
    const fetchStats = async () => {
      try {
        // Fetch data from the backend. This API endpoint is protected by our 'isAdmin' middleware.
        const { data } = await api.get('/admin/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load statistics.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []); // The empty array [] means this effect runs only once

  if (loading) {
    return <div className="text-center text-lg">Loading Dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-neutral-darkest mb-2">Welcome, {user?.firstName}!</h1>
      <p className="text-neutral-dark mb-8">Here's a snapshot of your bidding site.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers ?? '...'} icon={<UsersIcon className="h-8 w-8 text-primary-dark" />} />
        <StatCard title="Bidding Rooms" value={stats?.totalBiddingRooms ?? '...'} icon={<CubeIcon className="h-8 w-8 text-primary-dark" />} />
        <StatCard
          title="Pending Verifications"
          value={stats?.pendingKYC ?? '...'}
          icon={<ShieldCheckIcon className="h-8 w-8 text-primary-dark" />}
          color={stats?.pendingKYC > 0 ? "text-red-500" : "text-neutral-darkest"}
        />
      </div>

      {/* Action Center - Quick links to important tasks */}
      <h2 className="text-xl font-bold text-neutral-darkest mb-4">Action Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/kyc" className="block group">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary hover:shadow-lg transition-all">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-neutral-darkest group-hover:text-primary transition-colors">KYC Requests</h3>
                <p className="text-sm text-neutral-dark mt-1">Review validation documents from users.</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                <ShieldCheckIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            {stats?.pendingKYC > 0 && (
              <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {stats.pendingKYC} Request{stats.pendingKYC !== 1 ? 's' : ''} Pending
              </div>
            )}
          </div>
        </Link>
        {/* Placeholder for future actions */}
      </div>
    </div>
  );
};

export default AdminDashboard;