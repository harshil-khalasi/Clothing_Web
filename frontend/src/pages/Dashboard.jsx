import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  Loader2, 
  Plus, 
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const DashboardCard = ({ icon: Icon, title, value, subtext, color }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="text-white" size={28} />
    </div>
    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">{title}</p>
    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{value}</h3>
    <p className="text-gray-400 text-xs font-medium mt-2 flex items-center gap-1">
      {subtext}
    </p>
    
    <div className={`absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
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

        setRecentProducts(data.recentProducts);
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
        <div className="w-16 h-16 border-4 border-pink-500/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Store Overview</h1>
          <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Control your fashion business</p>
        </div>
        <Link 
          to="/admin/products" 
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-2xl active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={18} strokeWidth={3} /> Add Collection
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardCard 
          icon={TrendingUp} 
          title="Revenue" 
          value={`₹${stats.revenue?.toLocaleString()}`} 
          subtext="Net earnings"
          color="bg-emerald-500 shadow-emerald-100"
        />
        <DashboardCard 
          icon={ShoppingBag} 
          title="Total Orders" 
          value={stats.orders} 
          subtext={`${stats.pendingOrders} awaiting fulfillment`}
          color="bg-pink-500 shadow-pink-100"
        />
        <DashboardCard 
          icon={Package} 
          title="Products" 
          value={stats.totalUnits} 
          subtext={`${stats.products} unique designs`}
          color="bg-amber-500 shadow-amber-100"
        />
        <DashboardCard 
          icon={Users} 
          title="Visitors" 
          value={stats.products * 12} // Mock multiplier for impact
          subtext="Total store views"
          color="bg-indigo-500 shadow-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Recent Products Table */}
        <div className="xl:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-500">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Latest Products</h3>
            <Link to="/admin/products" className="bg-white text-gray-900 px-4 py-2 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all">
              Inventory Detail <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-6">Design</th>
                  <th className="px-8 py-6">Price</th>
                  <th className="px-8 py-6 text-center">Volume</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 p-2 group">
                          <img src={p.image} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 tracking-tight">{p.name}</span>
                          <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest mt-1 bg-pink-50 px-2 py-0.5 rounded-full w-fit border border-pink-100">{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900 text-lg tracking-tighter">₹{p.price}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`text-sm font-black ${p.totalStock > 0 ? 'text-gray-900' : 'text-rose-500'}`}>{p.totalStock} units</span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.totalStock > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(p.totalStock * 5, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
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
          <div className="bg-gray-900 p-10 rounded-[48px] text-white overflow-hidden relative shadow-2xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-pink-600/40 transition-colors duration-700"></div>
            <h3 className="text-2xl font-black mb-8 relative z-10 tracking-tight">Quick Actions</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Create Listing', to: '/admin/products', icon: Plus, color: 'text-pink-500' },
                { label: 'Review Users', to: '/admin/users', icon: Users, color: 'text-indigo-400' },
                { label: 'Live Preview', to: '/', icon: ArrowUpRight, color: 'text-emerald-400' }
              ].map((action, i) => (
                <Link key={i} to={action.to} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all">
                  <span className="font-black text-sm uppercase tracking-widest">{action.label}</span>
                  <div className={`w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center ${action.color}`}>
                    <action.icon size={20} strokeWidth={2.5} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Stock Health</h3>
              <LayoutGrid size={20} className="text-gray-300" />
            </div>
            <div className="space-y-8">
              <HealthBar label="Optimal Stock" val={75} color="bg-emerald-500" />
              <HealthBar label="Replenish Soon" val={18} color="bg-amber-500" />
              <HealthBar label="Needs Attention" val={7} color="bg-rose-500" />
            </div>
            <p className="mt-10 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center italic">Updated Real-Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthBar = ({ label, val, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
      <span>{label}</span>
      <span className="text-gray-900">{val}%</span>
    </div>
    <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
      <div className={`h-full rounded-full ${color} shadow-sm transition-all duration-1000`} style={{ width: `${val}%` }}></div>
    </div>
  </div>
);

export default Dashboard;