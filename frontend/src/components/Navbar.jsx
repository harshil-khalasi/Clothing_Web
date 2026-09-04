import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "PRODUCTS", path: "/products" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-indigo-100/60 shadow-lg shadow-indigo-500/5 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* LEFT - LOGO */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <img
                src={logo}
                alt="logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain relative rounded-xl"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                My <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Wearables</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-indigo-500 tracking-widest uppercase -mt-0.5 sm:-mt-1">
                Luxury Edition
              </span>
            </div>
          </Link>

          {/* CENTER - NAV LINKS */}
          <div className="hidden lg:flex items-center gap-8 font-extrabold text-xs tracking-wider">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path || (link.path === "/" && location.pathname === "/");
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-2 transition-colors duration-300 ${
                    isActive ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-sm shadow-indigo-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/50 border border-slate-200/80 px-4 py-2.5 rounded-full transition-all duration-300 shadow-inner">
              <Search size={17} className="text-indigo-500 shrink-0" />
              <input
                type="text"
                placeholder="Search premium apparel, styles & designs..."
                className="bg-transparent outline-none ml-2.5 w-full text-xs font-medium text-slate-800 placeholder:text-slate-400"
              />
              <Sparkles size={14} className="text-pink-400 opacity-60 ml-1 shrink-0" />
            </div>
          </div>

          {/* RIGHT - ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-5 text-xs font-bold shrink-0">

            {/* Profile */}
            <Link
              to="/profile"
              className="flex flex-col items-center gap-0.5 sm:gap-1 text-slate-600 hover:text-indigo-600 transition-all duration-300 group p-1"
            >
              <div className="p-1.5 sm:p-2 rounded-xl group-hover:bg-indigo-50 transition-colors">
                <User size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-extrabold hidden sm:block">Profile</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex flex-col items-center gap-0.5 sm:gap-1 text-slate-600 hover:text-indigo-600 transition-all duration-300 group p-1"
            >
              <div className="p-1.5 sm:p-2 rounded-xl group-hover:bg-indigo-50 transition-colors relative">
                <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-black shadow-md shadow-rose-500/40 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-extrabold hidden sm:block">Bag</span>
            </Link>

            {/* LOGOUT / LOGIN */}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-600 hover:text-rose-600 transition-colors p-1.5 sm:p-2 rounded-xl hover:bg-rose-50"
              >
                <LogOut size={16} />
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider hidden sm:block">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all duration-300 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;