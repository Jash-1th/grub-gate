import React from 'react';
import AuthGuard from './AuthGuard';

/**
 * Higher-order component that wraps a component with authentication protection
 * @param {React.Component} WrappedComponent - The component to protect
 * @param {Object} options - Protection options
 * @param {boolean} options.requireAuth - Whether authentication is required (default: true)
 * @param {string} options.redirectTo - Where to redirect if not authenticated (default: '/login')
 * @param {boolean} options.showModal - Whether to show login modal instead of redirecting (default: false)
 */
const withAuthGuard = (WrappedComponent, options = {}) => {
  const {
    requireAuth = true,
    redirectTo = '/login',
    showModal = false
  } = options;

  const ProtectedComponent = (props) => {
    return (
      <AuthGuard 
        requireAuth={requireAuth}
        redirectTo={redirectTo}
        showModal={showModal}
      >
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };

  // Set display name for debugging
  ProtectedComponent.displayName = `withAuthGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
};

/**
 * Simple ProtectedRoute component for direct use in routing
 */
const ProtectedRoute = ({ children, ...authGuardProps }) => {
  return (
    <AuthGuard {...authGuardProps}>
      {children}
    </AuthGuard>
  );
};

export default ProtectedRoute;
export { withAuthGuard };
