import React from 'react';
import { Sparkles, ShoppingBag, Heart, Star } from 'lucide-react';

interface LandingPageProps {
  onLogoClick: () => void;
  onSignInClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogoClick, onSignInClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-100/40 rounded-full blur-3xl"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo with animation */}
          <div 
            className="cursor-pointer mb-8 inline-block transform transition-all duration-500 hover:scale-110 hover:rotate-3"
            onClick={onLogoClick}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-brand-200/50 rounded-full blur-xl animate-pulse"></div>
              <img 
                src="/logo.jpg" 
                alt="Kurti Times Logo" 
                className="h-32 md:h-40 w-auto mx-auto relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-900 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-brand-700 to-brand-900 bg-clip-text text-transparent">
              Kurti Times
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto mb-6 font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Discover elegant ethnic wear crafted for the modern woman
          </p>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center gap-2 text-gray-700 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <ShoppingBag className="h-4 w-4 text-brand-700" />
              <span className="text-sm font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Heart className="h-4 w-4 text-brand-700" />
              <span className="text-sm font-medium">Handpicked Designs</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Star className="h-4 w-4 text-brand-700" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onSignInClick}
            className="group relative bg-gradient-to-r from-brand-700 to-brand-800 text-white px-10 py-4 rounded-full font-bold text-lg md:text-xl hover:from-brand-800 hover:to-brand-900 transition-all shadow-2xl hover:shadow-brand-900/50 transform hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Sign In / Sign Up
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

