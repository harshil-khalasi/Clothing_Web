import React, { useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, PlusCircle, User, LogOut, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';
import logo from '../assets/logo.png';

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Users', path: '/admin/users', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo + Brand */}
        <Link to="/admin/dashboard" className="flex items-center gap-3 group">
          <img 
  src={logo} 
  alt="Logo" 
  className="w-10 h-10 object-contain rounded-xl shadow-lg shadow-pink-200 group-hover:rotate-6 transition-transform"
/>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-black text-gray-900 tracking-tight">MY WEARABLES</span>
            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>

        {/* Right: Links & Profile */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'text-pink-600' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`
                }
              >
                <link.icon size={18} />
                {link.name}
              </NavLink>
            ))}
            
            {/* Highlighted Add Product Button */}
            <Link
              to="/admin/add-product"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold text-sm transition-all shadow-lg active:scale-95 ${
                location.pathname === '/admin/add-product'
                  ? 'bg-pink-700 shadow-pink-100'
                  : 'bg-pink-600 hover:bg-pink-700 shadow-pink-200'
              }`}
            >
              <PlusCircle size={18} />
              Add Product
            </Link>
          </div>

          <div className="h-8 w-px bg-gray-100"></div>

          {/* Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100 hover:border-pink-200 transition-colors cursor-pointer group">
              <User size={20} className="group-hover:text-pink-600 transition-colors" />
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
