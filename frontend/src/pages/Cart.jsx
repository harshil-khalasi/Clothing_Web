import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart, Info, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQty, totalAmount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-8 animate-bounce-slow">
          <ShoppingBag size={44} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h2>
        <p className="text-gray-500 max-w-sm mb-10 text-lg leading-relaxed font-medium">
          Looks like you haven't added anything to your cart yet. Let's find some amazing styles for you!
        </p>
        <Link 
          to="/products"
          className="bg-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 active:scale-95 flex items-center gap-3"
        >
          Start Shopping <ArrowRight size={22} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
      <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight flex items-center gap-4">
        <ShoppingCart className="text-pink-600 px-1 border-2 border-pink-600 rounded-lg" size={36} />
        Shopping Cart
        <span className="text-lg font-bold text-gray-400 ml-2">({cartItems.length} Items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div 
              key={item._id + item.selectedSize} // ✅ IMPORTANT
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-8 relative group"
            >
              <div className="w-full sm:w-32 aspect-[4/5] rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    {/* ✅ SIZE SHOW */}
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {item.selectedSize}
                    </p>
                  </div>

                  {/* ✅ REMOVE FIX */}
                  <button 
                    onClick={() => removeFromCart(item._id, item.selectedSize)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <p className="text-pink-600 font-black text-sm uppercase tracking-widest mb-4">{item.category}</p>
                
                <div className="flex flex-wrap items-center justify-between gap-6">
                  
                  {/* ✅ QTY FIX */}
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                    <button 
                      onClick={() => updateQty(item._id, item.selectedSize, 'dec')}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-900 hover:text-pink-600 border border-gray-100 shadow-sm active:scale-90 transition-all font-bold"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-12 text-center font-black text-lg text-gray-900">
                      {item.qty}
                    </span>

                    <button 
                      onClick={() => updateQty(item._id, item.selectedSize, 'inc')}
                      disabled={item.qty >= (item.sizeStock?.find(s => s.size === item.selectedSize)?.stock || 0)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-900 border border-gray-100 shadow-sm active:scale-90 transition-all font-bold ${
                        item.qty >= (item.sizeStock?.find(s => s.size === item.selectedSize)?.stock || 0)
                        ? "opacity-30 cursor-not-allowed text-gray-400"
                        : "hover:text-pink-600"
                      }`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 mb-1">Item Total</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl sticky top-24">
            <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4 tracking-tight">
              Order Summary
            </h3>
            
            <div className="space-y-5 mb-10">
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{totalAmount}</span>
              </div>

              <div className="flex justify-between text-gray-500 font-bold">
                <span>Shipping</span>
                <span className="text-green-600 uppercase text-xs font-black bg-green-50 px-2 py-0.5 rounded-md">
                  Free
                </span>
              </div>

              <div className="flex justify-between text-gray-500 font-bold">
                <span>Tax (GST)</span>
                <span className="text-gray-900">₹0</span>
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Total Amount
                    </p>
                    <p className="text-4xl font-black text-pink-600">
                      ₹{totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-pink-600 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 hover:bg-pink-700 transition-all active:scale-95 shadow-xl shadow-pink-200 uppercase tracking-widest text-sm"
            >
              Secure Checkout <ArrowRight size={20} />
            </button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-500 text-xs font-bold">
                <ShieldCheck size={16} className="text-pink-600" />
                <span>Encrypted & Secure Transaction</span>
              </div>

              <div className="flex items-center gap-3 text-gray-500 text-xs font-bold">
                <Info size={16} className="text-pink-600" />
                <span>Orders verified on WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Cart;