/**
 * HMAC Configuration
 * This file contains all HMAC-related configuration settings
 */

export const HMAC_CONFIG = {
  // Enable/disable HMAC globally
  HMAC_ENABLED: true, // Re-enabled since backend requires HMAC signatures
  
  // Algorithm settings
  ALGORITHM: "sha256",
  ENCODING: "hex",
  
  // Signature settings
  SIGNATURE_HEADER: "x-request-signature",
  TIMESTAMP_HEADER: "x-request-timestamp",
  CLIENT_ID_HEADER: "x-client-id",
  
  // Request components to include in signature
  SIGNATURE_COMPONENTS: [
    "method",
    "path",
    "timestamp",
    "client_id",
    "body"
  ],
  
  // Headers to include in signature (optional)
  SIGNATURE_HEADERS: [
    "content-type",
    "user-agent", // TODO: Remove from backend for better security
    "x-device-id",
    "x-app-version",
    "x-platform"
  ],
  
  // Excluded paths (no HMAC required)
  EXCLUDED_PATHS: [
    "/health",
    "/robots.txt",
    "/favicon.ico",
    "/socket.io/",
    "/track/",
    "/orderbill/",
    "/images/",
    "/sounds/",
    "/metrics",
    "/diagnostics",
    "/logs",
    "/admin/cache"
  ],
  
  // Excluded methods (no HMAC required)
  EXCLUDED_METHODS: ["OPTIONS"],
  
  // Time validation (5 minutes = 300 seconds)
  TIMESTAMP_TOLERANCE: 300, // seconds
  
  // Error messages
  ERROR_MESSAGES: {
    MISSING_SIGNATURE: "Request signature is required",
    MISSING_TIMESTAMP: "Request timestamp is required",
    MISSING_CLIENT_ID: "Client ID is required",
    INVALID_SIGNATURE: "Invalid request signature",
    EXPIRED_TIMESTAMP: "Request timestamp has expired",
    FUTURE_TIMESTAMP: "Request timestamp is in the future",
    TOO_MANY_FAILURES: "Too many signature failures",
    INVALID_CLIENT_ID: "Invalid client ID",
    SECRET_NOT_FOUND: "Client secret not found"
  }
};

export default HMAC_CONFIG; 