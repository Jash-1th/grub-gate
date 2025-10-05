import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../context/ModalContext';

const AuthGuard = ({ children, redirectTo = '/login', showModal = true, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const { openLoginModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      // Check if there's a pending redirect or login in progress to avoid opening modal again
      const pendingRedirect = localStorage.getItem('pendingRedirect');
      const loginInProgress = localStorage.getItem('loginInProgress');
      
      // Also check if user has valid token in localStorage (might be a temporary state issue)
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (pendingRedirect || loginInProgress || (storedToken && storedUser)) {
        console.log('🔐 AuthGuard: Pending redirect, login in progress, or valid token found - not opening login modal');
        return;
      }

      // Store current URL for redirect after login
      const currentUrl = location.pathname + location.search;
      console.log('🔐 AuthGuard: User not authenticated, storing URL for redirect:', currentUrl);
      
      // Only store meaningful URLs (not just root path)
      if (currentUrl && currentUrl !== '/' && currentUrl !== '/login') {
        localStorage.setItem('redirectAfterLogin', currentUrl);
        console.log('🔐 AuthGuard: Stored redirect URL:', currentUrl);
      } else {
        console.log('🔐 AuthGuard: Not storing redirect URL (root or login page)');
      }
      
      if (showModal) {
        // Show login modal instead of redirecting
        console.log('🔐 AuthGuard: Opening login modal');
        openLoginModal();
      } else {
        // Redirect to login page
        console.log('🔐 AuthGuard: Redirecting to login page');
        navigate(redirectTo, { 
          replace: true,
          state: { from: currentUrl }
        });
      }
    }
  }, [isAuthenticated, loading, requireAuth, navigate, redirectTo, showModal, openLoginModal, location]);

  // Show loading spinner while checking authentication or handling redirect
  const pendingRedirect = localStorage.getItem('pendingRedirect');
  const loginInProgress = localStorage.getItem('loginInProgress');
  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('user');
  
  // Show loading if we're still loading, have pending operations, or have stored auth but not yet authenticated
  if (loading || pendingRedirect || loginInProgress || (!isAuthenticated && storedToken && storedUser)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto mb-4"></div>
          <p className="text-gray-600">
            {pendingRedirect ? 'Redirecting...' : 
             loginInProgress ? 'Completing login...' : 
             (!isAuthenticated && storedToken) ? 'Restoring session...' :
             'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, show login prompt
  if (requireAuth && !isAuthenticated) {
    if (showModal) {
      // Show a simple waiting message while login modal is open
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to access this page.
            </p>
            <button
              onClick={() => openLoginModal()}
              className="bg-grub-red text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
            >
              Open Login
            </button>
          </div>
        </div>
      );
    } else {
      // Show full authentication required page
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-grub-red mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this page. Please sign in to continue with your meal planning.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => openLoginModal()}
                className="w-full bg-grub-red text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated or authentication is not required, render children
  return children;
};

export default AuthGuard;
