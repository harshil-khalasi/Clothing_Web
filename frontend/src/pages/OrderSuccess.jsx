import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight, Package, Truck, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const OrderSuccess = () => {
  const { id } = useParams();
  const [orderDate, setOrderDate] = useState("");

  useEffect(() => {
    setOrderDate(new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-600" size={64} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Order Placed!</h1>
        <p className="text-gray-500 font-medium mb-8">
          Thank you for your purchase. Your order is being processed.
        </p>

        <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</span>
            <span className="text-sm font-bold text-gray-900">#{id?.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Date</span>
            <span className="text-sm font-bold text-gray-900">{orderDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
              Paid via Razorpay
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            <Package size={18} />
            View Orders
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-pink-600 text-white font-black py-4 rounded-2xl hover:bg-pink-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>

        <div className="mt-10 pt-10 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
            <Truck size={14} className="text-gray-300" /> Standard Delivery: 3-5 Working Days
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
