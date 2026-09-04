import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ExternalLink,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Printer
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/api';
import { useSocket } from '../context/SocketContext';
import InvoiceModal from '../components/InvoiceModal';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh list
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // 🔌 Real-time Socket Listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on('order:placed', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      toast.success('New order received! 🛍️', { duration: 5000 });
    });

    socket.on('order:updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('product:updated', (updatedProd) => {
      setOrders(prev => prev.map(order => ({
        ...order,
        orderItems: order.orderItems.map(item => 
          item.product === updatedProd._id ? { ...item, name: updatedProd.name, image: updatedProd.image } : item
        )
      })));
    });

    return () => {
      socket.off('order:placed');
      socket.off('order:updated');
      socket.off('product:updated');
    };
  }, [socket]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phoneNumber && order.phoneNumber.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-900 border-gray-300';
      case 'shipped': return 'bg-gray-800 text-white border-gray-800';
      case 'delivered': return 'bg-black text-white border-black';
      case 'cancelled': return 'bg-gray-200 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm border-t-4 border-t-black">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="text-black" size={24} />
            Order Management
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage customer online and POS counter orders, view bills & delivery status.</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:outline-none transition-all w-48 sm:w-56 text-xs font-medium"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black focus:outline-none transition-all appearance-none text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-gray-100 border border-gray-300 p-4 rounded-2xl flex items-center gap-3 text-gray-900 text-xs font-bold">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Orders List (Compact Cards) */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-gray-300" size={28} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">No orders found</h3>
            <p className="text-xs text-gray-500 font-medium">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all space-y-3">
              {/* Row 1: Header (Order ID, Type, Customer, Status, Price) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    order.orderType === 'pos' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}>
                    {order.orderType === 'pos' ? 'POS Counter' : 'Online'}
                  </span>
                  <span className="text-xs font-black text-black tracking-wider">#{order.invoiceNumber || order._id.slice(-8)}</span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                    <User size={14} className="text-gray-400" />
                    <span>{order.customerName || order.user?.name || 'Customer'}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                    <Clock size={12} />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-black tracking-tight">₹{order.totalPrice}</span>
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Row 2: Customer Contact & Items List */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Contact Info (4 cols) */}
                <div className="md:col-span-4 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span className="font-bold text-gray-900">{order.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-600 line-clamp-1">{order.shippingAddress || 'Store Pickup'}</span>
                  </div>
                </div>

                {/* Items Summary (8 cols) */}
                <div className="md:col-span-8 flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase shrink-0">Items ({order.orderItems.length}):</span>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200/80">
                      <img src={item.image} alt="" className="w-7 h-7 rounded-lg object-cover border border-gray-200 shrink-0" />
                      <div className="text-[11px] leading-tight">
                        <p className="font-black text-gray-900 line-clamp-1 max-w-[120px]">{item.name}</p>
                        <p className="text-gray-500 font-semibold text-[9px]">{item.selectedSize} × {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                <button
                  onClick={() => setSelectedInvoiceOrder(order)}
                  className="flex items-center gap-1.5 bg-black text-white px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                >
                  <Printer size={14} />
                  Print Bill
                </button>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button 
                    onClick={() => handleStatusUpdate(order._id, 'shipped')}
                    disabled={order.status === 'shipped'}
                    className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl font-bold text-[11px] uppercase tracking-wider text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-40"
                  >
                    <Truck size={13} />
                    Ship
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(order._id, 'delivered')}
                    disabled={order.status === 'delivered'}
                    className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl font-bold text-[11px] uppercase tracking-wider text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-40"
                  >
                    <CheckCircle size={13} />
                    Deliver
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                    disabled={order.status === 'cancelled'}
                    className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl font-bold text-[11px] uppercase tracking-wider text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-40"
                  >
                    <XCircle size={13} />
                    Cancel
                  </button>
                  <button 
                    onClick={() => window.open(`https://wa.me/${order.phoneNumber}`, '_blank')}
                    className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl font-bold text-[11px] uppercase tracking-wider text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all"
                  >
                    <ExternalLink size={13} />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invoice Modal Popup */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminOrders;
