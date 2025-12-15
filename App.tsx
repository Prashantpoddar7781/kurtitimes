import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import InfoModal from './components/InfoModal';
import { PRODUCTS } from './constants';
import { Product, CartItem, Category } from './types';
import { Filter, Phone, Mail, Tag, ChevronDown, MapPin, Send, Star, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  
  const priceFilters = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹1500', min: 1000, max: 1500 },
    { label: '₹1500 - ₹2000', min: 1500, max: 2000 },
    { label: '₹2000 - ₹2500', min: 2000, max: 2500 },
    { label: '₹2500 - ₹3000', min: 2500, max: 3000 },
    { label: '₹3000+', min: 3000, max: Infinity },
  ];

  const [selectedPriceFilter, setSelectedPriceFilter] = useState(priceFilters[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);

  // Randomly select 3 best sellers once
  const bestSellers = useMemo(() => {
    return [...PRODUCTS].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, []);

  // Filter products based on selected category and price
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS;

    if (selectedCategory !== Category.ALL) {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (selectedPriceFilter.min !== 0 || selectedPriceFilter.max !== Infinity) {
      result = result.filter(product => 
        product.price >= selectedPriceFilter.min && 
        product.price <= selectedPriceFilter.max
      );
    }

    return result;
  }, [selectedCategory, selectedPriceFilter]);

  // Cart actions
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to render content for the InfoModal
  const renderInfoContent = () => {
    switch (activeInfoPage) {
      case 'about':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
             <p className="text-base font-medium text-brand-800">Welcome to Kurti Times, where tradition meets modernity.</p>
             <p>Founded with a passion for Indian ethnic wear, we aim to bring you the finest collection of Kurtis, Indo-western fusion wear, and Co-ord sets. Our designs are curated to empower the modern woman who loves to stay rooted in her culture while embracing contemporary fashion trends.</p>
             <p>Each piece is crafted with love, using high-quality fabrics that ensure comfort without compromising on style. From casual day-outs to festive celebrations, Kurti Times has something special for every occasion.</p>
          </div>
        );
      case 'shipping':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
             <p>We are committed to delivering your order accurately, in good condition, and always on time.</p>
             <ul className="list-disc pl-5 space-y-2 marker:text-brand-500">
                 <li>We offer <strong>free shipping</strong> on all orders above ₹999.</li>
                 <li>Most orders are dispatched within 24-48 hours.</li>
                 <li>Standard delivery time is 3-5 business days for metro cities and 5-7 business days for other locations.</li>
                 <li>You will receive a tracking link via email and SMS once your order is shipped.</li>
             </ul>
          </div>
        );
      case 'returns':
        return (
           <div className="space-y-4 text-sm leading-relaxed text-gray-700">
             <p>We want you to love what you wear. If you are not completely satisfied with your purchase, we are here to help.</p>
             <ul className="list-disc pl-5 space-y-2 marker:text-brand-500">
                 <li>We offer a <strong>7-day hassle-free return policy</strong> from the date of delivery.</li>
                 <li>Items must be unused, unwashed, and with original tags intact.</li>
                 <li>To initiate a return, please contact our support team.</li>
                 <li>Refunds are processed within 5-7 business days after the product is received at our warehouse.</li>
             </ul>
          </div>
        );
      // Removed 'contact' case here as it is now a full page, 
      // but keeping fallback just in case or for other modals
      default: return null;
    }
  };

  const getModalTitle = () => {
    switch (activeInfoPage) {
      case 'about': return 'About Us';
      case 'shipping': return 'Shipping Policy';
      case 'returns': return 'Returns & Exchanges';
      default: return '';
    }
  };

  const handleNavigation = (page: string) => {
    setCurrentView(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'bestsellers':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 text-gold-600 rounded-full text-sm font-bold mb-4">
                  <Star className="h-4 w-4 fill-current" />
                  <span>TRENDING NOW</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-900 mb-4">Best Sellers</h2>
               <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
                 Our most loved styles, chosen by you. These trending pieces are flying off the shelves!
               </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
               {bestSellers.map((product, idx) => (
                 <div key={product.id} className="w-full max-w-sm" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="relative mb-4">
                      {/* Bestseller Badge */}
                      <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform -rotate-2">
                        <Star className="h-3 w-3 fill-white" /> BESTSELLER
                      </div>
                    </div>
                    <ProductCard product={product} onAddToCart={addToCart} />
                 </div>
               ))}
            </div>
          </div>
        );
        
      case 'contact':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-900 mb-6">Get in Touch</h2>
               <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                 We'd love to hear from you. Whether you have a question about our collections, pricing, or shipping, our team is ready to answer all your questions.
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact Info */}
              <div className="space-y-8">
                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-50 hover:shadow-md transition-shadow">
                    <h3 className="text-2xl font-serif font-bold text-brand-800 mb-8">Contact Information</h3>
                    
                    <div className="space-y-6">
                      {/* Phone Link */}
                      <a href="tel:9892794421" className="flex items-start gap-5 group hover:bg-gray-50 p-4 -mx-4 rounded-xl transition-colors">
                        <div className="bg-brand-50 p-4 rounded-full text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                          <Phone className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-400 uppercase tracking-wide mb-1">Phone</p>
                          <p className="text-xl text-gray-900 font-serif group-hover:text-brand-700 transition-colors">+91 98927 94421</p>
                          <p className="text-sm text-gray-500 mt-1">Mon-Sat 10am - 7pm</p>
                        </div>
                      </a>

                      {/* WhatsApp Link */}
                      <a href="https://wa.me/919892794421" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group hover:bg-gray-50 p-4 -mx-4 rounded-xl transition-colors">
                        <div className="bg-green-50 p-4 rounded-full text-[#25D366] shrink-0 group-hover:bg-green-100 transition-colors">
                          <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-400 uppercase tracking-wide mb-1">WhatsApp</p>
                          <p className="text-xl text-gray-900 font-serif group-hover:text-[#25D366] transition-colors">+91 98927 94421</p>
                          <p className="text-sm text-gray-500 mt-1">Chat with us directly</p>
                        </div>
                      </a>

                      {/* Email Link */}
                      <a href="mailto:kurtitimes@gmail.com" className="flex items-start gap-5 group hover:bg-gray-50 p-4 -mx-4 rounded-xl transition-colors">
                        <div className="bg-brand-50 p-4 rounded-full text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-400 uppercase tracking-wide mb-1">Email</p>
                          <p className="text-xl text-gray-900 font-serif group-hover:text-brand-700 transition-colors">kurtitimes@gmail.com</p>
                        </div>
                      </a>

                      {/* Address */}
                      <div className="flex items-start gap-5 p-4 -mx-4">
                        <div className="bg-brand-50 p-4 rounded-full text-brand-600 shrink-0">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-400 uppercase tracking-wide mb-1">Office</p>
                          <p className="text-xl text-gray-900 font-serif">G-11-12, RAJHANS IMPERIA</p>
                          <p className="text-gray-600 mt-1">RING ROAD, SURAT</p>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Message Form */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-serif font-bold text-brand-800 mb-6">Send us a Message</h3>
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const firstName = formData.get('firstName');
                  const lastName = formData.get('lastName');
                  const email = formData.get('email');
                  const message = formData.get('message');
                  
                  const subject = `Inquiry from ${firstName} ${lastName} - Kurti Times`;
                  const body = `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`;
                  
                  window.location.href = `mailto:kurtitimes@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input name="firstName" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input name="lastName" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-colors" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input name="email" type="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea name="message" rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-colors" required></textarea>
                  </div>
                  <button type="submit" className="w-full bg-brand-700 text-white font-bold py-4 rounded-xl hover:bg-brand-800 transition-all hover:shadow-lg flex items-center justify-center gap-2 group">
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" /> Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'home':
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="relative bg-brand-900 text-white overflow-hidden animate-in fade-in duration-700">
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1583391725988-6490d0f799cd?q=80&w=2070&auto=format&fit=crop" 
                  alt="Hero background" 
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
                  Elegance in Every Thread
                </h1>
                <p className="text-lg md:text-xl text-brand-100 max-w-2xl mb-8 font-light">
                  Discover our exclusive collection of Kurti sets, Indo-western fusion, and chic Co-ord sets designed for the modern woman.
                </p>
                <button 
                  onClick={() => {
                    const el = document.getElementById('shop-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white text-brand-900 px-8 py-3 rounded-full font-bold hover:bg-brand-50 transition-colors shadow-lg"
                >
                  Shop Collection
                </button>
              </div>
            </div>

            <main id="shop-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Filters Section */}
              <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-brand-50">
                <div className="flex items-center gap-2 mb-6 text-brand-900 border-b border-brand-100 pb-2">
                  <Filter className="h-5 w-5" />
                  <h2 className="text-lg font-bold font-serif">Refine Collection</h2>
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(Category).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-sm transition-all duration-200 
                            ${selectedCategory === cat 
                              ? 'bg-brand-700 text-white shadow-md font-medium' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter (Dropdown) */}
                  <div className="w-full sm:w-72">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Price Range
                    </h3>
                    <div className="relative">
                      <select
                        value={selectedPriceFilter.label}
                        onChange={(e) => {
                          const selected = priceFilters.find(p => p.label === e.target.value);
                          if (selected) setSelectedPriceFilter(selected);
                        }}
                        className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all cursor-pointer hover:border-brand-300"
                      >
                        {priceFilters.map((range) => (
                          <option key={range.label} value={range.label}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-700">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={addToCart}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <Filter className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your category or price filters.</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory(Category.ALL);
                      setSelectedPriceFilter(priceFilters[0]);
                    }}
                    className="mt-4 text-brand-600 font-medium hover:text-brand-800"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </main>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-brand-50/30 flex flex-col">
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onNavigate={handleNavigation}
        activePage={currentView}
      />

      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      <InfoModal
        isOpen={!!activeInfoPage}
        onClose={() => setActiveInfoPage(null)}
        title={getModalTitle()}
      >
        {renderInfoContent()}
      </InfoModal>

      {/* Main Content Area */}
      <div className="flex-grow">
        {renderContent()}
      </div>

      {/* Footer */}
      <footer className="bg-brand-950 text-brand-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20">
            <div>
              <h3 className="text-2xl font-serif font-bold text-white mb-4">Kurti Times</h3>
              <p className="text-sm opacity-80 leading-relaxed max-w-sm">
                Celebrating the essence of Indian ethnic fashion with a modern twist. 
                Quality fabrics, contemporary designs, and timeless elegance.
              </p>
            </div>
            <div className="md:justify-self-end">
              <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setActiveInfoPage('about')} className="hover:text-white transition-colors text-left">About Us</button></li>
                <li><button onClick={() => setActiveInfoPage('shipping')} className="hover:text-white transition-colors text-left">Shipping Policy</button></li>
                <li><button onClick={() => setActiveInfoPage('returns')} className="hover:text-white transition-colors text-left">Returns & Exchanges</button></li>
                <li><button onClick={() => handleNavigation('contact')} className="hover:text-white transition-colors text-left">Contact Support</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-brand-800 mt-12 pt-8 text-center text-sm opacity-60">
            &copy; {new Date().getFullYear()} Kurti Times. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;