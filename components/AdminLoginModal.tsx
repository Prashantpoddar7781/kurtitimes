import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userId: string, password: string) => boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId || !password) {
      setError('Please enter both User ID and Password');
      return;
    }

    const success = onLogin(userId, password);
    if (success) {
      setUserId('');
      setPassword('');
      onClose();
    } else {
      setError('Invalid User ID or Password');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-brand-700" />
              <h2 className="text-xl font-serif font-bold text-gray-900">Admin Access</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminUserId" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                id="adminUserId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                placeholder="Enter User ID"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                placeholder="Enter Password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

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
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;

