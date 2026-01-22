// File: frontend/src/components/admin/EditBiddingRoomModal.jsx

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditBiddingRoomModal = ({ room, onUpdate, onClose }) => {
    // State to manage all the form inputs
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startingPrice: 0,
        currentPrice: 0,
        endTime: '',
    });

    // This effect runs whenever a new 'room' is passed in as a prop.
    // It populates the form with that room's data.
    useEffect(() => {
        if (room) {
            setFormData({
                name: room.name || '',
                description: room.description || '',
                startingPrice: room.startingPrice || 0,
                currentPrice: room.currentPrice || 0,
                // The 'datetime-local' input requires a specific format: YYYY-MM-DDTHH:MM
                // This line converts the ISO date string from the database into that format.
                endTime: room.endTime ? new Date(room.endTime).toISOString().slice(0, 16) : '',
            });
        }
    }, [room]);

    // If no room is selected to be edited, the modal doesn't render at all.
    if (!room) {
        return null;
    }

    // A single handler to update the form state as the user types in any field.
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // We handle number inputs slightly differently to make sure they are stored as numbers, not strings.
        const val = type === 'number' ? parseFloat(value) : value;
        setFormData(prevData => ({
            ...prevData,
            [name]: val,
        }));
    };

    // This function is called when the "Save Changes" button is clicked.
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the default browser form submission behavior
        // Calls the 'onUpdate' function passed down from the parent page, sending the data up.
        onUpdate(room._id, formData);
    };

    return (
        // Modal Backdrop: A semi-transparent overlay covering the page
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-bold text-neutral-darkest">Edit Bidding Room</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-light">
                        <XMarkIcon className="h-6 w-6 text-neutral-dark" />
                    </button>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-dark">Room Name / Title</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-neutral-light border border-neutral-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-dark">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-neutral-light border border-neutral-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    {/* Price Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startingPrice" className="block text-sm font-medium text-neutral-dark">Starting Price ($)</label>
                            <input
                                type="number"
                                id="startingPrice"
                                name="startingPrice"
                                value={formData.startingPrice}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-neutral-light border border-neutral-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="currentPrice" className="block text-sm font-medium text-neutral-dark">Current Price ($)</label>
                            <input
                                type="number"
                                id="currentPrice"
                                name="currentPrice"
                                value={formData.currentPrice}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-neutral-light border border-neutral-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    {/* End Time Input */}
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-neutral-dark">Auction End Time</label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-neutral-light border border-neutral-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    {/* Modal Footer with Action Buttons */}
                    <div className="flex justify-end space-x-4 border-t pt-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-neutral-light text-neutral-darkest rounded-md hover:bg-neutral-DEFAULT font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBiddingRoomModal;