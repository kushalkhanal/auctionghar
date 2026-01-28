import React from 'react';
import { NavLink } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { useWatchlist } from '../context/WatchlistContext';
import ProfileDropdown from '../components/ProfileDropdown'; // Ensure this path is correct
import NotificationBell from '../components/NotificationBell';
import CanAccess from '../components/CanAccess';
import { ROLES } from '../constants/permissions';
import logo from '../assets/logo auction ghar.png';
import { HeartIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { isModerator } = usePermissions();
    const { watchlistCount } = useWatchlist();


    const navLinkClass = ({ isActive }) =>
        `text-sm sm:text-base font-medium transition-colors duration-300 ${isActive
            ? 'text-primary-dark' // Style for the link of the current page
            : 'text-neutral-dark hover:text-primary' // Style for other links
        }`;

    return (
        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <NavLink to="/" className="flex items-center gap-2">
                    <img src={logo} alt="AuctionGhar" className="h-10 w-auto" />
                </NavLink>

                <nav className="space-x-2 sm:space-x-4 flex items-center">

                    <NavLink to="/" className={navLinkClass}>Home</NavLink>
                    {isAuthenticated && (
                        <>
                            <NavLink to="/auctions" className={navLinkClass}>Auctions</NavLink>
                            <NavLink to="/watchlist" className="relative">
                                {({ isActive }) => (
                                    <>
                                        <HeartIcon className={`h-6 w-6 transition-colors ${isActive ? 'text-red-500 fill-current' : 'text-neutral-dark hover:text-red-500'
                                            }`} />
                                        {watchlistCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {watchlistCount > 9 ? '9+' : watchlistCount}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </>
                    )}


                    {isAuthenticated && user ? (
                        <>
                            {/* The "+ Sell Item" button, visible to ALL logged-in users */}
                            <NavLink
                                to="/create-listing"
                                className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-secondary-dark transition-colors"
                            >
                                + Sell Item
                            </NavLink>
                            <NotificationBell />

                            {/* The Admin Panel link, visible to moderators, admins, and superadmins */}
                            <CanAccess role={[ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN]}>
                                <NavLink to="/admin/dashboard" className="font-medium text-accent-dark hover:text-accent transition-colors duration-300 text-sm sm:text-base">
                                    Admin Panel
                                </NavLink>
                            </CanAccess>

                            {/* The user's profile dropdown, which contains the logout button */}
                            <ProfileDropdown user={user} onLogout={logout} />
                        </>
                    ) : (
                        // RENDER THIS FRAGMENT IF THE USER IS LOGGED OUT
                        <>
                            <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                            <NavLink to="/register" className="px-3 py-2 sm:px-4 text-sm sm:text-base font-medium text-white bg-primary hover:bg-primary-dark transition-all duration-300 rounded-lg">
                                Register
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;