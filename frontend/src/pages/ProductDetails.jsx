import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Star, Clock, ShieldCheck, Truck, ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';



const ProductDetails = () => {

  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

const images =
  product?.images && product.images.length > 0
    ? product.images
    : [product?.image];
  
  const selectedSizeData = product?.sizeStock?.find(s => s.size === selectedSize);
  const maxStock = selectedSizeData ? selectedSizeData.stock : 0;
  
  const { addToCart } = useCart();

  

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        const availableSize = data.sizeStock?.find(s => s.stock > 0);
        if (availableSize) setSelectedSize(availableSize.size);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 🔌 Real-time Socket Listener for current product
  const socket = useSocket();
  useEffect(() => {
    if (!socket || !id) return;

    socket.on('product:updated', (updatedProduct) => {
      if (updatedProduct._id === id) {
        setProduct(updatedProduct);
        toast.success("Product details updated live!", { icon: '✨' });
      }
    });

    socket.on('product:deleted', (deletedId) => {
      if (deletedId === id) {
        toast.error("This product is no longer available.");
        setProduct(null);
      }
    });

    return () => {
      socket.off('product:updated');
      socket.off('product:deleted');
    };
  }, [socket, id]);

  useEffect(() => {
    if (qty > maxStock && maxStock > 0) {
      setQty(maxStock);
    }
  }, [selectedSize, maxStock, qty]);

  const handleAddToCart = () => {
    if (product.sizeStock?.length > 0 && !selectedSize) {
      alert("Please select size");
      return;
    }

    if (maxStock === 0) {
      alert("Selected size is out of stock");
      return;
    }

    for (let i = 0; i < qty; i++) {
      addToCart(product, selectedSize);
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

  <div className="aspect-[4/5] max-w-md mx-auto rounded-[40px] bg-gray-50 overflow-hidden shadow-2xl relative border border-gray-100">

    {/* MAIN IMAGE */}
    <img
      src={images[currentIndex]}
      alt={product.name}
      className="w-full h-full object-contain transition-all duration-500"
    />

    {/* CATEGORY BADGE */}
    <div className="absolute top-8 left-8">
      <span className="bg-white/80 backdrop-blur-md text-pink-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
        {product.category}
      </span>
    </div>

    {/* LEFT BUTTON */}
    {images.length > 1 && (
      <button
        onClick={() =>
          setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          )
        }
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow hover:bg-pink-600 hover:text-white transition"
      >
        ‹
      </button>
    )}

    {/* RIGHT BUTTON */}
    {images.length > 1 && (
      <button
        onClick={() =>
          setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
          )
        }
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow hover:bg-pink-600 hover:text-white transition"
      >
        ›
      </button>
    )}

    {/* DOT INDICATORS */}
    {images.length > 1 && (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer ${
              currentIndex === index ? "bg-pink-600 scale-110" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    )}

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

              {product?.sizeStock && product.sizeStock.length > 0 && (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
        Select Size
      </label>
      {selectedSizeData && (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${maxStock > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
          {maxStock > 0 ? `${maxStock} Available` : 'Sold Out'}
        </span>
      )}
    </div>

    <div className="flex gap-3 flex-wrap">
      {product.sizeStock.map((item) => (
        <button
          key={item.size}
          onClick={() => item.stock > 0 && setSelectedSize(item.size)}
          disabled={item.stock === 0}
          className={`w-14 h-14 rounded-2xl border-2 text-sm font-black transition-all flex items-center justify-center relative
            ${
              selectedSize === item.size
                ? "bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-100 scale-105"
                : item.stock > 0
                ? "bg-white text-gray-900 border-gray-100 hover:border-pink-400"
                : "bg-gray-50 text-gray-300 border-gray-50 cursor-not-allowed opacity-50 overflow-hidden"
            }`}
        >
          {item.size}
          {item.stock === 0 && <span className="absolute w-full h-[1px] bg-gray-300 rotate-45" />}
        </button>
      ))}
    </div>
  </div>
)}
              {/* Quantity */}
              <div className="mb-10">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Quantity</label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-gray-50 rounded-3xl p-2 border border-gray-100 shadow-inner">
                    <button 
                      onClick={() => qty > 1 && setQty(qty - 1)}
                      disabled={qty <= 1}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 transition-all active:scale-90
                      ${qty <= 1 ? "opacity-30 cursor-not-allowed" : "hover:text-pink-600 hover:border-pink-100 font-bold"}`}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-16 text-center font-black text-2xl text-gray-900">{qty}</span>
                    <button 
                      onClick={() => qty < maxStock && setQty(qty + 1)}
                      disabled={qty >= maxStock || maxStock === 0}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 transition-all active:scale-90
                      ${(qty >= maxStock || maxStock === 0) ? "opacity-30 cursor-not-allowed" : "hover:text-pink-600 hover:border-pink-100 font-bold"}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</span>
                    <span className={`text-sm font-black mt-1 ${maxStock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {maxStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={handleAddToCart}
                  disabled={maxStock === 0 || !selectedSize}
                  className="flex-grow bg-gray-900 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-[0.98] shadow-2xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                >
                  <ShoppingCart size={20} strokeWidth={2.5} />
                  Add to Bag
                </button>
                <button 
                  className="flex-grow bg-pink-600 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-pink-700 transition-all active:scale-[0.98] shadow-2xl shadow-pink-200 uppercase tracking-widest text-xs"
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
