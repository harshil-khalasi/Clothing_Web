import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Users,
  ClipboardList,
  Store
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'POS Billing', icon: <Store size={20} />, path: '/admin/pos' },
    { name: 'Products', icon: <ShoppingBag size={20} />, path: '/admin/products' },
    { name: 'Orders', icon: <ClipboardList size={20} />, path: '/admin/orders' },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex items-center gap-4 border-b border-gray-100">
        <img 
          src={logo} 
          alt="My Wearables Logo" 
          className="w-12 h-12 object-contain"
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-gray-900 leading-tight tracking-tight">
            My Wearables
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-black text-white shadow-lg shadow-black/10'
                : 'text-gray-600 hover:bg-gray-100 hover:text-black font-semibold'
              }`
            }
          >
            <span className="transition-transform group-hover:scale-110">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-100">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Admin Pro</p>
          <p className="text-sm text-gray-500 font-medium">Access all management features.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
