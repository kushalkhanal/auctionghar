import { Routes, Route } from "react-router-dom";
import React, { lazy } from 'react';

import Login from "../pages/Login";
import Register from "../pages/Register"
import MainLayout from "../layouts/MainLayout";
import Homepage from "../pages/Homepage"
import BidHistoryPage from '../pages/BidHistoryPage';
import Auctions from '../pages/Auctions';
import ProfilePage from '../pages/ProfilePage';
import AdminDashboard from "../pages/admin/AdminDashboard";
import FailedPaymentsPage from "../pages/admin/FailedPaymentsPage";
import CreateListingPage from '../pages/CreateListingPage.jsx';


import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';



import AdminRoute from "./AdminRoutes";
import AdminLayout from "../layouts/AdminLayout";
import BiddingRoomManagement from "../pages/admin/BiddingRoomManagement";
import ManageUsers from "../pages/admin/UserManagement";
import ProductDetailPage from '../pages/ProductDetailPage';
import WalletPage from '../pages/WalletPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentFailurePage from '../pages/PaymentFailurePage';
import AddBiddingRoomPage from '../pages/admin/AddBiddingRoomPage';
import ProtectedRoute from './ProtectedRoute';
import NotFound from '../pages/NotFound';
import WatchlistPage from '../pages/WatchlistPage';

const AppRouter = () => (
    <Routes>
        <Route element={<MainLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes - Require Authentication */}
            <Route path="/profile/bids" element={
                <ProtectedRoute>
                    <BidHistoryPage />
                </ProtectedRoute>
            } />
            <Route path="/auctions" element={
                <ProtectedRoute>
                    <Auctions />
                </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
                <ProtectedRoute>
                    <WatchlistPage />
                </ProtectedRoute>
            } />
            <Route path="/bidding-rooms/:id" element={
                <ProtectedRoute>
                    <ProductDetailPage />
                </ProtectedRoute>
            } />
            <Route path="/profile/wallet" element={
                <ProtectedRoute>
                    <WalletPage />
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } />
            <Route path="/create-listing" element={
                <ProtectedRoute>
                    <CreateListingPage />
                </ProtectedRoute>
            } />
            <Route path="/change-password" element={
                <ProtectedRoute>
                    <ChangePasswordPage />
                </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failure" element={<PaymentFailurePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

        </Route>

        <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/bidding-rooms" element={<BiddingRoomManagement />} />
                <Route path="/admin/bidding-rooms/add" element={<AddBiddingRoomPage />} />
                <Route path="/admin/failed-payments" element={<FailedPaymentsPage />} />


                <Route path="/admin/categories" element={
                    <div className="text-center p-10">
                        <h1 className="text-2xl font-bold">Category Management</h1>
                        <p className="mt-2 text-neutral-dark">This feature is coming in a future sprint!</p>
                    </div>
                } />

            </Route>
        </Route>

        {/* Catch-all route for 404 - Must be last */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRouter;