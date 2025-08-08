import React, { useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ImageUpload({
  label,
  value,
  onChange,
  onRemove,
  error,
  className,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = "image/*",
  previewHeight = "h-32",
  showRemoveButton = true,
  required = false,
  existingImageUrl,
  validate = true,
  ...props
}) {
  const [localError, setLocalError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous errors
    setLocalError('');

    // Check file type
    if (!file.type.startsWith('image/')) {
      setLocalError('Please select an image file');
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      setLocalError(`Image size should be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    // Validate image dimensions - fixed width of 853px and height of 1280px
    if (validate) {
      const img = new Image();
      img.onload = () => {
        let hasError = false;

        // Check for fixed width of 853px and height of 1280px
        if (img.width !== 853) {
          setLocalError(`Image width must be exactly 853px (current: ${img.width}px)`);
          hasError = true;
        }
        
        if (img.height !== 1280) {
          setLocalError(`Image height must be exactly 1280px (current: ${img.height}px)`);
          hasError = true;
        }

        if (!hasError) {
          onChange(file);
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      onChange(file);
    }
  };

  const handleRemove = () => {
    setLocalError('');
    onRemove?.();
  };

  const displayError = error || localError;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">

        {(value || (existingImageUrl && typeof existingImageUrl === 'string' && existingImageUrl.trim() !== '')) ? (
          <div className="relative">
            <img
              src={value ? (typeof value === 'string' ? value : URL.createObjectURL(value)) : existingImageUrl}
              alt="Preview"
              className={cn("w-full object-cover rounded-lg border-2 border-gray-200", previewHeight)}
              onLoad={(e) => {
                console.log('Image loaded successfully:', e.target.src);
              }}
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                // Log additional debugging information
                if (existingImageUrl) {
                  console.log('Existing image URL type:', typeof existingImageUrl);
                  console.log('Existing image URL value:', existingImageUrl);
                }
                // Replace with a more descriptive SVG for image not found
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23999%22%3EImage%20not%20found%3C%2Ftext%3E%3C%2Fsvg%3E';
                // Also log the error to help with debugging
                console.log('Using fallback image');
              }}
            />
            {showRemoveButton && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload image</span>
            {validate && (
              <span className="text-xs text-gray-400 mt-1">Image must be exactly 853x1280px</span>
            )}
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
              {...props}
            />
          </label>
        )}
        {displayError && <p className="text-red-500 text-xs mt-2">{displayError}</p>}
      </div>
    </div>
  );
}