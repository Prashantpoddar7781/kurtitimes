import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import InfoModal from './components/InfoModal';
import { PRODUCTS } from './constants';
import { Product, CartItem, Category } from './types';
import { Phone, Mail, MapPin, Send, Star, MessageCircle, ArrowUpNarrowWide, SlidersHorizontal, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);

  // Randomly select 3 best sellers for the Best Sellers page
  const bestSellers = useMemo(() => {
    return [...PRODUCTS].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, []);

  // Category Configuration for Landing Page
  const categoryTiles = [
    { 
      id: Category.KURTI_SET, 
      name: 'Kurti Sets', 
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      tagline: 'Timeless Traditions'
    },
    { 
      id: Category.INDO_WESTERN, 
      name: 'Indo Western', 
      image: 'https://images.unsplash.com/photo-1594235372134-9093072f63e6?q=80&w=800&auto=format&fit=crop',
      tagline: 'Modern Fusion'
    },
    { 
      id: Category.COORD_SETS, 
      name: 'Co-ord Sets', 
      image: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?q=80&w=800&auto=format&fit=crop',
      tagline: 'Chic & Matching'
    },
    { 
      id: Category.TUNICS, 
      name: 'Tunics', 
      image: 'https://images.unsplash.com/photo-1583391725988-6490d0f799cd?q=80&w=800&auto=format&fit=crop',
      tagline: 'Everyday Comfort'
    },
  ];

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

  const handleNavigation = (page: string) => {
    setCurrentView(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderInfoContent = () => {
    switch (activeInfoPage) {
      case 'about':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
             <p className="text-base font-medium text-brand-800">Welcome to Kurti Times.</p>
             <p>Our designs are curated to empower the modern woman who loves to stay rooted in her culture while embracing contemporary trends.</p>
          </div>
        );
      case 'shipping':
        return (
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
             <ul className="list-disc pl-5 space-y-2 marker:text-brand-500">
                 <li>Free shipping on orders above ₹999.</li>
                 <li>Standard delivery: 5-7 business days.</li>
             </ul>
          </div>
        );
      case 'returns':
        return (
           <div className="space-y-4 text-sm leading-relaxed text-gray-700">
             <p>7-day hassle-free return policy from the date of delivery.</p>
          </div>
        );
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

  const renderContent = () => {
    // Handle dynamic category views
    const selectedCategory = Object.values(Category).find(cat => cat === currentView);

    if (selectedCategory && selectedCategory !== Category.ALL) {
      const filteredProducts = PRODUCTS.filter(p => p.category === selectedCategory);
      return (
        <div className="max-w-7xl mx-auto py-8 min-h-[70vh] animate-in fade-in duration-500">
          <div className="px-4 mb-8">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest mb-2">
              <button onClick={() => setCurrentView('home')} className="hover:text-brand-600">Home</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-brand-700 font-bold">{selectedCategory}</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-950">{selectedCategory}</h2>
            <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} items found</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-l border-gray-100">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'bestsellers':
        return (
          <div className="max-w-7xl mx-auto py-8 min-h-[60vh]">
            <div className="text-center px-4 mb-8">
               <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 text-gold-600 rounded-full text-[10px] font-bold mb-2">
                  <Star className="h-3 w-3 fill-current" />
                  <span>TRENDING NOW</span>
               </div>
               <h2 className="text-3xl font-serif font-bold text-brand-900">Best Sellers</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-t border-l border-gray-100">
               {bestSellers.map((product) => (
                 <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
               ))}
            </div>
          </div>
        );
        
      case 'contact':
        return (
          <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-serif font-bold text-brand-900">Contact Us</h2>
               <p className="text-gray-500 mt-2">We'd love to hear from you</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-50">
                  <h3 className="text-2xl font-serif font-bold text-brand-800 mb-8">Get in Touch</h3>
                  <div className="space-y-6">
                    <a href="tel:9892794421" className="flex items-center gap-5 group">
                      <div className="bg-brand-50 p-4 rounded-full text-brand-600 group-hover:bg-brand-100 transition-colors"><Phone className="h-6 w-6" /></div>
                      <div><p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Phone</p><p className="text-lg text-gray-900">+91 98927 94421</p></div>
                    </a>
                    <a href="mailto:kurtitimes@gmail.com" className="flex items-center gap-5 group">
                      <div className="bg-brand-50 p-4 rounded-full text-brand-600 group-hover:bg-brand-100 transition-colors"><Mail className="h-6 w-6" /></div>
                      <div><p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Email</p><p className="text-lg text-gray-900">kurtitimes@gmail.com</p></div>
                    </a>
                    <div className="flex items-center gap-5">
                      <div className="bg-brand-50 p-4 rounded-full text-brand-600"><MapPin className="h-6 w-6" /></div>
                      <div><p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Visit Us</p><p className="text-lg text-gray-900 leading-tight">Rajhans Imperia, Ring Road, Surat</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-50">
                <h3 className="text-2xl font-serif font-bold text-brand-800 mb-6 text-center">Send Message</h3>
                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  window.location.href = `mailto:kurtitimes@gmail.com?subject=Inquiry&body=${encodeURIComponent(formData.get('message') as string)}`;
                }}>
                  <input name="name" placeholder="Your Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all" required />
                  <textarea name="message" placeholder="How can we help?" rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all" required></textarea>
                  <button type="submit" className="w-full bg-brand-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-800 transition-all shadow-lg hover:shadow-brand-200">
                    <Send className="h-5 w-5" /> Send to Kurti Times
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
            <div className="relative bg-brand-950 text-white overflow-hidden h-[50vh] md:h-[60vh] flex items-center">
              <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" alt="Ethnic background" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent"></div>
              </div>
              <div className="relative w-full max-w-7xl mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-7xl font-serif font-bold mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                  Elevate Your Style
                </h1>
                <p className="text-base md:text-2xl text-brand-100 font-light mb-8 max-w-2xl mx-auto opacity-90">
                  Experience the perfect blend of tradition and modernity with Kurti Times.
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-brand-900 px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">Explore Collections</button>
                </div>
              </div>
            </div>

            {/* Aesthetic Category Grid */}
            <div id="categories" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
              <div className="text-center mb-16">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-[0.3em] mb-3 block">Discover Our World</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-950">Shop by Category</h2>
                <div className="w-20 h-1 bg-brand-700 mx-auto mt-6"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryTiles.map((cat, idx) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleNavigation(cat.id)}
                    className="group relative h-[450px] overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-left translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{cat.tagline}</p>
                      <h3 className="text-2xl font-serif font-bold text-white mb-2">{cat.name}</h3>
                      <div className="flex items-center gap-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        View Collection <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onNavigate={handleNavigation}
        activePage={currentView}
      />

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} onUpdateQuantity={updateQuantity} onRemoveItem={removeItem} />
      <InfoModal isOpen={!!activeInfoPage} onClose={() => setActiveInfoPage(null)} title={getModalTitle()}>{renderInfoContent()}</InfoModal>

      <div className="flex-grow">{renderContent()}</div>

      {/* Mobile Sticky Navigation (only on product pages) */}
      {Object.values(Category).includes(currentView as Category) && currentView !== Category.ALL && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 z-40 flex items-center divide-x divide-gray-200">
          <button className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase text-gray-700">
            <ArrowUpNarrowWide className="h-4 w-4" /> Sort
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase text-gray-700">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
        </div>
      )}

      <footer className="bg-brand-950 text-brand-100 py-16 pb-24 md:pb-16 border-t border-brand-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/logo.jpg" 
                alt="Kurti Times Logo" 
                className="h-8 w-auto"
              />
              <h3 className="text-2xl font-serif font-bold text-white">Kurti Times</h3>
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              Celebrating the elegance of Indian ethnic wear with a vision of contemporary grace. Quality, comfort, and heritage in every stitch.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Collections</h4>
            <ul className="space-y-4 text-sm opacity-70">
              {categoryTiles.map(cat => (
                <li key={cat.id}><button onClick={() => handleNavigation(cat.id)} className="hover:text-white transition-colors">{cat.name}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Customer Care</h4>
            <ul className="space-y-4 text-sm opacity-70">
              <li><button onClick={() => setActiveInfoPage('about')} className="hover:text-white">Our Story</button></li>
              <li><button onClick={() => setActiveInfoPage('shipping')} className="hover:text-white">Shipping Policy</button></li>
              <li><button onClick={() => setActiveInfoPage('returns')} className="hover:text-white">Returns & Exchanges</button></li>
              <li><button onClick={() => handleNavigation('contact')} className="hover:text-white">Help & Support</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-brand-900/50 text-center opacity-40 text-xs tracking-widest">
          &copy; {new Date().getFullYear()} KURTI TIMES. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default App;
