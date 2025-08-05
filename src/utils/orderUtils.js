/**
 * Check if water need is enabled for an order
 * Handles different data types that might come from the API
 * @param {any} waterNeed - The water value from the order
 * @returns {boolean} Whether water is needed
 */
export const isWaterNeeded = (waterNeed) => {
  // Debug: Log the input value
  
  
  if (waterNeed === null || waterNeed === undefined) {
    
    return false;
  }
  
  // Handle boolean values
  if (typeof waterNeed === 'boolean') {
   
    return waterNeed;
  }
  
  // Handle string values
  if (typeof waterNeed === 'string') {
    const lowerValue = waterNeed.toLowerCase();
    const result = lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
    
    return result;
  }
  
  // Handle number values
  if (typeof waterNeed === 'number') {
    const result = waterNeed === 1;
   
    return result;
  }
  
  
  return false;
};

/**
 * Get display text for water need status
 * @param {any} waterNeed - The water value from the order
 * @returns {string} Display text
 */
export const getWaterNeedText = (waterNeed) => {
  // Debug: Log the input value
 
  const result = isWaterNeeded(waterNeed) ? 'YES' : 'NO';
  
  return result;
}; 