
import React, { useState, useRef } from 'react';
import { useCreateBiddingRoom } from '../../hooks/useCreateBiddingRoom';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const AddBiddingRoomPage = () => {
    const { createRoom, loading, error } = useCreateBiddingRoom();
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    // Helper function to get min and max dates
    const getMinMaxDates = () => {
        const now = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        // Format for datetime-local input (YYYY-MM-DDTHH:MM)
        const minDate = now.toISOString().slice(0, 16);
        const maxDate = oneMonthFromNow.toISOString().slice(0, 16);

        return { minDate, maxDate };
    };

    // State for the text-based form fields
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startingPrice: '100', // Set a default starting price
        endTime: '',
        category: 'Other',
    });
    // Enhanced state for multiple images
    const [productImages, setProductImages] = useState([]);
    const [imageErrors, setImageErrors] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special validation for endTime
        if (name === 'endTime') {
            const selectedDate = new Date(value);
            const currentDate = new Date();
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            if (selectedDate > oneMonthFromNow) {
                alert('Auction end time cannot be more than one month from now.');
                return;
            }

            if (selectedDate <= currentDate) {
                alert('Auction end time must be in the future.');
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const validateImages = (files) => {
        const maxImages = 5;
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (files.length > maxImages) {
            return `Maximum ${maxImages} images allowed.`;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!allowedTypes.includes(file.type)) {
                return 'Only JPEG, PNG, GIF, and WebP images are allowed.';
            }

            if (file.size > maxSize) {
                return 'Each image must be less than 5MB.';
            }
        }

        return '';
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const error = validateImages(files);

        if (error) {
            setImageErrors(error);
            return;
        }

        setImageErrors('');

        // Create preview URLs for the images
        const imageFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setProductImages(imageFiles);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        const error = validateImages(files);

        if (error) {
            setImageErrors(error);
            return;
        }

        setImageErrors('');

        // Create preview URLs for the images
        const imageFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setProductImages(imageFiles);
    };

    const removeImage = (index) => {
        const newImages = productImages.filter((_, i) => i !== index);
        setProductImages(newImages);
        setImageErrors('');
    };

    // The submit handler is now very simple.
    const handleSubmit = (e) => {
        e.preventDefault();

        if (productImages.length === 0) {
            setImageErrors('At least one image is required.');
            return;
        }

        // Convert to FileList for the hook
        const files = productImages.map(img => img.file);
        const fileList = new DataTransfer();
        files.forEach(file => fileList.items.add(file));

        // 3. It just calls the function from our hook, passing the state.
        createRoom(formData, fileList.files);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-neutral-darkest mb-8">Add New Bidding Room</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Item Name</label>
                        <input type="text" name="name" id="name" onChange={handleChange} value={formData.name} className="mt-1 w-full p-3 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">Item Description</label>
                        <textarea name="description" id="description" onChange={handleChange} value={formData.description} rows="4" className="mt-1 w-full p-3 border rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-gray-700">Category</label>
                        <select name="category" id="category" onChange={handleChange} value={formData.category} className="mt-1 w-full p-3 border rounded-md" required>
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Home & Garden">Home & Garden</option>
                            <option value="Sports & Outdoors">Sports & Outdoors</option>
                            <option value="Collectibles">Collectibles</option>
                            <option value="Art">Art</option>
                            <option value="Jewelry">Jewelry</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="Books & Media">Books & Media</option>
                            <option value="Toys & Games">Toys & Games</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startingPrice" className="block text-sm font-semibold text-gray-700">Starting Price (NPR)</label>
                        <input type="number" name="startingPrice" id="startingPrice" onChange={handleChange} value={formData.startingPrice} className="mt-1 w-full p-3 border rounded-md" min="1" required />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700">Auction End Time</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            id="endTime"
                            onChange={handleChange}
                            value={formData.endTime}
                            min={getMinMaxDates().minDate}
                            max={getMinMaxDates().maxDate}
                            className="mt-1 w-full p-3 border rounded-md"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Auction duration must be between now and one month from today.
                        </p>
                    </div>

                    {/* Enhanced Image Upload Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Product Images (up to 5)
                        </label>

                        {/* Drag & Drop Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-primary/50'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="space-y-4">
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div>
                                    <p className="text-lg font-medium text-gray-900">
                                        {productImages.length > 0 ? `${productImages.length} image(s) selected` : 'Upload your images'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Drag and drop images here, or{' '}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-primary hover:text-primary-dark font-medium"
                                        >
                                            browse files
                                        </button>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        PNG, JPG, GIF, WebP up to 5MB each (max 5 images)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Preview Grid */}
                        {productImages.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview ({productImages.length}/5)</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                    {productImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                                                {image.file.size < 1024 * 1024
                                                    ? `${(image.file.size / 1024).toFixed(1)} KB`
                                                    : `${(image.file.size / 1024 / 1024).toFixed(1)} MB`
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error Messages */}
                        {imageErrors && (
                            <p className="text-red-500 text-sm mt-2">{imageErrors}</p>
                        )}
                    </div>

                    {/* Display any error message from the hook */}
                    {error && <p className="text-red-500 text-center font-semibold whitespace-pre-wrap">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || productImages.length === 0}
                        className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Bidding Room'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBiddingRoomPage;