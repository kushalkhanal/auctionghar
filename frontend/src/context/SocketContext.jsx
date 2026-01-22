
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/axiosConfig'; // Import our centralized axios instance

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // This function fetches the user's saved notifications from the database.
        const fetchInitialNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                setNotifications(data);
            } catch (error) {
                // Silently handle notification fetch errors
            }
        };

        let newSocket;
        // This effect runs only when a user logs in.
        if (user) {
            // 1. Fetch any notifications that were missed while the user was logged out.
            fetchInitialNotifications();

            // 2. Establish the real-time connection for any NEW notifications.
            // Use the same host as the API calls (will be proxied in development)
            newSocket = io('http://localhost:5050', {
                transports: ['websocket', 'polling'],
                upgrade: true,
                rememberUpgrade: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000
            });
            setSocket(newSocket);
            
            newSocket.on('connect', () => {
                setIsConnected(true);
                newSocket.emit('join_user_room', user.id);
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
            });

            newSocket.on('connect_error', () => {
                setIsConnected(false);
            });

            newSocket.on('reconnect', () => {
                setIsConnected(true);
                newSocket.emit('join_user_room', user.id);
            });

            newSocket.on('reconnect_error', () => {
                setIsConnected(false);
            });

            // This listener adds new notifications that arrive in real-time to the list.
            newSocket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });

            // Cleanup function to close the connection on logout.
            return () => {
                if (newSocket) {
                    newSocket.close();
                    setIsConnected(false);
                }
            };
        } else {
            // Clear socket when user logs out
            setSocket(null);
            setIsConnected(false);
        }
    }, [user]); // The dependency array ensures this runs on login/logout.

    const value = { socket, isConnected, notifications, setNotifications };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};