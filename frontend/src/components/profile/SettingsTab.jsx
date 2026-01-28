import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import MFASettings from '../MFASettings';

const SettingsTab = ({ user, onProfileUpdate }) => {

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        number: user.number || '',
        location: user.location || ''
    });
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: user.privacy?.profileVisibility || 'public',
        showEmail: user.privacy?.showEmail || false,
        showLocation: user.privacy?.showLocation !== undefined ? user.privacy.showLocation : true,
        showPhone: user.privacy?.showPhone || false
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

        // Add privacy settings
        submissionData.append('privacy', JSON.stringify(privacySettings));

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

            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                {/* Profile Picture Section */}
                <div className="mb-8 flex flex-col items-center sm:items-start">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-upload').click()}>
                        {/* Profile Image or Fallback */}
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile preview"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : user.profileImage ? (
                            <img
                                src={`http://localhost:5050${user.profileImage}`}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-lg uppercase">
                                {user.firstName ? user.firstName.charAt(0) : 'U'}
                            </div>
                        )}

                        {/* Camera Icon Overlay */}
                        <div className="absolute top-0 right-0 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-primary transition-colors border border-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            id="profile-upload"
                            type="file"
                            name="profileImage"
                            onChange={handleFileChange}
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            className="hidden"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click icon to update picture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="p-2 border rounded-md" />
                    <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded-md" />
                </div>
                <input name="number" value={formData.number} onChange={handleChange} placeholder="Mobile Number" className="w-full p-2 border rounded-md" />
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., Kathmandu)" className="w-full p-2 border rounded-md" />
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

            {/* Privacy Settings */}
            <div className="mt-8 pt-8 border-t border-neutral-light">
                <h2 className="text-2xl font-semibold mb-4 text-neutral-darkest">Privacy Settings</h2>
                <p className="text-sm text-neutral-dark mb-6">Control who can see your profile information</p>

                <div className="space-y-4 max-w-lg">
                    {/* Profile Visibility */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                        <select
                            value={privacySettings.profileVisibility}
                            onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="public">Public - Anyone can view</option>
                            <option value="bidders">Bidders Only - Only people you bid against</option>
                            <option value="private">Private - Only you</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Controls overall profile visibility</p>
                    </div>

                    {/* Show Email */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                            <p className="font-medium">Show Email</p>
                            <p className="text-xs text-gray-500">Let others see your email address</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacySettings.showEmail}
                                onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Show Location */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                            <p className="font-medium">Show Location</p>
                            <p className="text-xs text-gray-500">Let others see your location</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacySettings.showLocation}
                                onChange={(e) => setPrivacySettings({ ...privacySettings, showLocation: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Show Phone */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                            <p className="font-medium">Show Phone Number</p>
                            <p className="text-xs text-gray-500">Let others see your phone number</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacySettings.showPhone}
                                onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Security Settings - MFA */}
            <div className="mt-8 pt-8 border-t border-neutral-light">
                <h2 className="text-2xl font-semibold mb-4 text-neutral-darkest">Security Settings</h2>
                <MFASettings />
            </div>
        </div >
    );
};

export default SettingsTab;