/**
 * Calculate item analytics from API response
 * @param {Object} data - The API response data
 * @returns {Object} Calculated analytics
 */
export const calculateItemAnalytics = (data) => {
  if (!data || !data.items || !Array.isArray(data.items)) {
    return {
      count: 0,
      totalQuantity: 0,
      totalAmount: 0,
      calculatedTotalAmount: 0
    };
  }

  const items = data.items;
  
  // Count of orders
  const count = data.count || items.length;
  
  // Sum of quantities
  const totalQuantity = items.reduce((sum, item) => {
    return sum + parseFloat(item.quantity || 0);
  }, 0);
  
  // Sum of total amounts from API
  const totalAmount = items.reduce((sum, item) => {
    return sum + parseFloat(item.totalamount || 0);
  }, 0);
  
  // Calculate total amount by multiplying quantity × price for each item
  const calculatedTotalAmount = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity || 0);
    const price = parseFloat(item.price || 0);
    return sum + (quantity * price);
  }, 0);

  return {
    count,
    totalQuantity: parseFloat(totalQuantity.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    calculatedTotalAmount: parseFloat(calculatedTotalAmount.toFixed(2))
  };
};

/**
 * Format currency amount in Indian Rupees
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format quantity with appropriate units
 * @param {number} quantity - The quantity to format
 * @returns {string} Formatted quantity string
 */
export const formatQuantity = (quantity) => {
  return quantity.toFixed(2);
}; 