import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight, Package, Truck, Calendar, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { getOrderById } from "../services/api";
import InvoiceModal from "../components/InvoiceModal";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderDate, setOrderDate] = useState("");

  useEffect(() => {
    setOrderDate(new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }));

    if (id) {
      getOrderById(id)
        .then(data => setOrder(data))
        .catch(err => console.error("Error fetching order for invoice:", err));
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-black p-4 rounded-full text-white">
            <CheckCircle className="text-white" size={64} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Order Placed!</h1>
        <p className="text-gray-500 font-medium mb-8">
          Thank you for your purchase. Your order is being processed.
        </p>

        <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-200 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Order / Invoice ID</span>
            <span className="text-sm font-bold text-gray-900">#{order?.invoiceNumber || id?.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Date</span>
            <span className="text-sm font-bold text-gray-900">{orderDate}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Status</span>
            <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
              Paid via {order?.paymentMethod || 'Razorpay'}
            </span>
          </div>
          {order && (
            <button
              onClick={() => setShowInvoice(true)}
              className="w-full flex items-center justify-center gap-2 bg-black text-white font-black py-3 rounded-2xl hover:bg-gray-800 transition-all uppercase tracking-widest text-xs shadow-md mt-2"
            >
              <Printer size={16} />
              View & Print Invoice Bill
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-900 border border-gray-300 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            <Package size={18} />
            View Orders
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 uppercase tracking-widest text-xs shadow-xl shadow-black/10"
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

      {/* Invoice Modal */}
      {showInvoice && order && (
        <InvoiceModal
          order={order}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

export default OrderSuccess;
