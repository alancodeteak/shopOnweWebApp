// Secure Storage Utilities
// Provides AES-256-GCM encryption and HMAC integrity verification for localStorage

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Convert ArrayBuffer to base64 string
 */
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Convert base64 string to ArrayBuffer
 */
const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Derive encryption key from session data
 * Uses user-specific data to create a unique key per session
 */
const deriveEncryptionKey = async (userData) => {
  try {
    // Create a unique salt from user data and session info
    const salt = encoder.encode(
      `${userData?.id || 'anonymous'}-${userData?.email || 'no-email'}-${Date.now()}`
    );
    
    // Use PBKDF2 to derive a key from a master secret
    const masterSecret = encoder.encode('CodeTeak-Secure-Storage-2024');
    
    const key = await crypto.subtle.importKey(
      'raw',
      masterSecret,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    return derivedKey;
  } catch (error) {
    console.error('Key derivation failed:', error);
    throw new Error('Failed to derive encryption key');
  }
};

/**
 * Generate HMAC key for integrity verification
 */
const deriveHmacKey = async (userData) => {
  try {
    const salt = encoder.encode(
      `hmac-${userData?.id || 'anonymous'}-${Date.now()}`
    );
    
    const masterSecret = encoder.encode('CodeTeak-HMAC-Integrity-2024');
    
    const key = await crypto.subtle.importKey(
      'raw',
      masterSecret,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    
    return derivedKey;
  } catch (error) {
    console.error('HMAC key derivation failed:', error);
    throw new Error('Failed to derive HMAC key');
  }
};

/**
 * Encrypt data with AES-256-GCM
 */
const encryptData = async (data, key) => {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode(JSON.stringify(data));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encodedData
    );
    
    return {
      data: arrayBufferToBase64(encryptedBuffer),
      iv: arrayBufferToBase64(iv),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data with AES-256-GCM
 */
const decryptData = async (encryptedData, key) => {
  try {
    const { data, iv } = encryptedData;
    
    const encryptedBuffer = base64ToArrayBuffer(data);
    const ivBuffer = base64ToArrayBuffer(iv);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      key,
      encryptedBuffer
    );
    
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Create HMAC signature for data integrity
 */
const createHmacSignature = async (data, hmacKey) => {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = encoder.encode(dataString);
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      hmacKey,
      encodedData
    );
    
    return arrayBufferToBase64(signature);
  } catch (error) {
    console.error('HMAC signature creation failed:', error);
    throw new Error('Failed to create HMAC signature');
  }
};

/**
 * Verify HMAC signature
 */
const verifyHmacSignature = async (data, signature, hmacKey) => {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = encoder.encode(dataString);
    const signatureBuffer = base64ToArrayBuffer(signature);
    
    return await crypto.subtle.verify(
      'HMAC',
      hmacKey,
      signatureBuffer,
      encodedData
    );
  } catch (error) {
    console.error('HMAC signature verification failed:', error);
    return false;
  }
};

/**
 * Check if data has expired (24-hour TTL)
 */
const isDataExpired = (timestamp) => {
  const TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return Date.now() - timestamp > TTL;
};

/**
 * Secure storage class
 */
class SecureStorage {
  constructor() {
    this.encryptionKey = null;
    this.hmacKey = null;
    this.userData = null;
  }

  /**
   * Initialize secure storage with user data
   */
  async initialize(userData) {
    try {
      this.userData = userData;
      this.encryptionKey = await deriveEncryptionKey(userData);
      this.hmacKey = await deriveHmacKey(userData);
      
      if (import.meta.env.DEV) {
        // Secure storage initialized for user
      }
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      throw error;
    }
  }

  /**
   * Clear secure storage
   */
  clear() {
    this.encryptionKey = null;
    this.hmacKey = null;
    this.userData = null;
  }

  /**
   * Store data securely
   */
  async setItem(key, value) {
    try {
      if (!this.encryptionKey || !this.hmacKey) {
        throw new Error('Secure storage not initialized');
      }

      // Encrypt the data
      const encryptedData = await encryptData(value, this.encryptionKey);
      
      // Create HMAC signature for integrity
      const signature = await createHmacSignature(encryptedData, this.hmacKey);
      
      // Store encrypted data with signature
      const secureData = {
        ...encryptedData,
        signature,
        version: '1.0'
      };
      
      localStorage.setItem(`secure_${key}`, JSON.stringify(secureData));
      
      if (import.meta.env.DEV) {
        // Securely stored
      }
    } catch (error) {
      console.error(`Failed to store ${key} securely:`, error);
      throw error;
    }
  }

  /**
   * Retrieve data securely
   */
  async getItem(key) {
    try {
      if (!this.encryptionKey || !this.hmacKey) {
        throw new Error('Secure storage not initialized');
      }

      const storedData = localStorage.getItem(`secure_${key}`);
      if (!storedData) {
        return null;
      }

      const secureData = JSON.parse(storedData);
      
      // Check version compatibility
      if (secureData.version !== '1.0') {
        console.warn(`Incompatible version for ${key}, clearing`);
        this.removeItem(key);
        return null;
      }

      // Check if data has expired
      if (isDataExpired(secureData.timestamp)) {
        console.warn(`Data expired for ${key}, clearing`);
        this.removeItem(key);
        return null;
      }

      // Verify HMAC signature
      const { signature, ...encryptedData } = secureData;
      const isValid = await verifyHmacSignature(encryptedData, signature, this.hmacKey);
      
      if (!isValid) {
        console.error(`HMAC verification failed for ${key}, possible tampering detected`);
        this.removeItem(key);
        throw new Error('Data integrity check failed');
      }

      // Decrypt the data
      const decryptedData = await decryptData(encryptedData, this.encryptionKey);
      
      
      return decryptedData;
    } catch (error) {
      console.error(`Failed to retrieve ${key} securely:`, error);
      // Clear corrupted data
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove secure data
   */
  removeItem(key) {
    localStorage.removeItem(`secure_${key}`);
    if (import.meta.env.DEV) {
      // Securely removed
    }
  }

  /**
   * Clear all secure data
   */
  clearAll() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
    
    if (import.meta.env.DEV) {
      // Cleared all secure data
    }
  }

  /**
   * Check if secure storage is initialized
   */
  isInitialized() {
    return !!(this.encryptionKey && this.hmacKey);
  }
}

// Create singleton instance
export const secureStorage = new SecureStorage();

/**
 * Legacy compatibility functions
 * These provide backward compatibility with existing code
 */

/**
 * Secure version of localStorage.setItem
 */
export const secureSetItem = async (key, value) => {
  if (!secureStorage.isInitialized()) {
    console.warn('Secure storage not initialized, falling back to regular localStorage');
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  
  await secureStorage.setItem(key, value);
};

/**
 * Secure version of localStorage.getItem
 */
export const secureGetItem = async (key) => {
  if (!secureStorage.isInitialized()) {
    console.warn('Secure storage not initialized, falling back to regular localStorage');
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  
  return await secureStorage.getItem(key);
};

/**
 * Secure version of localStorage.removeItem
 */
export const secureRemoveItem = (key) => {
  if (!secureStorage.isInitialized()) {
    localStorage.removeItem(key);
    return;
  }
  
  secureStorage.removeItem(key);
};

/**
 * Initialize secure storage with user data
 */
export const initializeSecureStorage = async (userData) => {
  await secureStorage.initialize(userData);
};

/**
 * Clear secure storage
 */
export const clearSecureStorage = () => {
  secureStorage.clear();
  secureStorage.clearAll();
}; 