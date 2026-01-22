

import React, { useState, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

// A new, separate component for a single notification item for better organization
const NotificationItem = ({ notif, closePopover }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { setNotifications } = useSocket();

    const handleMarkAsRead = async (e) => {
        e.preventDefault(); // Prevent the Link from navigating
        e.stopPropagation(); // Stop the event from bubbling up

        if (notif.isRead) return; // Don't do anything if already read

        try {
            await api.put('/notifications/read', { notificationId: notif._id });
            // Update the state locally for an instant UI change
            setNotifications(prev => 
                prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    // Check if the message is long enough to need a "Read More" button
    const isLongMessage = notif.message.length > 70;
    const displayMessage = isLongMessage && !isExpanded 
        ? `${notif.message.substring(0, 70)}...` 
        : notif.message;

    return (
        <Link
            to={notif.link || '#'}
            onClick={closePopover}
            className={`block p-4 border-b last:border-b-0 transition-colors ${notif.isRead ? 'bg-white' : 'bg-primary/5'}`}
        >
            <div className="flex items-start justify-between space-x-4">
                {/* Left side (50% width) */}
                <div className="w-1/2 flex-grow">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                        {displayMessage}
                    </p>
                    {isLongMessage && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-xs text-blue-600 hover:underline mt-1"
                        >
                            {isExpanded ? 'Show Less' : 'Read More'}
                        </button>
                    )}
                </div>

                {/* Right side (50% width) */}
                <div className="w-1/2 flex-shrink-0 flex flex-col items-end justify-between self-stretch">
                    <p className="text-xs text-gray-400">
                        {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                    {!notif.isRead && (
                         <button 
                            onClick={handleMarkAsRead}
                            className="mt-2 text-xs flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors"
                         >
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Mark as Read</span>
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
};



const NotificationBell = () => {
    const { notifications, setNotifications } = useSocket();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read'); // No ID means mark all
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <Popover className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                        <BellIcon className="h-6 w-6 text-neutral-dark" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Popover.Button>
                    <Transition as={Fragment} /* ... */ >
                        <Popover.Panel className="absolute z-10 right-0 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="p-4 flex justify-between items-center border-b">
                                <p className="font-bold">Notifications</p>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:underline">
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <NotificationItem key={notif._id} notif={notif} closePopover={close} />
                                    ))
                                ) : (
                                    <p className="p-4 text-sm text-center text-gray-500">You have no new notifications.</p>
                                )}
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
};

export default NotificationBell;