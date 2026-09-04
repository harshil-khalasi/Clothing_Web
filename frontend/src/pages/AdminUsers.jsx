import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Search, 
  Mail, 
  Shield, 
  User as UserIcon, 
  Calendar,
  Loader2,
  X,
  ShoppingBag,
  Package,
  CreditCard,
  MapPin,
  Phone,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllUsers, deleteUser, getUserOrders, getOrders, updateOrderStatus } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  /* ── Order state ── */
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [allOrdersList, setAllOrdersList] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [userOrderCounts, setUserOrderCounts] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchUsersAndOrders();
  }, []);

  const isOrderForUser = (order, user) => {
    if (!order || !user) return false;
    const oUserId = order.user?._id ? String(order.user._id) : order.user ? String(order.user) : null;
    const targetUserId = String(user._id);

    if (oUserId && oUserId === targetUserId) return true;
    if (user.email && order.paymentResult?.email_address && order.paymentResult.email_address.toLowerCase() === user.email.toLowerCase()) return true;
    if (user.name && order.customerName) {
      const uName = user.name.trim().toLowerCase();
      const cName = order.customerName.trim().toLowerCase();
      if (uName === cName || cName.includes(uName) || uName.includes(cName)) return true;
    }
    return false;
  };

  const fetchUsersAndOrders = async () => {
    try {
      setLoading(true);
      const [usersData, allOrders] = await Promise.all([
        getAllUsers(),
        getOrders().catch(() => [])
      ]);
      setUsers(usersData);
      setAllOrdersList(allOrders);

      // Map total order counts per user
      const countsMap = {};
      usersData.forEach(u => {
        const matchingOrders = allOrders.filter(o => isOrderForUser(o, u));
        countsMap[u._id] = matchingOrders.length;
      });
      setUserOrderCounts(countsMap);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsDeleting(id);
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert(err.message || 'Error deleting user');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleOpenUserOrders = async (user) => {
    setSelectedUser(user);
    setOrdersLoading(true);

    // Toggle inline row expansion as well
    setExpandedUserId(prev => prev === user._id ? null : user._id);

    try {
      let orders = await getUserOrders(user._id).catch(() => []);
      
      const fallbackOrders = allOrdersList.filter(o => isOrderForUser(o, user));
      
      // Combine unique orders
      const mergedMap = new Map();
      (orders || []).forEach(o => mergedMap.set(String(o._id), o));
      fallbackOrders.forEach(o => mergedMap.set(String(o._id), o));

      const finalOrdersList = Array.from(mergedMap.values());
      setUserOrders(finalOrdersList);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      const fallback = allOrdersList.filter(o => isOrderForUser(o, user));
      setUserOrders(fallback);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setUserOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: updated.status } : o));
      setAllOrdersList(prev => prev.map(o => o._id === orderId ? { ...o, status: updated.status } : o));
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] uppercase tracking-wider"><CheckCircle size={12} /> Delivered</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-[10px] uppercase tracking-wider"><Truck size={12} /> Shipped</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-extrabold text-[10px] uppercase tracking-wider"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[10px] uppercase tracking-wider"><Clock size={12} /> Pending</span>;
    }
  };

  const totalSpentBySelectedUser = userOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className="space-y-10 min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-indigo-600" size={32} />
            Customer Directory
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Manage users and view full customer order history</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 border border-indigo-100 shadow-sm">
           <Shield size={20} className="text-indigo-600" /> Access Security Enabled
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-sm group-hover:shadow-md text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
          <span>Active Customers: {users.length}</span>
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          <span>Total Roles: 2</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-gray-200">
                <th className="px-8 py-5">User Identity</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Order Activity</th>
                <th className="px-8 py-5">Registration Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-6"><div className="h-12 bg-gray-50 rounded-2xl"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const uOrders = allOrdersList.filter(o => isOrderForUser(o, u));
                  const isExpanded = expandedUserId === u._id;

                  return (
                    <React.Fragment key={u._id}>
                      <tr 
                        onClick={() => handleOpenUserOrders(u)}
                        className={`transition-colors group cursor-pointer ${isExpanded ? 'bg-indigo-50/60' : 'hover:bg-indigo-50/30'}`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-base shadow-sm ${
                              u.role === 'admin' 
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white' 
                                : 'bg-slate-100 text-slate-900 border border-slate-200'
                            }`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block text-sm group-hover:text-indigo-600 transition-colors">{u.name}</span>
                              <span className="text-gray-400 text-xs font-medium flex items-center gap-1">
                                <Mail size={12} /> {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl border font-extrabold text-[10px] uppercase tracking-widest ${
                            u.role === 'admin' 
                            ? 'bg-slate-950 text-white border-slate-900' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            <Shield size={11} className="opacity-70" />
                            {u.role}
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUserOrders(u);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md active:scale-95 group/btn"
                          >
                            <ShoppingBag size={14} />
                            <span>View Orders</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px]">
                              {userOrderCounts[u._id] || uOrders.length || 0}
                            </span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                            <Calendar size={13} className="text-gray-400" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="px-8 py-5 text-right">
                          {u.role !== 'admin' && (
                            <button 
                              onClick={(e) => handleDelete(e, u._id)}
                              disabled={isDeleting === u._id}
                              className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-50"
                              title="Delete User"
                            >
                              {isDeleting === u._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* ── Inline Expanded Orders Row ── */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/40">
                          <td colSpan="5" className="px-8 py-6 border-b border-indigo-100">
                            <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-md space-y-4">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                                  <Package className="text-indigo-600" size={18} />
                                  Order Activity for {u.name} ({uOrders.length} Orders)
                                </h4>
                                <button 
                                  onClick={() => setExpandedUserId(null)}
                                  className="text-xs font-bold text-slate-400 hover:text-slate-900"
                                >
                                  Close Row
                                </button>
                              </div>

                              {uOrders.length > 0 ? (
                                <div className="space-y-4">
                                  {uOrders.map((ord) => (
                                    <div key={ord._id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
                                      <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-slate-900">
                                        <div className="flex items-center gap-2">
                                          <span>Invoice #{ord.invoiceNumber || ord._id.slice(-8)}</span>
                                          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] uppercase font-black">
                                            {ord.orderType === 'pos' ? 'POS Counter' : 'Online'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getStatusBadge(ord.status)}
                                          <a
                                            href={`http://${window.location.hostname}:5000/api/orders/${ord._id}/pdf`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-[11px] flex items-center gap-1 hover:bg-indigo-600 transition-colors"
                                          >
                                            <FileText size={12} /> PDF Bill
                                          </a>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                                        <div>Phone: <strong>{ord.phoneNumber || 'N/A'}</strong></div>
                                        <div>Payment: <strong>{ord.paymentMethod || 'Razorpay'}</strong> ({ord.isPaid ? 'PAID' : 'Pending'})</div>
                                        <div className="sm:col-span-2">Address: {ord.shippingAddress || 'Store Counter'}</div>
                                      </div>

                                      <div className="space-y-1.5">
                                        {ord.orderItems?.map((it, i) => (
                                          <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-2">
                                              <img src={it.image} alt={it.name} className="w-8 h-8 object-cover rounded" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200';}} />
                                              <span className="font-bold text-slate-800">{it.name} ({it.selectedSize || 'Std'}) x {it.qty}</span>
                                            </div>
                                            <span className="font-black text-slate-900">₹{(it.price * it.qty).toLocaleString()}</span>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="flex justify-between items-center pt-2 font-black text-sm text-indigo-700">
                                        <span>Total Amount:</span>
                                        <span>₹{ord.totalPrice.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 font-medium">No order history found for this user.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                      <UserIcon size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Customers Found</h3>
                    <p className="text-gray-400 text-xs mt-1">Try searching with a different keyword.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          USER ORDER ACTIVITY MODAL DRAWER (z-[9999])
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
            className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] my-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 relative shrink-0">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{selectedUser.name}</h2>
                      <p className="text-indigo-200 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                        <Mail size={13} /> {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Summary pills */}
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-center">
                      <span className="text-[10px] text-indigo-300 font-extrabold uppercase block tracking-wider">Total Orders</span>
                      <span className="text-lg font-black text-white">{userOrders.length}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-center">
                      <span className="text-[10px] text-indigo-300 font-extrabold uppercase block tracking-wider">Total Spent</span>
                      <span className="text-lg font-black text-emerald-400">₹{totalSpentBySelectedUser.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body / Orders List */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Package className="text-indigo-600" size={20} /> Order Activity History
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    Registered: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {ordersLoading ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Fetching customer orders...</p>
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div 
                        key={order._id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Order Info Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">
                                Invoice #{order.invoiceNumber || order._id.slice(-8)}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                                order.orderType === 'pos' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {order.orderType === 'pos' ? 'POS Counter' : 'Online'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(order.status)}
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order._id}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            <a
                              href={`http://${window.location.hostname}:5000/api/orders/${order._id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <FileText size={14} /> PDF Bill
                            </a>
                          </div>
                        </div>

                        {/* Customer & Shipping summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5 my-3">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-indigo-600 shrink-0" />
                            <span>Phone: <strong>{order.phoneNumber || 'N/A'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-indigo-600 shrink-0" />
                            <span>Payment: <strong>{order.paymentMethod || 'Razorpay'}</strong> ({order.isPaid ? 'PAID' : 'Pending'})</span>
                          </div>
                          <div className="sm:col-span-2 flex items-start gap-2">
                            <MapPin size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">Address: {order.shippingAddress || 'Store Pickup'}</span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-2">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'; }}
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                                  <span className="text-slate-400 text-[11px]">Size: {item.selectedSize || 'Std'} | Qty: {item.qty}</span>
                                </div>
                              </div>
                              <span className="font-black text-slate-900 shrink-0 pl-2">
                                ₹{(item.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total Footer */}
                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Order Grand Total</span>
                          <span className="text-base font-black text-indigo-600">₹{order.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                      <ShoppingBag size={28} />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">No Orders Found</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      This customer has not placed any orders yet.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;


