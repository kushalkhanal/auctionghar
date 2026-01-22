import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const SettingsTab = ({ user, onProfileUpdate }) => {

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        number: user.number || '',
        location: user.location || ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setMessage('Error: Please select a valid image file (JPEG, PNG, or GIF).');
                return;
            }
            
            // Validate file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                setMessage('Error: Image size must be less than 2MB.');
                return;
            }
            
            setProfileImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            setMessage(''); // Clear any previous error messages
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');


        const submissionData = new FormData();
        submissionData.append('firstName', formData.firstName);
        submissionData.append('lastName', formData.lastName);
        submissionData.append('number', formData.number);
        submissionData.append('location', formData.location);

        if (profileImage) {
            submissionData.append('profileImage', profileImage);
        }

        try {
            const { data } = await api.put('/profile', submissionData);

            if (data.user && data.token) {
                login(data);
            }
            setMessage('Profile updated successfully!');
            
            // Clear the file input and preview
            setProfileImage(null);
            setImagePreview(null);
            
            // Reset the file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }
            
            // Refresh the profile data if callback is provided
            if (onProfileUpdate) {
                onProfileUpdate();
            }
        } catch (error) {
            console.error("Profile update failed:", error);
            if (error.response?.data?.message) {
                setMessage(`Error: ${error.response.data.message}`);
            } else if (error.message) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage('Error updating profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-darkest">Profile Settings</h2>
            
            {/* Current Profile Image Display */}
            <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Profile Picture</p>
                <img 
                    src={`http://localhost:5050${user.profileImage}`} 
                    alt="Current profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="p-2 border rounded-md" />
                    <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded-md" />
                </div>
                <input name="number" value={formData.number} onChange={handleChange} placeholder="Mobile Number" className="w-full p-2 border rounded-md" />
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., Kathmandu)" className="w-full p-2 border rounded-md" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Profile Picture</label>
                    <input 
                        type="file" 
                        name="profileImage" 
                        onChange={handleFileChange} 
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                    />
                    {imagePreview && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <img 
                                src={imagePreview} 
                                alt="Profile preview" 
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                            />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        'Save Changes'
                    )}
                </button>
                {message && <p className={`mt-2 text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
            </form>
        </div>
    );
};

export default SettingsTab;