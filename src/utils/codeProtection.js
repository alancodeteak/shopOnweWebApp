// Code Protection Utilities
// Helps protect sensitive code from being easily readable in production

/**
 * Environment-based code execution
 * Only executes code in specific environments
 */
export const envExecute = {
  // Only execute in development
  dev: (fn) => {
    if (import.meta.env.DEV) {
      return fn();
    }
    return null;
  },
  
  // Only execute in production
  prod: (fn) => {
    if (import.meta.env.PROD) {
      return fn();
    }
    return null;
  },
  
  // Execute based on environment
  when: (env, fn) => {
    if (import.meta.env.MODE === env) {
      return fn();
    }
    return null;
  }
};

/**
 * Code obfuscation helper
 * Makes sensitive strings harder to read
 */
export const obfuscate = {
  // Simple string obfuscation
  string: (str) => {
    if (import.meta.env.DEV) {
      return str; // Keep readable in development
    }
    // In production, return obfuscated version
    return btoa(str).split('').reverse().join('');
  },
  
  // Obfuscate sensitive strings but not environment variables
  sensitiveString: (str) => {
    if (import.meta.env.DEV) {
      return str; // Keep readable in development
    }
    // Only obfuscate if it's not an environment variable
    if (str.startsWith('VITE_') || str.includes('import.meta.env')) {
      return str; // Keep environment variables readable
    }
    // In production, return obfuscated version
    return btoa(str).split('').reverse().join('');
  },
  
  // Deobfuscate string
  deobfuscate: (obfuscated) => {
    if (import.meta.env.DEV) {
      return obfuscated; // Already readable in development
    }
    // In production, deobfuscate
    return atob(obfuscated.split('').reverse().join(''));
  },
  
  // Obfuscate object keys
  keys: (obj) => {
    if (import.meta.env.DEV) {
      return obj; // Keep readable in development
    }
    
    const obfuscated = {};
    Object.keys(obj).forEach(key => {
      const obfuscatedKey = btoa(key).split('').reverse().join('');
      obfuscated[obfuscatedKey] = obj[key];
    });
    return obfuscated;
  }
};

/**
 * Function protection
 * Makes function names and logic harder to understand
 */
export const protectFunction = (fn, name = 'anonymous') => {
  if (import.meta.env.DEV) {
    // In development, return function as-is with readable name
    Object.defineProperty(fn, 'name', { value: name });
    return fn;
  }
  
  // In production, return obfuscated function
  const obfuscatedName = btoa(name).split('').reverse().join('');
  const protectedFn = (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      // Don't expose function details in production
      console.error('Function execution failed');
      throw new Error('Operation failed');
    }
  };
  
  Object.defineProperty(protectedFn, 'name', { value: obfuscatedName });
  return protectedFn;
};

/**
 * Class protection
 * Makes class names and methods harder to understand
 */
export const protectClass = (Class, name = 'AnonymousClass') => {
  if (import.meta.env.DEV) {
    return Class;
  }
  
  // In production, create protected class
  const obfuscatedName = btoa(name).split('').reverse().join('');
  
  class SecureClass extends Class {
    constructor(...args) {
      super(...args);
    }
  }
  
  Object.defineProperty(SecureClass, 'name', { value: obfuscatedName });
  return SecureClass;
};

/**
 * API endpoint protection
 * Makes API endpoints harder to discover
 */
export const protectEndpoint = (endpoint) => {
  if (import.meta.env.DEV) {
    return endpoint; // Keep readable in development
  }
  
  // In production, obfuscate endpoint
  const parts = endpoint.split('/');
  const obfuscatedParts = parts.map(part => {
    if (part.startsWith(':')) {
      return part; // Keep parameter placeholders
    }
    return btoa(part).split('').reverse().join('');
  });
  
  return obfuscatedParts.join('/');
};

/**
 * Configuration protection
 * Makes configuration values harder to read
 */
export const protectConfig = (config) => {
  if (import.meta.env.DEV) {
    return config; // Keep readable in development
  }
  
  const secured = {};
  Object.keys(config).forEach(key => {
    const value = config[key];
    if (typeof value === 'string') {
      secured[key] = obfuscate.string(value);
    } else if (typeof value === 'object') {
      secured[key] = protectConfig(value);
    } else {
      secured[key] = value;
    }
  });
  
  return secured;
};

/**
 * Debug protection
 * Removes debug information in production
 */
export const debug = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    } else {
      // In production, log generic error
      console.error('An error occurred');
    }
  },
  
  info: (...args) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  }
};

/**
 * Code execution protection
 * Prevents code from being easily reverse-engineered
 */
export const executeProtected = (code, context = {}) => {
  if (import.meta.env.DEV) {
    // In development, execute normally
    return new Function(...Object.keys(context), code)(...Object.values(context));
  }
  
  // In production, add protection layer
  try {
    const protectedCode = `
      (function() {
        'use strict';
        ${code}
      })();
    `;
    
    return new Function(...Object.keys(context), protectedCode)(...Object.values(context));
  } catch (error) {
    debug.error('Protected code execution failed');
    throw new Error('Operation failed');
  }
};

/**
 * Remove development-only code in production
 */
export const removeInProduction = (code) => {
  if (import.meta.env.DEV) {
    return code;
  }
  return null;
};

/**
 * Conditional code loading
 * Only loads code when needed
 */
export const conditionalLoad = {
  // Load only in development
      dev: (module) => {
      if (import.meta.env.DEV) {
        return import(/* @vite-ignore */ module);
      }
      return Promise.resolve(null);
    },
  
  // Load only in production
  prod: (module) => {
    if (import.meta.env.PROD) {
      return import(/* @vite-ignore */ module);
    }
    return Promise.resolve(null);
  }
}; 