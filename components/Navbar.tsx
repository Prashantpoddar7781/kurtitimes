import React from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button 
              className="p-2 -ml-2 mr-2 md:hidden text-brand-900" 
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div 
              className="flex-shrink-0 flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              {/* Logo Image */}
              <img 
                src="/logo.jpg" 
                alt="Kurti Times Logo" 
                className="h-16 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
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
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onCartClick}
              className="relative p-2 text-brand-900 hover:text-brand-700 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-brand-100 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  toggleMobileMenu();
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activePage === item.id 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
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