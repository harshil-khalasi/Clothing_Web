import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Users,
  ClipboardList,
  ShoppingBasket
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Products', icon: <ShoppingBag size={20} />, path: '/admin/products' },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex items-center gap-4">
  
  {/* Logo */}
  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center shadow-md">
    <img 
      src={logo} 
      alt="logo" 
      className="w-12 h-12 object-contain scale-150"
    />
  </div>

  {/* Text */}
  <div className="flex flex-col">
    <h1 className="text-xl font-bold text-gray-900 leading-tight">
      My Wearables
    </h1>
    <p className="text-sm text-gray-500">
      Admin Dashboard
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
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
              }`
            }
          >
            <span className="transition-transform group-hover:scale-110">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        <div className="bg-pink-50 rounded-2xl p-4">
          <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1">Admin Pro</p>
          <p className="text-sm text-gray-600">Access all premium features.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
