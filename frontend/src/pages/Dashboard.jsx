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
import { getAllProducts, getAllUsers } from '../services/api';

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
    users: 0,
    categories: 0,
    stockValue: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, users] = await Promise.all([
          getAllProducts(),
          getAllUsers()
        ]);

        const uniqueCats = new Set(products.map(p => p.category)).size;
        const totalStock = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

        setStats({
          products: products.length,
          users: users.length,
          categories: uniqueCats,
          stockValue: totalStock
        });

        setRecentProducts(products.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 size={48} className="text-pink-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2 font-medium">Overview of your My Wearables fashion store</p>
        </div>
        <Link 
          to="/admin/products" 
          className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 active:scale-95"
        >
          <Plus size={20} /> Manage Products
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardCard 
          icon={Package} 
          title="Total Products" 
          value={stats.products} 
          subtext="+2 added this week"
          color="bg-pink-600"
        />
        <DashboardCard 
          icon={Users} 
          title="Total Users" 
          value={stats.users} 
          subtext="From unified login system"
          color="bg-blue-600"
        />
        <DashboardCard 
          icon={LayoutGrid} 
          title="Categories" 
          value={stats.categories} 
          subtext="Men, Women, Kids"
          color="bg-purple-600"
        />
        <DashboardCard 
          icon={TrendingUp} 
          title="Stock Value" 
          value={`₹${stats.stockValue.toLocaleString()}`} 
          subtext="Total potential revenue"
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Products Table */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900">Recent Products</h3>
            <Link to="/admin/products" className="text-pink-600 text-sm font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-4">Product</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Price</th>
                  <th className="px-8 py-4">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-pink-50 text-pink-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-gray-900">₹{p.price}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-bold text-gray-600">{p.stock}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <div className="bg-gray-900 p-8 rounded-[40px] text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h3 className="text-xl font-black mb-6 relative z-10 tracking-tight">Quick Actions</h3>
            <div className="space-y-3 relative z-10">
              <Link to="/admin/products" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                <span className="font-bold">Add New Product</span>
                <Plus size={18} className="text-pink-600 group-hover:rotate-90 transition-transform" />
              </Link>
              <Link to="/admin/users" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                <span className="font-bold">View Customers</span>
                <Users size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
              </Link>
              <Link to="/" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                <span className="font-bold">View Live Store</span>
                <ArrowUpRight size={18} className="text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6">Inventory Health</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>In Stock</span>
                  <span className="text-gray-900">85%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[85%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Low Stock</span>
                  <span className="text-gray-900">10%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[10%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Out of Stock</span>
                  <span className="text-gray-900">5%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[5%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;