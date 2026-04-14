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
  AlertCircle
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

    // Handle product sync (if price/stock changes affect info here)
    socket.on('product:updated', (updatedProd) => {
      // Re-fetch to be safe if a product in an order was updated
      // Or just map if product name changed
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
      order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm border-t-8 border-t-pink-600">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <ShoppingBag className="text-pink-600" size={32} />
            Order Management
          </h1>
          <p className="text-gray-500 font-medium mt-2">Manage customer orders and track delivery status.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-pink-500 focus:outline-none transition-all w-64 text-sm font-medium"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-pink-500 focus:outline-none transition-all appearance-none text-sm font-bold uppercase tracking-widest cursor-pointer"
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
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-700">
          <AlertCircle size={24} />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Orders List */}
      <div className="grid gap-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 font-medium">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
              <div className="flex flex-col xl:flex-row">
                {/* Left Section: Info */}
                <div className="p-8 xl:w-2/3 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em]">Order #{order._id.slice(-8)}</p>
                      <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <User size={20} className="text-gray-400" />
                        {order.user?.name || 'Unknown User'}
                      </h4>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                          <Phone size={18} className="text-pink-600" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{order.phoneNumber}</span>
                      </div>
                      <div className="flex items-start gap-3 text-gray-600">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                          <MapPin size={18} className="text-pink-600" />
                        </div>
                        <span className="font-bold text-sm tracking-tight leading-relaxed">{order.shippingAddress}</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-[30px] p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Amount</p>
                      <p className="text-3xl font-black tracking-tighter">₹{order.totalPrice}</p>
                      <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-pink-600">
                        <Clock size={12} />
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="border-t border-gray-50 pt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-4">Ordered Items ({order.orderItems.length})</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-2xl border border-gray-100">
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div className="text-xs">
                            <p className="font-black text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-gray-500 font-bold tracking-tight">Size: {item.selectedSize} | Qty: {item.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section: Actions */}
                <div className="bg-gray-50 p-8 xl:w-1/3 border-l border-gray-100 flex flex-col justify-center gap-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Update Status</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleStatusUpdate(order._id, 'shipped')}
                      disabled={order.status === 'shipped'}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      <Truck size={16} />
                      Ship
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(order._id, 'delivered')}
                      disabled={order.status === 'delivered'}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-green-600 hover:border-green-600 hover:bg-green-50 transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Deliver
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                      disabled={order.status === 'cancelled'}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-600 hover:border-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/${order.phoneNumber}`, '_blank')}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-900 hover:border-pink-600 hover:bg-pink-50 transition-all"
                    >
                      <ExternalLink size={16} />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
