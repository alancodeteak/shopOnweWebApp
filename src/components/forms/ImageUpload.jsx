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
  aspectRatio,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = "image/*",
  previewHeight = "h-32",
  showRemoveButton = true,
  required = false,
  existingImageUrl,
  validate = true,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
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

    // Validate image dimensions and aspect ratio if validation is enabled
    if (validate) {
      const img = new Image();
      img.onload = () => {
        const fileAspectRatio = img.width / img.height;
        let hasError = false;

        // Check aspect ratio if specified
        if (aspectRatio) {
          const tolerance = 0.1;
          if (Math.abs(fileAspectRatio - aspectRatio) > tolerance) {
            setLocalError(`Image should have a 1:${1/aspectRatio} aspect ratio (current: ${fileAspectRatio.toFixed(2)})`);
            hasError = true;
          }
        }

        // Check width constraints
        if (minWidth && img.width < minWidth) {
          setLocalError(`Image width should be at least ${minWidth}px (current: ${img.width}px)`);
          hasError = true;
        }
        if (maxWidth && img.width > maxWidth) {
          setLocalError(`Image width should be at most ${maxWidth}px (current: ${img.width}px)`);
          hasError = true;
        }

        // Check height constraints
        if (minHeight && img.height < minHeight) {
          setLocalError(`Image height should be at least ${minHeight}px (current: ${img.height}px)`);
          hasError = true;
        }
        if (maxHeight && img.height > maxHeight) {
          setLocalError(`Image height should be at most ${maxHeight}px (current: ${img.height}px)`);
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
        {console.log('🖼️ ImageUpload - value:', value, 'existingImageUrl:', existingImageUrl)}
        {(value || existingImageUrl) ? (
          <div className="relative">
            <img
              src={value ? (typeof value === 'string' ? value : URL.createObjectURL(value)) : existingImageUrl}
              alt="Preview"
              className={cn("w-full object-cover rounded-lg border-2 border-gray-200", previewHeight)}
              onError={(e) => {
                console.log('🖼️ Image failed to load:', e.target.src);
                console.log('🖼️ Trying to load from existingImageUrl:', existingImageUrl);
              }}
              onLoad={() => console.log('🖼️ Image loaded successfully from:', value || existingImageUrl)}
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
            {validate && aspectRatio && (
              <span className="text-xs text-gray-400 mt-1">1:{1/aspectRatio} aspect ratio required</span>
            )}
            {validate && (minWidth || maxWidth || minHeight || maxHeight) && (
              <span className="text-xs text-gray-400 mt-1">
                {minWidth && maxWidth ? `${minWidth}-${maxWidth}px width` : 
                 minWidth ? `min ${minWidth}px width` : 
                 maxWidth ? `max ${maxWidth}px width` : ''}
                {minHeight && maxHeight ? `, ${minHeight}-${maxHeight}px height` : 
                 minHeight ? `, min ${minHeight}px height` : 
                 maxHeight ? `, max ${maxHeight}px height` : ''}
              </span>
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