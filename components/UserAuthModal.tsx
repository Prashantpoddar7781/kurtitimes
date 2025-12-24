import React, { useState } from 'react';
import { X, User, Lock } from 'lucide-react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a message
    alert(isSignUp ? 'Sign up functionality coming soon!' : 'Sign in functionality coming soon!');
    onClose();
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
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                placeholder="Enter email or phone"
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Enter phone number"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                placeholder="Enter password"
              />
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

