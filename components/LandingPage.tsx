import React from 'react';
import { Category } from '../types';

interface LandingPageProps {
  onLogoClick: () => void;
  onSignInClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogoClick, onSignInClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div 
          className="cursor-pointer mb-8 inline-block transform transition-transform hover:scale-105"
          onClick={onLogoClick}
        >
          <img 
            src="/logo.jpg" 
            alt="Kurti Times Logo" 
            className="h-32 w-auto mx-auto"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-900 mb-4">
          Welcome to Kurti Times
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Discover elegant ethnic wear crafted for the modern woman
        </p>
        <button
          onClick={onSignInClick}
          className="bg-brand-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-800 transition-colors shadow-lg hover:shadow-xl"
        >
          Sign In / Sign Up
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

