import React, { useState } from 'react';
import { X, Phone, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (phone: string) => void;
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose, onAuth }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      const users = JSON.parse(localStorage.getItem('kurtitimes_users') || '[]');
      
      if (isSignUp) {
        // Sign Up: Check if user already exists
        const userExists = users.find((u: any) => u.phone === phone);
        if (userExists) {
          alert('This mobile number is already registered. Please sign in instead.');
          setIsSignUp(false);
          return;
        }
        if (!name.trim()) {
          alert('Please enter your name to sign up.');
          return;
        }
        // Register new user
        users.push({ phone, name: name.trim(), createdAt: new Date().toISOString() });
        localStorage.setItem('kurtitimes_users', JSON.stringify(users));
        onAuth(phone);
        setPhone('');
        setName('');
        onClose();
      } else {
        // Sign In: Check if user exists
        const userExists = users.find((u: any) => u.phone === phone);
        if (!userExists) {
          alert('This mobile number is not registered. Please sign up first.');
          setIsSignUp(true);
          return;
        }
        // Sign in existing user
        onAuth(phone);
        setPhone('');
        setName('');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gradient-to-br from-brand-900/80 via-brand-800/80 to-brand-900/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  {isSignUp ? (
                    <UserPlus className="h-6 w-6 text-white" />
                  ) : (
                    <LogIn className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-sm text-white/90">
                    {isSignUp ? 'Join Kurti Times' : 'Sign in to continue'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsSignUp(false);
                setName('');
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                !isSignUp
                  ? 'text-brand-700 border-b-2 border-brand-700 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </div>
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                isSignUp
                  ? 'text-brand-700 border-b-2 border-brand-700 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </div>
            </button>
          </div>
          
          <div className="bg-white px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-base"
                      placeholder="Enter your full name"
                      required={isSignUp}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    This helps us personalize your experience
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(value);
                    }}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-base"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  {isSignUp 
                    ? 'We\'ll send you order updates via SMS'
                    : 'Enter your registered mobile number'}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={phone.length !== 10 || (isSignUp && !name.trim())}
                className="w-full bg-gradient-to-r from-brand-700 to-brand-800 text-white py-3.5 px-4 rounded-lg hover:from-brand-800 hover:to-brand-900 transition-all font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              >
                {isSignUp ? (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>

              {isSignUp && (
                <p className="text-xs text-center text-gray-500 pt-2">
                  By signing up, you agree to our Terms & Conditions
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuthModal;

