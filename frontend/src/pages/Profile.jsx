import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Loader2, CheckCircle, Package, History, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getMyOrders } from '../services/api';
import { useSocket } from '../context/SocketContext';
import InvoiceModal from '../components/InvoiceModal';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);
  
  // 🔌 Real-time Socket Listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on('order:updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      toast.success(`Order status updated to: ${updatedOrder.status} ✨`, { duration: 5000 });
    });

    return () => {
      socket.off('order:updated');
    };
  }, [socket]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
      });
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Profile Card */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-200 sticky top-24">
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-black/10 mb-4 transition-transform hover:scale-105">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 font-medium text-sm flex items-center gap-2 mt-1 italic">
                <Mail size={14} className="text-black" /> {user?.email}
              </p>
              <div className="mt-4 px-4 py-1.5 bg-gray-100 text-gray-900 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-200">
                {user?.role === 'admin' ? 'Administrator' : 'Valued Customer'}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-black/10 focus:border-black transition-all font-bold text-gray-900"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-black/10 focus:border-black transition-all font-bold text-gray-900"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">New Password (Optional)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-black/10 focus:border-black transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-black/10 focus:border-black transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                Update Profile
              </button>
            </form>
          </div>
        </div>

        {/* Orders Section */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-black border border-gray-200">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h2>
              <p className="text-gray-500 font-medium italic">Your recent purchases and their status</p>
            </div>
          </div>

          {ordersLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-8 rounded-3xl h-48 animate-pulse border border-gray-200"></div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-[32px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all group">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-sm border border-gray-200">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Order ID</p>
                        <p className="text-sm font-black text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase text-right">Placed On</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-8 space-y-4">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-6 group/item">
                        <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 group-hover/item:scale-105 transition-transform duration-500 shadow-sm">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-black text-gray-900 tracking-tight truncate group-hover/item:text-black transition-colors">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                              Size: {item.selectedSize}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                              Qty: {item.qty}
                            </span>
                          </div>
                          <p className="text-black font-black text-lg mt-2 flex items-center gap-1">
                            ₹{item.price.toLocaleString()}
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">per unit</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm ${
                        order.status === 'delivered' ? 'bg-black text-white border-black' :
                        order.status === 'cancelled' ? 'bg-gray-200 text-gray-700 border-gray-300' :
                        order.status === 'shipped' ? 'bg-gray-800 text-white border-gray-800' :
                        'bg-black text-white border-black'
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-gray-900 border border-gray-300 hover:border-black rounded-full text-[11px] font-black uppercase tracking-wider transition-all hover:bg-black hover:text-white shadow-sm"
                      >
                        <Printer size={14} />
                        View / Print Bill
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mb-1">Total Order Value</p>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{order.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-black mb-6">
                <ShoppingBagIcon size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Orders Yet</h3>
              <p className="text-gray-500 max-w-xs mt-2 italic font-medium">Your stylish journey begins here. Start shopping our latest collection!</p>
              <button className="mt-8 bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95">
                Go Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};

const ShoppingBagIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export default Profile;
