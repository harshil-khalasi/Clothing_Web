import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Star, Clock, ShieldCheck, Truck, ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';



import { getImageUrl, handleImageError } from '../utils/imageUtils';

const ProductDetails = () => {

  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const rawImages =
    product?.images && product.images.length > 0
      ? product.images
      : [product?.image];

  const images = rawImages.map(img => getImageUrl(img));
  
  const selectedSizeData = product?.sizeStock?.find(s => s.size === selectedSize);
  const maxStock = selectedSizeData ? selectedSizeData.stock : 0;
  
  const { addToCart } = useCart();

  

  useEffect(() => {
    window.scrollTo(0, 0);
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
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 font-sans">
      <div className="w-24 h-24 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-200">
        <ArrowRight size={40} className="rotate-180" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4">Product Not Found</h2>
      <Link to="/products" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">
        Back to Products
      </Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-400 mb-6 sm:mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronLeft size={14} className="rotate-180 opacity-30" />
          <Link to="/products" className="hover:text-black transition-colors capitalize">{product.category}</Link>
          <ChevronLeft size={14} className="rotate-180 opacity-30" />
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-[4/5] max-w-[280px] sm:max-w-sm mx-auto rounded-3xl bg-gray-50 overflow-hidden shadow-xl relative border border-gray-200/80">
              {/* MAIN IMAGE */}
              <img
                src={images[currentIndex]}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-contain p-4 transition-all duration-500"
              />

              {/* CATEGORY BADGE */}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-md border border-gray-200">
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
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow hover:bg-black hover:text-white transition z-10"
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow hover:bg-black hover:text-white transition z-10"
                >
                  ›
                </button>
              )}

              {/* DOT INDICATORS */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                        currentIndex === index ? "bg-black scale-110" : "bg-gray-300"
                      }`}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col h-full">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">₹{product.price}</span>
              </div>

              <div className="h-px bg-gray-100 w-full mb-5"></div>

              {product?.sizeStock && product.sizeStock.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-0.5">
                      Select Size
                    </label>
                    {selectedSizeData && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${maxStock > 0 ? 'text-black bg-gray-100 border-gray-300' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>
                        {maxStock > 0 ? `${maxStock} Available` : 'Sold Out'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {product.sizeStock.map((item) => (
                      <button
                        key={item.size}
                        onClick={() => item.stock > 0 && setSelectedSize(item.size)}
                        disabled={item.stock === 0}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 text-xs font-black transition-all flex items-center justify-center relative
                          ${
                            selectedSize === item.size
                              ? "bg-black text-white border-black shadow-md scale-105"
                              : item.stock > 0
                              ? "bg-white text-gray-900 border-gray-200 hover:border-black"
                              : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50 overflow-hidden"
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
              <div className="mb-6">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Select Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-200 shadow-inner">
                    <button 
                      onClick={() => qty > 1 && setQty(qty - 1)}
                      disabled={qty <= 1}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 transition-all active:scale-90
                      ${qty <= 1 ? "opacity-30 cursor-not-allowed" : "hover:text-black font-bold"}`}
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-12 text-center font-black text-xl text-gray-900">{qty}</span>
                    <button 
                      onClick={() => qty < maxStock && setQty(qty + 1)}
                      disabled={qty >= maxStock || maxStock === 0}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 transition-all active:scale-90
                      ${(qty >= maxStock || maxStock === 0) ? "opacity-30 cursor-not-allowed" : "hover:text-black font-bold"}`}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</span>
                    <span className="text-xs font-black mt-1 text-black">
                      {maxStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button 
                  onClick={handleAddToCart}
                  disabled={maxStock === 0 || !selectedSize}
                  className="flex-grow bg-black text-white font-black py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  Add to Bag
                </button>
                <button 
                  onClick={handleAddToCart}
                  disabled={maxStock === 0 || !selectedSize}
                  className="flex-grow bg-gray-100 text-gray-900 border border-gray-300 font-black py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-gray-200 transition-all active:scale-[0.98] uppercase tracking-wider text-xs"
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
