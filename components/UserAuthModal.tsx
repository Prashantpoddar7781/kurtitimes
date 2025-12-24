import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose, onAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateMobileNumber = (mobile: string): boolean => {
    // Indian mobile number validation (10 digits, optionally starting with +91)
    const cleaned = mobile.replace(/\D/g, '');
    return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }

    if (!validateMobileNumber(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Store user in localStorage (simple implementation)
    const cleanedMobile = mobileNumber.replace(/\D/g, '');
    const userData = {
      mobileNumber: cleanedMobile,
      signedUpAt: new Date().toISOString(),
    };

    if (isSignUp) {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('kurtiTimesUsers') || '[]');
      const userExists = existingUsers.some((u: any) => u.mobileNumber === cleanedMobile);
      
      if (userExists) {
        setError('This mobile number is already registered. Please sign in instead.');
        return;
      }

      // Add new user
      existingUsers.push(userData);
      localStorage.setItem('kurtiTimesUsers', JSON.stringify(existingUsers));
      localStorage.setItem('kurtiTimesCurrentUser', JSON.stringify(userData));
    } else {
      // Sign in - check if user exists
      const existingUsers = JSON.parse(localStorage.getItem('kurtiTimesUsers') || '[]');
      const userExists = existingUsers.some((u: any) => u.mobileNumber === cleanedMobile);
      
      if (!userExists) {
        setError('Mobile number not found. Please sign up first.');
        return;
      }

      // Set current user
      localStorage.setItem('kurtiTimesCurrentUser', JSON.stringify(userData));
    }

    // Success - authenticate user
    onAuthenticated();
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-gray-900">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                !isSignUp ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                isSignUp ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    setError('');
                  }}
                  className={`w-full border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500`}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {isSignUp 
                  ? 'Enter your mobile number to create an account'
                  : 'Enter your registered mobile number to sign in'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand-700 text-white rounded-md hover:bg-brand-800 transition-colors"
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAuthModal;

