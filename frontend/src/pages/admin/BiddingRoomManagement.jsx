import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import EditBiddingRoomModal from '../../components/EditBiddingRoomModal';

const BiddingRoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for managing the edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Function to fetch all bidding rooms from the backend
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/bidding-rooms');
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch bidding rooms", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRooms();
  }, []);

  // Function to open the modal for editing a specific room
  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Function to close the edit modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  // Function to handle the form submission from the modal
  const handleUpdateRoom = async (roomId, updatedData) => {
    try {
      await api.put(`/admin/bidding-rooms/${roomId}`, updatedData);
      handleCloseModal(); // Close the modal on success
      fetchRooms();       // Refresh the list to show the updated data
    } catch (error) {
      console.error("Failed to update bidding room", error);
      alert("Error: Could not update the bidding room.");
    }
  };


  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to permanently delete this bidding room?')) {
      try {
        await api.delete(`/admin/bidding-rooms/${roomId}`);
        fetchRooms();
      } catch (error) {
        console.error('Failed to delete room', error);
        alert('Could not delete bidding room.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-neutral-darkest">Bidding Room Management</h1>
        <Link
          to="/admin/bidding-rooms/add"
          className="inline-block px-5 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
        >
          + Add New Room
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        {loading ? (<p>Loading bidding rooms...</p>) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-light">
              <thead className="bg-neutral-lightest">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase">Room / Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase">End Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-dark uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-light">
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={room.imageUrls && room.imageUrls[0] ? room.imageUrls[0] : '/uploads/default-avatar.png'}
                            alt={room.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-darkest">{room.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-dark">{room.seller ? `${room.seller.firstName} ${room.seller.lastName}` : 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary-dark">${room.currentPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-neutral-dark">{new Date(room.endTime).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(room)}
                          className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Edit Bidding Room"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete Bidding Room"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditBiddingRoomModal
        room={selectedRoom}
        onUpdate={handleUpdateRoom}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default BiddingRoomManagement;