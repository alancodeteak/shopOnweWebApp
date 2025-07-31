/**
 * Check if water need is enabled for an order
 * Handles different data types that might come from the API
 * @param {any} waterNeed - The water value from the order
 * @returns {boolean} Whether water is needed
 */
export const isWaterNeeded = (waterNeed) => {
  // Debug: Log the input value
  console.log('🌊 isWaterNeeded input:', waterNeed, typeof waterNeed);
  
  if (waterNeed === null || waterNeed === undefined) {
    console.log('🌊 isWaterNeeded: null/undefined, returning false');
    return false;
  }
  
  // Handle boolean values
  if (typeof waterNeed === 'boolean') {
    console.log('🌊 isWaterNeeded: boolean value, returning:', waterNeed);
    return waterNeed;
  }
  
  // Handle string values
  if (typeof waterNeed === 'string') {
    const lowerValue = waterNeed.toLowerCase();
    const result = lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
    console.log('🌊 isWaterNeeded: string value, returning:', result);
    return result;
  }
  
  // Handle number values
  if (typeof waterNeed === 'number') {
    const result = waterNeed === 1;
    console.log('🌊 isWaterNeeded: number value, returning:', result);
    return result;
  }
  
  console.log('🌊 isWaterNeeded: default case, returning false');
  return false;
};

/**
 * Get display text for water need status
 * @param {any} waterNeed - The water value from the order
 * @returns {string} Display text
 */
export const getWaterNeedText = (waterNeed) => {
  // Debug: Log the input value
  console.log('🌊 getWaterNeedText input:', waterNeed, typeof waterNeed);
  const result = isWaterNeeded(waterNeed) ? 'YES' : 'NO';
  console.log('🌊 getWaterNeedText result:', result);
  return result;
}; 