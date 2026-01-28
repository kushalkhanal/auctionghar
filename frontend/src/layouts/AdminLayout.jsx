import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ChartPieIcon, UsersIcon, CubeIcon, TagIcon, ShieldExclamationIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo auction ghar.png';

const AdminLayout = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${isActive
      ? 'bg-primary text-white font-semibold' // Style for the active link
      : 'text-neutral-light hover:bg-primary/20 hover:text-white' // Style for inactive links
    }`;

  return (
    <div className="flex min-h-screen bg-neutral-lightest">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-neutral-darkest text-neutral-light flex flex-col p-4 shadow-lg">
        <div className="p-4 mb-6 border-b border-neutral-dark">
          <Link to="/" className="block text-center hover:opacity-80 transition-opacity">
            <img src={logo} alt="AuctionGhar" className="h-12 w-auto mx-auto mb-2" />
            <p className="text-sm text-neutral-light">Admin Panel</p>
          </Link>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <ChartPieIcon className="h-6 w-6" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            <UsersIcon className="h-6 w-6" />
            <span>User Management</span>
          </NavLink>
          <NavLink to="/admin/bidding-rooms" className={navLinkClass}>
            <CubeIcon className="h-6 w-6" />
            <span>Bidding Rooms</span>
          </NavLink>
          <NavLink to="/admin/failed-payments" className={navLinkClass}>
            <ShieldExclamationIcon className="h-6 w-6" />
            <span>Failed Payments</span>
          </NavLink>
          <NavLink to="/admin/kyc" className={navLinkClass}>
            <ShieldCheckIcon className="h-6 w-6" />
            <span>KYC Requests</span>
          </NavLink>
          {/* Placeholder for future sprint. We make it look disabled. */}
          <NavLink to="/admin/categories" className={navLinkClass + " opacity-50 cursor-not-allowed"}>
            <TagIcon className="h-6 w-6" />
            <span>Categories</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* The Outlet is where your individual admin pages will render */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;