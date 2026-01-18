import React, { useState } from 'react';
import { HiXMark, HiPhoto, HiCheckCircle } from 'react-icons/hi2';

const CreateMenuModal = ({ isOpen, onClose, userId, onMenuCreated }) => {
    const [menuName, setMenuName] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            setError('Please select valid image files');
            return;
        }

        // Convert to base64 for preview and upload
        const readers = imageFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then(results => {
            setPhotos(results);
            setError('');
        });
    };

    const handleGenerate = async () => {
        if (!menuName.trim()) {
            setError('Please enter a menu name');
            return;
        }

        if (photos.length === 0) {
            setError('Please upload at least one photo');
            return;
        }

        try {
            setIsExtracting(true);
            setError('');

            // Step 1: Extract menu data from photos
            const extractResponse = await fetch('/.netlify/functions/extract-menu-from-photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photos }),
            });

            const extractData = await extractResponse.json();

            if (!extractResponse.ok) {
                throw new Error(extractData.error || 'Failed to extract menu data');
            }

            setIsExtracting(false);
            setIsCreating(true);

            // Step 2: Create menu in database
            const createResponse = await fetch('/.netlify/functions/create-generated-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    menuName: menuName.trim(),
                    photos,
                    extractedData: extractData.extractedData,
                }),
            });

            const createData = await createResponse.json();

            if (!createResponse.ok) {
                throw new Error(createData.error || 'Failed to create menu');
            }

            setIsCreating(false);
            setSuccess(true);

            // Notify parent and close after delay
            setTimeout(() => {
                onMenuCreated(createData.menu);
                handleClose();
            }, 2000);

        } catch (err) {
            setError(err.message);
            setIsExtracting(false);
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setMenuName('');
        setPhotos([]);
        setError('');
        setSuccess(false);
        setIsUploading(false);
        setIsExtracting(false);
        setIsCreating(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {success ? (
                    // Success Screen
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiCheckCircle className="text-green-500" size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                            Menu Created!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your digital menu has been generated successfully!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                Create New Menu
                            </h2>
                            <button
                                onClick={handleClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <HiXMark size={24} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Menu Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Menu Name *
                                </label>
                                <input
                                    type="text"
                                    value={menuName}
                                    onChange={(e) => setMenuName(e.target.value)}
                                    placeholder="e.g., Pizza Time Menu"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Upload Menu Photos *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-orange-500 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label htmlFor="photo-upload" className="cursor-pointer">
                                        <HiPhoto className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            PNG, JPG up to 10MB (multiple files supported)
                                        </p>
                                    </label>
                                </div>

                                {/* Photo Previews */}
                                {photos.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                                <img
                                                    src={photo}
                                                    alt={`Upload ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isExtracting || isCreating}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isExtracting && '🤖 Extracting menu data...'}
                                {isCreating && '📝 Creating menu...'}
                                {!isExtracting && !isCreating && '✨ Generate Menu'}
                            </button>

                            {/* Info */}
                            <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                                AI will automatically extract menu items, prices, and descriptions from your photos
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreateMenuModal;
