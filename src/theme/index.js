export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

// Status configurations
export const statusConfig = {
  order: {
    Pending: { color: 'warning', variant: 'default' },
    Assigned: { color: 'primary', variant: 'default' },
    Completed: { color: 'success', variant: 'default' },
    Delivered: { color: 'success', variant: 'default' },
    Cancelled: { color: 'error', variant: 'default' },
  },
  urgency: {
    Normal: { color: 'primary', variant: 'pill' },
    Urgent: { color: 'error', variant: 'pill' },
  },
  ticket: {
    Open: { color: 'success', variant: 'pill' },
    Resolved: { color: 'gray', variant: 'default' },
  },
};

// Helper function to get status colors
export const getStatusColor = (type, status) => {
  const config = statusConfig[type]?.[status];
  if (!config) return theme.colors.gray;
  
  return theme.colors[config.color];
};

// Helper function to get status classes
export const getStatusClasses = (type, status, variant = 'default') => {
  const colors = getStatusColor(type, status);
  const config = statusConfig[type]?.[status];
  
  if (!config) {
    return {
      bg: theme.colors.gray[100],
      text: theme.colors.gray[600],
      border: theme.colors.gray[200],
    };
  }
  
  const colorKey = config.color;
  const colors = theme.colors[colorKey];
  
  if (variant === 'pill') {
    return {
      bg: colors[500],
      text: 'white',
      border: colors[500],
    };
  }
  
  return {
    bg: colors[100],
    text: colors[600],
    border: colors[200],
  };
}; 