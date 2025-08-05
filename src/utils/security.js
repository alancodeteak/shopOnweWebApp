// Security utility functions

// Disable console in production only
if (import.meta.env.PROD && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// Prevent XSS attacks
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize URLs
export const sanitizeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

// Prevent prototype pollution
export const safeObjectAssign = (target, ...sources) => {
  const result = { ...target };
  
  for (const source of sources) {
    if (source && typeof source === 'object') {
      for (const key in source) {
        if (source.hasOwnProperty(key) && key !== '__proto__' && key !== 'constructor') {
          result[key] = source[key];
        }
      }
    }
  }
  
  return result;
};

// Rate limiting utility
class RateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the time window
    const validRequests = userRequests.filter(time => now - time < this.timeWindow);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// CSRF protection
export const getCSRFToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

// Input validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Prevent timing attacks
export const constantTimeCompare = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

// Disable developer tools (production only)
export const disableDevTools = () => {
  // Only apply restrictions in production
  if (import.meta.env.PROD && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Disable right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S')
      ) {
        e.preventDefault();
        return false;
      }
    });
    
    // Detect developer tools (less aggressive)
    let devtools = { open: false };
    
    setInterval(() => {
      const threshold = 200; // Increased threshold
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Don't completely break the page, just show a warning
          console.warn('Developer tools detected. Some features may be limited.');
        }
      } else {
        devtools.open = false;
      }
    }, 2000); // Less frequent checks
  }
};

// Initialize security measures
if (typeof window !== 'undefined') {
  disableDevTools();
} 