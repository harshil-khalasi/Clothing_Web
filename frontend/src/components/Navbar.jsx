import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "MEN", path: "/products?category=Men" },
    { name: "WOMEN", path: "/products?category=Women" },
    { name: "KIDS", path: "/products?category=Kids" },
    { name: "HOME", path: "/products?category=Home" },
    { name: "BEAUTY", path: "/products?category=Beauty" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* LEFT - LOGO */}
          <Link to="/" className="flex items-center gap-2 min-w-[220px]">
            <img
              src={logo}
              alt="logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold">My Wearables</span>
          </Link>

          {/* CENTER - NAV LINKS */}
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="hover:text-pink-600 transition"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 max-w-xl mx-10 hidden md:block">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="bg-transparent outline-none ml-2 w-full text-sm"
              />
            </div>
          </div>

          {/* RIGHT - ACTIONS */}
          <div className="flex items-center gap-6 text-sm">

            {/* Profile */}
            <Link className="flex flex-col items-center text-gray-700 hover:text-pink-600">
              <User size={20} />
              <span className="text-xs">Profile</span>
            </Link>

            {/* Wishlist */}
            <Link className="flex flex-col items-center text-gray-700 hover:text-pink-600">
              <Heart size={20} />
              <span className="text-xs">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex flex-col items-center text-gray-700 hover:text-pink-600"
            >
              <ShoppingCart size={20} />
              <span className="text-xs">Bag</span>

              {cartItems.length > 0 && (
                <span className="absolute -top-1 right-2 bg-pink-600 text-white text-[10px] px-1.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* ADMIN */}
            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="hidden md:flex items-center gap-1 hover:text-pink-600"
              >
                <LayoutDashboard size={18} />
                Admin
              </Link>
            )}

            {/* LOGOUT */}
            {user ? (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 text-gray-700 hover:text-red-500"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm"
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