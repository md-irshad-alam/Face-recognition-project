export const theme = {
  colors: {
    primary: '#4F46E5',
    primaryLight: '#E0E7FF',
    primaryHover: '#4338CA',
    background: '#F8FAFC',
    white: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    successBg: '#D1FAE5',
    successText: '#065F46',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    dangerText: '#991B1B',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    warningText: '#92400E',
    sidebarBg: '#F8FAFC',
    activeTabBg: '#EEF2FF',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  fonts: {
    sans: "'Inter', sans-serif",
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  }
};

export type ThemeType = typeof theme;
