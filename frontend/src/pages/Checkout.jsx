import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  createOrder,
  getRazorpayOrderId,
  verifyPaymentServer,
} from "../services/api";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const initPayment = async (orderId, amount) => {
    try {
      const razorpayOrder = await getRazorpayOrderId(orderId);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "your_razorpay_key_here",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "My Wearables",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            setLoading(true);
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };
            const result = await verifyPaymentServer(orderId, verifyData);
            if (result.status === "success") {
              toast.success("Payment Successful!");
              clearCart();
              navigate(`/order-success/${orderId}`);
            }
          } catch (error) {
            toast.error("Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: user?.email,
          contact: formData.phone,
        },
        theme: {
          color: "#db2777", // pink-600
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      toast.error("Failed to initialize payment gateway");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setLoading(true);

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id || item.product,
          selectedSize: item.selectedSize,
        })),
        shippingAddress: formData.address,
        phoneNumber: formData.phone,
        totalPrice: totalAmount,
      };

      const createdOrder = await createOrder(orderData);
      
      // Proceed to Razorpay
      await initPayment(createdOrder._id, totalAmount);
    } catch (error) {
      console.error("Order Error:", error);
      toast.error(error.message || "Failed to initiate order.");
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
      <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight flex items-center gap-4">
        <CreditCard className="text-pink-600 px-1 border-2 border-pink-600 rounded-lg" size={36} />
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form Section */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl border-t-8 border-t-pink-600">
          <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
            <User className="text-pink-600" size={24} />
            Shipping Details
          </h3>

          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest ml-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-900 uppercase tracking-widest ml-1">
                Delivery Address
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-6 text-gray-400" />
                <textarea
                  name="address"
                  required
                  rows="4"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, Zip Code"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-medium resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-black py-5 rounded-[24px] mt-8 flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={22} fill="currentColor" />
                  Pay ₹{totalAmount} with Razorpay
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Secure Encrypted Payment · Powered by Razorpay
            </p>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="flex flex-col">
          <div className="bg-gray-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex-grow">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

            <h3 className="text-2xl font-black text-white mb-8 tracking-tighter flex items-center gap-3 relative z-10">
              <ShoppingCart className="text-pink-600" size={24} />
              Review Your Order
            </h3>

            <div className="space-y-6 mb-12 relative z-10 overflow-y-auto max-h-[350px] pr-4 scrollbar-thin scrollbar-thumb-pink-600 scrollbar-track-white/5">
              {cartItems.map((item) => (
                <div key={item._id || item.product} className="flex items-center gap-6 group">
                  <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden shrink-0 border border-white/10 group-hover:border-pink-600 transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm tracking-tight line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                      SIZE: {item.selectedSize} · QTY: {item.qty} · ₹{item.price}
                    </p>{" "}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-pink-600">₹{item.price * item.qty}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-8 mt-auto relative z-10">
              <div className="flex justify-between items-center mb-4 text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>Shipping fee</span>
                <span className="text-pink-600">Free</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Grand Total
                  </p>
                  <p className="text-5xl font-black text-white tracking-tighter">
                    ₹{totalAmount}
                  </p>
                </div>
                <div className="bg-pink-600/20 text-pink-600 px-4 py-2 rounded-xl border border-pink-600/30 flex items-center gap-2">
                  <ShieldCheck size={18} />
                  <span className="font-black text-xs uppercase tracking-widest">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate("/cart")}
              className="text-gray-500 font-bold hover:text-pink-600 flex items-center gap-2 transition-colors uppercase tracking-widest text-xs ml-4"
            >
              Modify Cart <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
