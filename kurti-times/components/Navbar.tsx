import React from 'react';
import { ShoppingBag, Menu, X, Search, Heart } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onCartClick, 
  isMobileMenuOpen, 
  toggleMobileMenu,
  onNavigate,
  activePage
}) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'bestsellers', label: 'Best Sellers' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <button 
              className="p-1 -ml-1 mr-1 md:hidden text-gray-700" 
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="relative flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-12 md:h-12">
                  <circle cx="50" cy="50" r="48" fill="#be185d" />
                  <path d="M35 30 V70" stroke="white" strokeWidth="10" strokeLinecap="round" />
                  <path d="M65 30 L35 50 L65 70" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col -space-y-1 md:-space-y-2">
                <span className="font-cursive text-xl md:text-3xl text-brand-800 tracking-wide pt-1">Kurti</span>
                <span className="font-cursive text-xl md:text-3xl text-brand-600 pl-2 md:pl-4">Times</span>
              </div>
            </div>
            
            <div className="hidden md:flex ml-10 space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-brand-600 ${
                    activePage === item.id ? 'text-brand-700 border-b-2 border-brand-700' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-1.5 text-gray-700 md:hidden"><Search className="h-5 w-5" /></button>
            <button className="hidden md:block p-1.5 text-gray-700"><Heart className="h-5 w-5" /></button>
            <button 
              onClick={onCartClick}
              className="relative p-1.5 text-gray-700 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  toggleMobileMenu();
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activePage === item.id ? 'bg-brand-50 text-brand-700' : 'text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;