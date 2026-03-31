import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Truck } from 'lucide-react';
import { getAllProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setFeaturedProducts(data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Men', image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800', path: '/products?category=Men' },
    { name: 'Women', image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=80&w=800', path: '/products?category=Women' },
    { name: 'Kids', image: 'https://images.unsplash.com/photo-1519704943920-18447d21755b?auto=format&fit=crop&q=80&w=800', path: '/products?category=Kids' },
  ];

  const features = [
    { icon: <Zap size={24} />, title: 'Fast Delivery', desc: 'Get your orders in 2-3 days' },
    { icon: <ShieldCheck size={24} />, title: 'Secure Payment', desc: 'WhatsApp verified orders' },
    { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders over ₹999' },
  ];

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl px-6 py-12 md:px-0">
            <span className="text-pink-500 font-bold uppercase tracking-widest text-sm mb-4 block">New Collection 2026</span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              Style That <br /> 
              <span className="text-pink-600">Defines You</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-lg leading-relaxed">
              Explore our curated selection of premium clothing designed for comfort and elegance. Elevate your wardrobe today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products"
                className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition-all flex items-center gap-2 group shadow-lg shadow-pink-900/20 active:scale-95"
              >
                Shop Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/products?featured=true"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-xl flex items-center gap-6 border border-pink-50 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{f.title}</h4>
                <p className="text-gray-500 text-sm mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Shop by Categories</h2>
          <div className="w-20 h-1.5 bg-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={cat.path}
              className="group relative h-[450px] overflow-hidden rounded-3xl shadow-lg"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                <h3 className="text-3xl font-bold text-white mb-2">{cat.name}</h3>
                <span className="text-pink-400 font-bold group-hover:text-pink-300 transition-colors flex items-center gap-2">
                  Browse Collection <ArrowRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-pink-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Featured Arrivals</h2>
              <p className="text-gray-500 mt-2">Check out our latest and most popular items</p>
            </div>
            <Link to="/products" className="text-pink-600 font-bold hover:text-pink-700 flex items-center gap-2 transition-colors">
              View All <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-[400px] border border-gray-100"></div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Home;
