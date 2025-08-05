/**
 * Utility functions for safe array operations
 */

/**
 * Safely map over an array, returning an empty array if the input is not an array
 * @param {any} array - The array to map over
 * @param {Function} callback - The mapping function
 * @returns {Array} - The mapped array or empty array if input is invalid
 */
export const safeMap = (array, callback) => {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.map(callback);
};

/**
 * Safely filter an array, returning an empty array if the input is not an array
 * @param {any} array - The array to filter
 * @param {Function} callback - The filter function
 * @returns {Array} - The filtered array or empty array if input is invalid
 */
export const safeFilter = (array, callback) => {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.filter(callback);
};

/**
 * Safely reduce an array, returning the initial value if the input is not an array
 * @param {any} array - The array to reduce
 * @param {Function} callback - The reduce function
 * @param {any} initialValue - The initial value
 * @returns {any} - The reduced value or initial value if input is invalid
 */
export const safeReduce = (array, callback, initialValue) => {
  if (!Array.isArray(array)) {
    return initialValue;
  }
  return array.reduce(callback, initialValue);
};

/**
 * Get the length of an array safely, returning 0 if the input is not an array
 * @param {any} array - The array to get length of
 * @returns {number} - The length of the array or 0 if input is invalid
 */
export const safeLength = (array) => {
  if (!Array.isArray(array)) {
    return 0;
  }
  return array.length;
};

/**
 * Check if an array is empty (including null/undefined checks)
 * @param {any} array - The array to check
 * @returns {boolean} - True if the array is empty, null, undefined, or not an array
 */
export const isEmpty = (array) => {
  if (!Array.isArray(array)) {
    return true;
  }
  return array.length === 0;
};

/**
 * Get the first element of an array safely
 * @param {any} array - The array to get the first element from
 * @returns {any} - The first element or undefined if input is invalid
 */
export const safeFirst = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    return undefined;
  }
  return array[0];
};

/**
 * Get the last element of an array safely
 * @param {any} array - The array to get the last element from
 * @returns {any} - The last element or undefined if input is invalid
 */
export const safeLast = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    return undefined;
  }
  return array[array.length - 1];
}; 