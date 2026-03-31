import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Star, Clock, ShieldCheck, Truck, ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';



const ProductDetails = () => {

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    
if (product.sizes?.length > 0 && !selectedSize) {
  alert("Please select size");
  return;
}

const finalQty = Math.min(qty, product.stock);

for (let i = 0; i < finalQty; i++) {
  addToCart({
    ...product,
    selectedSize,
  });
}
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white animate-pulse">
      <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <ArrowRight size={40} className="rotate-180" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4">Product Not Found</h2>
      <Link to="/products" className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition-all shadow-lg active:scale-95">
        Back to Products
      </Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-4 text-sm font-bold text-gray-400 mb-12">
          <Link to="/" className="hover:text-pink-600 transition-colors">Home</Link>
          <ChevronLeft size={16} className="rotate-180 opacity-30" />
          <Link to="/products" className="hover:text-pink-600 transition-colors capitalize">{product.category}</Link>
          <ChevronLeft size={16} className="rotate-180 opacity-30" />
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="aspect-[4/5] rounded-[40px] bg-gray-50 overflow-hidden shadow-2xl relative border border-gray-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-8 left-8">
                <span className="bg-white/80 backdrop-blur-md text-pink-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col h-full">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-yellow-400">
                </div>
              </div>
              
              <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-black text-pink-600 tracking-tighter">₹{product.price}</span>
                
              </div>

              <div className="h-px bg-gray-100 w-full mb-8"></div>

              {/* 🔥 SIZE SELECTION */}
{product?.sizes && product.sizes.length > 0 && (
  <div className="mb-10">
    <label className="block text-sm font-semibold text-gray-900 mb-4">
      Select Size
    </label>

    <div className="flex gap-3 flex-wrap">
      {product.sizes.map((size) => (
        <button
          key={size}
          onClick={() => setSelectedSize(size)}
          className={`px-5 py-2 rounded-xl border text-sm font-medium transition-all
            ${
              selectedSize === size
                ? "bg-pink-600 text-white border-pink-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-pink-400"
            }`}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
)}
              {/* Quantity */}
              <div className="mb-10">
                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Select Quantity</label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-2 border border-gray-200">
                    <button 
                      onClick={() => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  }}
  disabled={qty <= 1}
  className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white 
  text-gray-900 shadow-sm transition-all 
  ${qty <= 1 ? "opacity-40 cursor-not-allowed" : "hover:text-pink-600"}`}
>
  <Minus size={20} />
                    </button>
                    <span className="w-16 text-center font-black text-xl text-gray-900">{qty}</span>
                    <button 
                      onClick={() => {
    if (qty < product.stock) {
      setQty(qty + 1);
    }
  }}
  disabled={qty >= product.stock}
  className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white 
  text-gray-900 shadow-sm transition-all 
  ${qty >= product.stock ? "opacity-40 cursor-not-allowed" : "hover:text-pink-600"}`}
>
  <Plus size={20} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-500">
                    {product.stock} items left in stock
                  </span>
                </div>
              </div>

              {qty === product.stock && (
  <p className="text-xs text-red-500 font-medium mt-2">
    Maximum stock reached
  </p>
)}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-grow bg-gray-900 text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  <ShoppingCart size={22} strokeWidth={2.5} />
                  Add to Cart
                </button>
                <button 
                  className="flex-grow bg-pink-600 text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-3 hover:bg-pink-700 transition-all active:scale-95 shadow-xl shadow-pink-200 uppercase tracking-widest"
                >
                  Buy it Now
                </button>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                
                
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm group-hover:rotate-12 transition-transform">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">Secure Orders</h4>
                    <p className="text-xs text-gray-500 font-bold">WhatsApp verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-auto">
              <div className="flex gap-10 border-b border-gray-100 mb-8 overflow-x-auto scrollbar-none">
                {['description'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab ? 'text-pink-600' : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600 rounded-t-full"></div>}
                  </button>
                ))}
              </div>
              
              <div className="text-gray-600 leading-relaxed font-medium">
                {activeTab === 'description' && (
                  <p className="animate-in fade-in slide-in-from-bottom-2 duration-500">{product.description}</p>
                )}
                
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
