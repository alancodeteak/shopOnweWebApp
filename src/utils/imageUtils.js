// Helper function to construct proper image URLs
export const getImageUrl = (imagePath) => {
  // Detailed logging for debugging
  console.log('getImageUrl called with:', imagePath, 'type:', typeof imagePath);
  
  // Check if imagePath is null, undefined, or an empty string
  if (!imagePath) {
    console.log('Image path is null or undefined');
    return null;
  }
  
  // Check if imagePath is an object (including empty objects)
  if (typeof imagePath === 'object') {
    console.log('Image path is an object:', JSON.stringify(imagePath));
    return null;
  }
  
  // Check if imagePath is an empty string
  if (typeof imagePath === 'string' && imagePath.trim() === '') {
    console.log('Image path is an empty string');
    return null;
  }

  // Handle AWS URLs and other full URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Using full URL:', imagePath);
    return imagePath;
  }
  
  // Handle relative paths that start with /
  if (imagePath.startsWith('/')) {
    const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://yaadro.com/api'}${imagePath}`;
    console.log('Constructed URL with leading slash:', fullUrl);
    return fullUrl;
  }
  
  // Handle relative paths without leading /
  const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://yaadro.com/api'}/${imagePath}`;
  console.log('Constructed URL without leading slash:', fullUrl);
  return fullUrl;
};

// Helper function to generate initials for fallback avatar
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last || 'DP';
};

// Helper function to create a data URL for initials avatar
export const createInitialsAvatar = (firstName, lastName) => {
  const initials = getInitials(firstName, lastName);
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(0, 0, 100, 100);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 50, 50);
  
  return canvas.toDataURL();
};

// Helper function to handle image loading errors with fallbacks
export const handleImageError = (event, fallbackSrc, partnerName = '') => {
  const originalSrc = event.target.src;
  
  // Check if it's an S3 URL that might have expired
  const isS3Url = originalSrc.includes('amazonaws.com') || originalSrc.includes('s3.');
  
  event.target.onerror = null;
  
  if (fallbackSrc) {
    event.target.src = fallbackSrc;
  } else if (partnerName) {
    // Extract first and last name from partner name
    const names = partnerName.split(' ');
    const firstName = names[0] || '';
    const lastName = names[1] || '';
    event.target.src = createInitialsAvatar(firstName, lastName);
  } else {
    event.target.src = createInitialsAvatar('', '');
  }
};

// Helper function to create a proper image element with error handling
export const createImageWithFallback = (src, alt, className, partnerName = '') => {
  const fallbackSrc = partnerName ? createInitialsAvatar(...partnerName.split(' ')) : createInitialsAvatar('', '');
  
  return {
    src: getImageUrl(src) || fallbackSrc,
    alt,
    className,
    onError: (e) => handleImageError(e, fallbackSrc, partnerName),
    onLoad: () => {}
  };
};