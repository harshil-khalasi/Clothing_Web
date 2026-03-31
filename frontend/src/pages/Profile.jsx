import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Loader2, CheckCircle, Package, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getMyOrders } from '../services/api';
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
          <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-8 border border-pink-50 sticky top-24">
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-pink-600 to-rose-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-pink-200 mb-4 transition-transform hover:scale-105">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 font-medium text-sm flex items-center gap-2 mt-1 italic">
                <Mail size={14} className="text-pink-500" /> {user?.email}
              </p>
              <div className="mt-4 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-widest border border-pink-100">
                {user?.role === 'admin' ? '🔥 Administrator' : '✨ Valued Customer'}
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
                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-bold text-gray-900"
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
                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-bold text-gray-900"
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
                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-bold text-gray-900"
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
                    className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all active:scale-95 shadow-lg shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-70"
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
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-pink-600">
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
                <div key={i} className="bg-white p-8 rounded-3xl h-48 animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-pink-50/50 transition-all group border-l-4 border-l-pink-600">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 tracking-widest uppercase">
                        <Package size={14} className="text-pink-500" />
                        Order #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <p className="text-gray-500 text-xs font-semibold">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-pink-50/50 px-3 py-1.5 rounded-xl border border-pink-100">
                            <span className="text-[10px] font-black text-pink-600 bg-white w-5 h-5 flex items-center justify-center rounded-full border border-pink-200">
                              {item.qty}
                            </span>
                            <span className="text-xs font-bold text-gray-700">{item.name}</span>
                            <span className="text-[10px] font-black uppercase text-pink-400">({item.selectedSize})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-3 min-w-[150px]">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-pink-50 text-pink-600 border-pink-100'
                      }`}>
                        {order.status}
                      </span>
                      <div className="text-2xl font-black text-gray-900">₹{order.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-400 mb-6">
                <ShoppingBagIcon size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Orders Yet</h3>
              <p className="text-gray-500 max-w-xs mt-2 italic font-medium">Your stylish journey begins here. Start shopping our latest collection!</p>
              <button className="mt-8 bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-pink-200 transition-all active:scale-95">
                Go Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ShoppingBagIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export default Profile;
