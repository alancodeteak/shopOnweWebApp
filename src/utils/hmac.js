import { HMAC_CONFIG } from '../config/hmac.config.js';

// Web Crypto API utilities for HMAC operations
const encoder = new TextEncoder();

/**
 * Convert ArrayBuffer to hex string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} Hex string
 */
const arrayBufferToHex = (buffer) => {
  const uint8Array = new Uint8Array(buffer);
  return Array.from(uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Convert hex string to ArrayBuffer
 * @param {string} hex - Hex string to convert
 * @returns {ArrayBuffer} ArrayBuffer
 */
const hexToArrayBuffer = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

/**
 * Create SHA-256 hash of body content
 * @param {string} content - Content to hash
 * @returns {Promise<string>} Hex hash
 */
const createBodyHash = async (content) => {
  try {
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToHex(hashBuffer);
  } catch (error) {
    console.error('Body hash creation failed:', error);
    throw new Error('Failed to create body hash');
  }
};

/**
 * Create HMAC signature for request
 * @param {string} secret - Client secret key
 * @param {string} stringToSign - String to sign
 * @returns {Promise<string>} HMAC signature
 */
export const createSignature = async (secret, stringToSign) => {
  try {
    // Import the secret key
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the data
    const data = encoder.encode(stringToSign);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    
    // Convert to hex string
    return arrayBufferToHex(signature);
  } catch (error) {
    console.error('HMAC signature creation failed:', error);
    throw new Error('Failed to create HMAC signature');
  }
};

/**
 * Build string to sign from request data
 * @param {Object} requestData - Request data object
 * @returns {Promise<string>} String to sign
 */
export const buildStringToSign = async (requestData) => {
  const {
    method,
    path,
    timestamp,
    clientId,
    body = "",
    headers = {}
  } = requestData;

  // Build canonical string
  let stringToSign = [
    method.toUpperCase(),
    path,
    timestamp,
    clientId
  ].join('\n');

  // Add body hash if present
  if (body && typeof body === 'string') {
    const bodyHash = await createBodyHash(body);
    stringToSign += '\n' + bodyHash;
  } else if (body && typeof body === 'object') {
    const bodyString = JSON.stringify(body);
    const bodyHash = await createBodyHash(bodyString);
    stringToSign += '\n' + bodyHash;
  } else {
    // Hash of empty string
    stringToSign += '\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }

  // Add relevant headers - match backend exactly
  const relevantHeaders = HMAC_CONFIG.SIGNATURE_HEADERS
    .map(header => headers[header.toLowerCase()])
    .filter(Boolean)
    .join('\n');

  if (relevantHeaders) {
    stringToSign += '\n' + relevantHeaders;
  }
  
  // Debug logging for headers
  if (import.meta.env.DEV) {
    // Headers for HMAC
  }

  return stringToSign;
};

/**
 * Generate HMAC signature for request
 * @param {Object} params - Parameters for signature generation
 * @returns {Promise<Object>} Object containing signature, timestamp, and clientId
 */
export const generateHmacSignature = async ({
  method,
  path,
  secret,
  clientId,
  body = null,
  headers = {}
}) => {
  // Generate fresh timestamp for each request (in seconds)
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Clean path: remove /api prefix, route prefixes, and query parameters
  let cleanPath = path.replace(/^\/api/, ''); // Remove /api prefix
  
  // Remove route prefixes based on backend routing
  const routePrefixes = [
    '/shopowner/auth',
    '/shopowner',
    '/shopowner-promo',
    '/delivery-partner/auth', 
    '/delivery-partners',
    '/orders',
    '/tickets',
    '/items',
    '/customer-address',
    "/customer-order-address",
    '/tracking'
  ];
  
  // Find and remove the matching route prefix
  for (const prefix of routePrefixes) {
    if (cleanPath.startsWith(prefix)) {
      cleanPath = cleanPath.replace(new RegExp(`^${prefix}`), '');
      break; // Only remove the first matching prefix
    }
  }
  
  cleanPath = cleanPath.split('?')[0]; // Remove query parameters
  
  // Build string to sign
  const stringToSign = await buildStringToSign({
    method,
    path: cleanPath,
    timestamp,
    clientId,
    body,
    headers
  });

  // Generate fresh HMAC signature for each request
  const signature = await createSignature(secret, stringToSign);

  // Debug logging
  if (import.meta.env.DEV) {
    const debugInfo = {
      method,
      originalPath: path,
      cleanPath,
      timestamp,
      clientId,
      stringToSign: stringToSign.substring(0, 200) + '...',
      signature: signature.substring(0, 16) + '...',
      hasSecret: !!secret,
      secretLength: secret ? secret.length : 0,
      secretPreview: secret ? secret.substring(0, 8) + '...' : 'none',
      headers: Object.keys(headers)
    };
    
    // Store in localStorage for debugging
    localStorage.setItem('debug_last_hmac', JSON.stringify(debugInfo));
    localStorage.setItem('debug_last_signature', signature);
    localStorage.setItem('debug_last_string_to_sign', stringToSign);
  }

  return {
    signature,
    timestamp,
    clientId
  };
};

/**
 * Generate HMAC headers for request
 * @param {Object} params - Parameters for header generation
 * @returns {Promise<Object>} Headers object with HMAC headers
 */
export const generateHmacHeaders = async ({
  method,
  path,
  secret,
  clientId,
  body = null,
  headers = {}
}) => {
  // Always generate fresh signature and timestamp for each request
  const { signature, timestamp } = await generateHmacSignature({
    method,
    path,
    secret,
    clientId,
    body,
    headers
  });

  // Return fresh HMAC headers
  return {
    [HMAC_CONFIG.SIGNATURE_HEADER]: signature,
    [HMAC_CONFIG.TIMESTAMP_HEADER]: timestamp,
    [HMAC_CONFIG.CLIENT_ID_HEADER]: clientId,
  };
};

/**
 * Check if path requires HMAC signature
 * @param {string} path - Request path
 * @returns {boolean} Whether HMAC is required
 */
export const requiresHmacSignature = (path) => {
  // If HMAC is not enabled, no path requires it
  if (!HMAC_CONFIG.HMAC_ENABLED) {
    return false;
  }
  
  return !HMAC_CONFIG.EXCLUDED_PATHS.some(excludedPath => 
    path.startsWith(excludedPath)
  );
};

/**
 * Check if method requires HMAC signature
 * @param {string} method - HTTP method
 * @returns {boolean} Whether HMAC is required
 */
export const methodRequiresHmac = (method) => {
  return !HMAC_CONFIG.EXCLUDED_METHODS.includes(method.toUpperCase());
};

/**
 * Check if this is a login endpoint
 * @param {string} path - Request path
 * @returns {boolean} Whether this is a login endpoint
 */
export const isLoginEndpoint = (path) => {
  const loginEndpoints = [
    "/auth/login",
    "/delivery-partner/auth/login",
    "/orders/create", 
  ];

  return loginEndpoints.some(loginPath => 
    path.includes(loginPath)
  );
};

/**
 * Get HMAC secret from localStorage
 * @returns {string|null} HMAC secret or null
 */
export const getHmacSecret = () => {
  return localStorage.getItem('hmac_secret');
};

/**
 * Store HMAC secret in localStorage
 * @param {string} secret - HMAC secret to store
 */
export const setHmacSecret = (secret) => {
  localStorage.setItem('hmac_secret', secret);
};

/**
 * Clear HMAC secret from localStorage
 */
export const clearHmacSecret = () => {
  localStorage.removeItem('hmac_secret');
};

/**
 * Get client ID (user ID) from localStorage
 * @returns {string|null} Client ID or null
 */
export const getClientId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || user.user_id || null;
};

/**
 * Test HMAC signature generation (for debugging)
 * @param {string} secret - HMAC secret to test
 * @param {string} stringToSign - String to sign
 * @returns {Promise<string>} Generated signature
 */
export const testHmacSignature = async (secret, stringToSign) => {
  try {
    const signature = await createSignature(secret, stringToSign);
    if (import.meta.env.DEV) {
      // Test HMAC
    }
    return signature;
  } catch (error) {
    console.error('Test HMAC failed:', error);
    return null;
  }
}; 