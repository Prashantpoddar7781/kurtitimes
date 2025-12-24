import React, { useState } from 'react';
import AdminLoginModal from './AdminLoginModal';
import UserAuthModal from './UserAuthModal';

interface LandingPageProps {
  onAuthenticated: () => void;
  onAdminLogin: (userId: string, password: string) => boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthenticated, onAdminLogin }) => {
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setIsAdminLoginOpen(true);
        return 0; // Reset count after opening modal
      }
      return newCount;
    });
    // Reset counter after 3 seconds
    setTimeout(() => setLogoClickCount(0), 3000);
  };

  const handleAdminLogin = (userId: string, password: string): boolean => {
    const success = onAdminLogin(userId, password);
    if (success) {
      setIsAdminLoginOpen(false);
      // Admin can access the app directly
      onAuthenticated();
    }
    return success;
  };

  const handleUserAuthenticated = () => {
    setIsUserAuthOpen(false);
    onAuthenticated();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer transform transition-transform hover:scale-105"
            onClick={handleLogoClick}
          >
            <img 
              src="/logo.jpg" 
              alt="Kurti Times Logo" 
              className="h-24 w-auto md:h-32"
            />
          </div>
          
          {/* Sign In / Sign Up Button */}
          <button
            onClick={() => setIsUserAuthOpen(true)}
            className="px-8 py-3 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign In / Sign Up
          </button>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Welcome to Kurti Times
          </h1>
          <p className="text-gray-600">
            Discover elegant kurti sets and traditional wear
          </p>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />

      {/* User Auth Modal */}
      <UserAuthModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onAuthenticated={handleUserAuthenticated}
      />
    </div>
  );
};

export default LandingPage;

