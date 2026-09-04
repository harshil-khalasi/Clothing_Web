import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  Plus, 
  LayoutGrid,
  ChevronRight,
  User,
  Phone,
  MessageCircle,
  FileText,
  Store,
  Globe,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import InvoiceModal from '../components/InvoiceModal';

const DashboardCard = ({ icon: Icon, title, value, subtext }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-200 hover:shadow-xl transition-all group relative overflow-hidden">
    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/10">
      <Icon className="text-white" size={28} />
    </div>
    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">{title}</p>
    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{value}</h3>
    <p className="text-gray-500 text-xs font-medium mt-2 flex items-center gap-1">
      {subtext}
    </p>
    
    <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      <Icon size={120} />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    totalUnits: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardStats();
        const data = response.data;

        setStats({
          products: data.totalProducts,
          totalUnits: data.totalStockUnits,
          orders: data.totalOrders,
          revenue: data.totalRevenue,
          pendingOrders: data.pendingOrders
        });

        setRecentProducts(data.recentProducts || []);
        setRecentOrders(data.recentOrders || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Store Overview</h1>
          <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Control your fashion business & live orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/pos" 
            className="bg-black text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest"
          >
            <Store size={18} /> Open POS Counter
          </Link>
          <Link 
            to="/admin/products" 
            className="bg-gray-100 text-gray-900 border border-gray-300 px-6 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-gray-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardCard 
          icon={TrendingUp} 
          title="Revenue" 
          value={`₹${stats.revenue?.toLocaleString()}`} 
          subtext="Net store earnings"
        />
        <DashboardCard 
          icon={ShoppingBag} 
          title="Total Orders" 
          value={stats.orders} 
          subtext={`${stats.pendingOrders} awaiting processing`}
        />
        <DashboardCard 
          icon={Package} 
          title="Products" 
          value={stats.totalUnits} 
          subtext={`${stats.products} unique designs`}
        />
        <DashboardCard 
          icon={Users} 
          title="Visitors" 
          value={stats.products * 12} 
          subtext="Total store views"
        />
      </div>

      {/* NEW: Recent Customer Purchases Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-500">
        <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="text-black" size={22} />
              Recent Customer Sales & Purchases
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Live customer buyers, product names, phone numbers & bill actions</p>
          </div>
          <Link to="/admin/orders" className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md">
            All Orders <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-6 py-5">Customer / Buyer</th>
                <th className="px-6 py-5">Phone Number</th>
                <th className="px-6 py-5">Product(s) Purchased</th>
                <th className="px-6 py-5 text-right">Bill Total</th>
                <th className="px-6 py-5 text-center">Type</th>
                <th className="px-6 py-5 text-center">Invoice Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-bold">
                    No recent customer orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const customerName = order.customerName || order.user?.name || 'Walk-in Customer';
                  const phoneNo = order.phoneNumber || order.user?.phoneNumber || 'N/A';
                  const cleanPhone = phoneNo.replace(/\D/g, '');

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Customer Name */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-900 text-xs shrink-0">
                            <User size={16} className="text-gray-700" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 tracking-tight">{customerName}</p>
                            <p className="text-[10px] text-gray-400 font-mono">#{order.invoiceNumber || order._id?.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-700 font-bold">
                          <Phone size={14} className="text-gray-400 shrink-0" />
                          <span>{phoneNo}</span>
                          {cleanPhone && (
                            <a 
                              href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="ml-1 p-1 text-black hover:bg-gray-100 rounded-lg transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Product Name(s) */}
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 max-w-xs">
                          {order.orderItems?.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                              <span className="font-black text-gray-900 line-clamp-1">{item.name}</span>
                              <span className="text-[10px] font-extrabold text-gray-500 shrink-0 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                Size: {item.selectedSize || 'Std'} | x{item.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Bill Total */}
                      <td className="px-6 py-5 text-right font-black text-gray-900 text-base tracking-tight">
                        ₹{(order.totalPrice || 0).toFixed(2)}
                      </td>

                      {/* Order Type */}
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          order.orderType === 'pos' 
                            ? 'bg-black text-white border-black' 
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {order.orderType === 'pos' ? <Store size={12} /> : <Globe size={12} />}
                          {order.orderType === 'pos' ? 'POS Counter' : 'Online Store'}
                        </span>
                      </td>

                      {/* Invoice Bill Button */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="inline-flex items-center gap-1.5 bg-black text-white px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                          title="View, Print & Download Invoice"
                        >
                          <FileText size={14} />
                          View Bill
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Latest Products & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Recent Products Table */}
        <div className="xl:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-500">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Latest Products in Inventory</h3>
            <Link to="/admin/products" className="bg-white text-gray-900 px-4 py-2 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all">
              Inventory Detail <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="px-8 py-6">Design</th>
                  <th className="px-8 py-6">Price</th>
                  <th className="px-8 py-6 text-center">Volume</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-200 p-2 group">
                          <img src={p.image} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 tracking-tight">{p.name}</span>
                          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-1 bg-gray-100 px-2 py-0.5 rounded-full w-fit border border-gray-200">{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900 text-lg tracking-tighter">₹{p.price}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`text-sm font-black ${p.totalStock > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{p.totalStock} units</span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.totalStock > 10 ? 'bg-black' : 'bg-gray-400'}`} style={{ width: `${Math.min(p.totalStock * 5, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${p.status === 'active' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        {p.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Insights */}
        <div className="space-y-8">
          <div className="bg-black p-10 rounded-[48px] text-white overflow-hidden relative shadow-2xl group border border-gray-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>
            <h3 className="text-2xl font-black mb-8 relative z-10 tracking-tight">Quick Actions</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Create Listing', to: '/admin/products', icon: Plus },
                { label: 'Review Orders', to: '/admin/orders', icon: ShoppingBag },
                { label: 'Review Users', to: '/admin/users', icon: Users },
                { label: 'Live Preview', to: '/', icon: ArrowUpRight }
              ].map((action, i) => (
                <Link key={i} to={action.to} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all">
                  <span className="font-black text-sm uppercase tracking-widest">{action.label}</span>
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                    <action.icon size={20} strokeWidth={2.5} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[48px] border border-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-500">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Stock Health</h3>
              <LayoutGrid size={20} className="text-gray-400" />
            </div>
            <div className="space-y-8">
              <HealthBar label="Optimal Stock" val={75} color="bg-black" />
              <HealthBar label="Replenish Soon" val={18} color="bg-gray-600" />
              <HealthBar label="Needs Attention" val={7} color="bg-gray-300" />
            </div>
            <p className="mt-10 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center italic">Updated Real-Time</p>
          </div>
        </div>
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

const HealthBar = ({ label, val, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
      <span>{label}</span>
      <span className="text-gray-900">{val}%</span>
    </div>
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
      <div className={`h-full rounded-full ${color} shadow-sm transition-all duration-1000`} style={{ width: `${val}%` }}></div>
    </div>
  </div>
);

export default Dashboard;